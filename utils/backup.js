import { STORAGE_KEYS } from "./storage";
import { withExclusiveStorage, clearFailedSaveErrors } from "./appStorage";

export const BACKUP_APP_ID = "com.andresbotia.ResolutionTracker";
export const BACKUP_SCHEMA_VERSION = 1;
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
const RECOVERY_KEY = "yt_backup_pre_import_v1";
const JOURNAL_KEY = "yt_backup_restore_in_progress_v1";
const RESTORED_EMPTY_KEY = STORAGE_KEYS.restoredEmpty;
const HABITS_KEY = "yt_habits_v1";
const HABITS_WELCOME_KEY = "yt_habits_welcome_seen_v1";
export const BACKUP_KEYS = Object.freeze([...Object.values(STORAGE_KEYS), HABITS_KEY, HABITS_WELCOME_KEY]);

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isString = (value) => typeof value === "string";
const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const validYear = (value) => /^\d{4}$/.test(value) && Number(value) >= 1900 && Number(value) <= 9999;
const utf8Size = (text) => {
  if (text.length > MAX_BACKUP_BYTES) return MAX_BACKUP_BYTES + 1;
  try { return encodeURIComponent(text).replace(/%[0-9A-F]{2}/g, "x").length; }
  catch { throw new Error("Backup text is unreadable."); }
};
const validDateKey = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

function validGoal(goal) {
  return isObject(goal) && isString(goal.id) && goal.id.length > 0 &&
    isString(goal.title) && ["count", "boolean"].includes(goal.type) &&
    (goal.target === null || isFiniteNumber(goal.target)) &&
    isFiniteNumber(goal.progress) && isFiniteNumber(goal.createdAt);
}

function validHabit(habit) {
  return isObject(habit) && isString(habit.id) && habit.id.length > 0 &&
    isString(habit.title) && isObject(habit.checks) &&
    Object.entries(habit.checks).every(([day, state]) => validDateKey(day) && [0, 1, 2].includes(state));
}

function validHistory(entry) {
  return isObject(entry) && isFiniteNumber(entry.year) && isFiniteNumber(entry.savedAt) &&
    Array.isArray(entry.goals) && entry.goals.every((goal) => validGoal(goal) ||
      (isObject(goal) && goal.createdAt === null && validGoal({ ...goal, createdAt: 0 }))) &&
    isObject(entry.summary) && isFiniteNumber(entry.summary.avgPercent) &&
    isFiniteNumber(entry.summary.completedCount) && isFiniteNumber(entry.summary.totalCount);
}

function validCustomTheme(theme) {
  return isObject(theme) && isString(theme.id) && theme.id.length > 0 &&
    isString(theme.name) && isFiniteNumber(theme.createdAt) &&
    isObject(theme.palette) && ["primary", "bg", "card", "border", "text", "mutedText", "primaryTextOn", "primaryPressed", "ringBg"]
      .every((key) => isString(theme.palette[key]));
}

function validatePayload(payload) {
  if (!isObject(payload) || Object.keys(payload).length !== BACKUP_KEYS.length ||
      BACKUP_KEYS.some((key) => !Object.prototype.hasOwnProperty.call(payload, key))) {
    throw new Error("Backup payload is incomplete or contains unsupported keys.");
  }
  for (const key of BACKUP_KEYS) {
    const raw = payload[key];
    if (raw === null) continue;
    if (!isString(raw)) throw new Error(`Invalid value for ${key}.`);
    let value;
    if ([STORAGE_KEYS.goals, STORAGE_KEYS.goalHistory, STORAGE_KEYS.customThemes, HABITS_KEY].includes(key)) {
      try { value = JSON.parse(raw); } catch { throw new Error(`Invalid JSON in ${key}.`); }
      const validator = key === STORAGE_KEYS.goals ? validGoal :
        key === STORAGE_KEYS.goalHistory ? validHistory :
        key === STORAGE_KEYS.customThemes ? validCustomTheme : validHabit;
      if (!Array.isArray(value) || !value.every(validator)) throw new Error(`Invalid records in ${key}.`);
    } else if ([STORAGE_KEYS.yearLegacy, STORAGE_KEYS.currentYear].includes(key)) {
      if (!validYear(raw)) throw new Error(`Invalid year in ${key}.`);
    } else if ([STORAGE_KEYS.welcomeSeen, STORAGE_KEYS.revampIntroSeen,
      STORAGE_KEYS.revampThemeChoiceSeen, STORAGE_KEYS.onboardingSeen, HABITS_WELCOME_KEY, RESTORED_EMPTY_KEY].includes(key)) {
      if (raw !== "1") throw new Error(`Invalid flag in ${key}.`);
    } else if (!raw.length) {
      throw new Error(`Invalid value for ${key}.`);
    }
  }
  return payload;
}

