// Production app writes pass through this barrier. A backup waits for saves
// already in flight before reading or replacing the supported keys.
import AsyncStorage from "@react-native-async-storage/async-storage";

const pending = new Set();
const failedKeys = new Set();
let acquiring = false;
let exclusiveMode = null; // "read" for export, "restore" for replacement
let deferredWrites = [];

function track(promise) {
  pending.add(promise);
  promise.finally(() => pending.delete(promise)).catch(() => {});
  return promise;
}

function keysForWrite(method, args) {
  if (method === "multiSet") return args[0].map(([key]) => key);
  if (method === "multiRemove") return args[0];
  return [args[0]];
}

function startWrite(method, args) {
  const keys = keysForWrite(method, args);
  const promise = Promise.resolve().then(() => AsyncStorage[method](...args));
  promise.then(
    () => keys.forEach((key) => failedKeys.delete(key)),
    () => keys.forEach((key) => failedKeys.add(key)),
  );
  return track(promise);
}

function write(method, ...args) {
  if (exclusiveMode === "restore") {
    return Promise.reject(new Error("Storage is busy restoring a backup."));
  }
  if (exclusiveMode === "read") {
    // A save after the export snapshot begins must still reach storage.
    return new Promise((resolve, reject) => {
      deferredWrites.push({ method, args, resolve, reject });
    });
  }
  return startWrite(method, args);
}

export function clearFailedSaveErrors(keys) {
  keys.forEach((key) => failedKeys.delete(key));
}

export const appStorage = {
  getItem: (...args) => AsyncStorage.getItem(...args),
  multiGet: (...args) => AsyncStorage.multiGet(...args),
  setItem: (...args) => write("setItem", ...args),
  removeItem: (...args) => write("removeItem", ...args),
  multiSet: (...args) => write("multiSet", ...args),
  multiRemove: (...args) => write("multiRemove", ...args),
};

export async function withExclusiveStorage(operation, mode = "restore") {
  if (exclusiveMode || acquiring) throw new Error("A backup operation is already in progress.");
  acquiring = true;
  try {
    // Leave an event-loop turn for follow-up writes in async save helpers.
    do {
      const results = await Promise.allSettled([...pending]);
      if (results.some((result) => result.status === "rejected")) {
        throw new Error("A pending save failed. Please try again.");
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    } while (pending.size);
    if (mode === "read" && failedKeys.size) {
      throw new Error("Some changes could not be saved. Please retry those changes before exporting.");
    }
    exclusiveMode = mode;
    return await operation(AsyncStorage);
  } finally {
    exclusiveMode = null;
    acquiring = false;
    const queued = deferredWrites;
    deferredWrites = [];
    for (const { method, args, resolve, reject } of queued) {
      startWrite(method, args).then(resolve, reject);
    }
  }
}