export function parseBackup(text) {
  if (typeof text !== "string" || utf8Size(text) > MAX_BACKUP_BYTES) {
    throw new Error("Backup file is too large or unreadable.");
  }
  let backup;
  try { backup = JSON.parse(text); } catch { throw new Error("This is not valid JSON."); }
  if (!isObject(backup) || backup.appId !== BACKUP_APP_ID) throw new Error("This is not a Yearly Tracker backup.");
  if (backup.schemaVersion !== BACKUP_SCHEMA_VERSION) throw new Error("This backup version is not supported.");
  if (!isString(backup.exportedAt) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(backup.exportedAt) || Number.isNaN(Date.parse(backup.exportedAt)) || new Date(backup.exportedAt).toISOString() !== backup.exportedAt) {
    throw new Error("Backup date is invalid.");
  }
  validatePayload(backup.payload);
  return backup;
}

export function backupPreview(backup) {
  const records = (key) => backup.payload[key] === null ? [] : JSON.parse(backup.payload[key]);
  return {
    exportedAt: backup.exportedAt,
    goals: records(STORAGE_KEYS.goals).length,
    habits: records(HABITS_KEY).length,
    history: records(STORAGE_KEYS.goalHistory).length,
    customThemes: records(STORAGE_KEYS.customThemes).length,
  };
}

async function readPayload(storage) {
  return Object.fromEntries(await storage.multiGet(BACKUP_KEYS));
}

async function applyPayload(storage, payload) {
  const present = BACKUP_KEYS.filter((key) => payload[key] !== null);
  const absent = BACKUP_KEYS.filter((key) => payload[key] === null);
  if (present.length) await storage.multiSet(present.map((key) => [key, payload[key]]));
  if (absent.length) await storage.multiRemove(absent);
}

async function verifyPayload(storage, payload) {
  const actual = await readPayload(storage);
  if (BACKUP_KEYS.some((key) => actual[key] !== payload[key])) {
    throw new Error("Restored data could not be verified.");
  }
}

export async function createBackup() {
  return withExclusiveStorage(async (storage) => {
    const backup = {
      appId: BACKUP_APP_ID,
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      payload: await readPayload(storage),
    };
    validatePayload(backup.payload);
    const json = JSON.stringify(backup);
    if (utf8Size(json) > MAX_BACKUP_BYTES) throw new Error("Backup exceeds the 10 MB file limit.");
    return json;
  }, "read");
}

export async function restoreBackup(backup) {
  validatePayload(backup.payload);
  return withExclusiveStorage(async (storage) => {
    const before = await readPayload(storage);
    const target = { ...backup.payload };
    if (target[STORAGE_KEYS.goals] === null || target[HABITS_KEY] === null) {
      target[RESTORED_EMPTY_KEY] = "1";
    }
    const recovery = JSON.stringify({ savedAt: new Date().toISOString(), payload: before });
    await storage.setItem(RECOVERY_KEY, recovery);
    await storage.setItem(JOURNAL_KEY, "1");
    try {
      await applyPayload(storage, target);
      await verifyPayload(storage, target);
      await storage.removeItem(JOURNAL_KEY);
      clearFailedSaveErrors(BACKUP_KEYS);
    } catch (error) {
      try {
        await applyPayload(storage, before);
        await verifyPayload(storage, before);
        await storage.removeItem(JOURNAL_KEY);
      } catch {
        const recoveryError = new Error("Restore failed and needs recovery before the app can continue.");
        recoveryError.code = "RESTORE_RECOVERY_REQUIRED";
        throw recoveryError;
      }
      throw new Error(`Restore failed and your previous data was recovered: ${error.message}`);
    }
  });
}

// Called before hydration. A crash during replacement leaves the journal set.
export async function recoverInterruptedRestore() {
  return withExclusiveStorage(async (storage) => {
    if (await storage.getItem(JOURNAL_KEY) !== "1") return false;
    const raw = await storage.getItem(RECOVERY_KEY);
    if (!raw) throw new Error("An interrupted restore has no recovery snapshot.");
    const recovery = JSON.parse(raw);
    validatePayload(recovery.payload);
    await applyPayload(storage, recovery.payload);
    await verifyPayload(storage, recovery.payload);
    await storage.removeItem(JOURNAL_KEY);
    clearFailedSaveErrors(BACKUP_KEYS);
    return true;
  });
}
