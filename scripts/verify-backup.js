const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const babel = require("@babel/core");

const data = new Map();
const artworkCalls = [];
let failArtwork = false;
const reactNativeMock = {
  Image: { resolveAssetSource: () => ({ uri: "file:///bundled-art.jpg" }) },
  NativeModules: { WidgetBridge: { setWidgetArtwork: (...args) => { artworkCalls.push(args); return !failArtwork; }, clearWidgetArtwork: () => artworkCalls.push(["clear"]) } },
  Platform: { OS: "ios" },
};
let failWrite = false;
let failRollback = false;
let failAppWrite = false;
let pauseRead = false;
let readStarted;
let releaseRead;
const fakeStorage = {
  getItem: async (key) => data.get(key) ?? null,
  setItem: async (key, value) => {
    if (failAppWrite && key === "rt_hue_v1") { failAppWrite = false; throw Error("save failed"); }
    if (failWrite && key === "yt_habits_v1") { failWrite = false; throw Error("disk failed"); }
    if (failRollback && key === "rt_goals_v1" && value === JSON.stringify([goal])) throw Error("rollback failed");
    data.set(key, value);
  },
  removeItem: async (key) => { data.delete(key); },
  multiGet: async (keys) => {
    if (pauseRead) {
      readStarted();
      await new Promise((resolve) => { releaseRead = resolve; });
    }
    return keys.map((key) => [key, data.get(key) ?? null]);
  },
  multiSet: async (pairs) => { for (const [key, value] of pairs) await fakeStorage.setItem(key, value); },
  multiRemove: async (keys) => { for (const key of keys) data.delete(key); },
};
const load = Module._load;
Module._load = function (id, parent, isMain) {
  if (id === "@react-native-async-storage/async-storage") return { __esModule: true, default: fakeStorage };
  if (id === "react-native") return reactNativeMock;
  if (id === "../assets/art/images") return { ART_IMAGES: { cypresses: 1 } };
  return load.call(this, id, parent, isMain);
};
const originalJs = Module._extensions[".js"];
Module._extensions[".js"] = function (module, filename) {
  if (!filename.includes("/utils/") && !filename.endsWith("/native/widgetArtwork.js")) return originalJs(module, filename);
  const source = fs.readFileSync(filename, "utf8");
  const transformed = babel.transformSync(source, { filename, configFile: false, babelrc: false, plugins: ["@babel/plugin-transform-modules-commonjs"] }).code;
  module._compile(transformed, filename);
};

const { createBackup, parseBackup, backupPreview, restoreBackup, recoverInterruptedRestore, BACKUP_APP_ID, BACKUP_KEYS } = require("../utils/backup");
const { appStorage } = require("../utils/appStorage");
const { loadGoalsWithMeta, loadCurrentYear, loadHue, loadCustomThemes, loadGoalHistory,
  BACKUP_ANNOUNCEMENT_SEEN_KEY, loadBackupAnnouncementSeen, setBackupAnnouncementSeen } = require("../utils/storage");
const { prepareWidgetArtwork } = require("../native/widgetArtwork");
const goal = { id: "g1", title: "Goal", type: "count", target: 10, progress: 3, createdAt: 123, extra: "keep" };
const habit = { id: "h1", title: "Habit", checks: { "2025-12-31": 2, "2026-01-01": 1 }, extra: "keep" };
const history = { year: 2025, savedAt: 123, goals: [goal], summary: { avgPercent: 30, completedCount: 0, totalCount: 1 } };
const palette = Object.fromEntries(["primary", "bg", "card", "border", "text", "mutedText", "primaryTextOn", "primaryPressed", "ringBg"].map((key) => [key, "#123456"]));
const custom = { id: "c1", name: "Mine", createdAt: 123, palette, extra: "keep" };
function changed(backup, mutate) { const copy = structuredClone(backup); mutate(copy); return JSON.stringify(copy); }
async function main() {
  const beforeEmptyExport = new Map(data);
  const empty = parseBackup(await createBackup());
  assert.deepEqual(data, beforeEmptyExport, "Export must not write to storage");
  assert.equal(backupPreview(empty).goals, 0);
  assert.equal(Object.keys(empty.payload).length, BACKUP_KEYS.length);
  const documentedKeys = [...fs.readFileSync("AGENTS.md", "utf8").matchAll(/^\| `(rt_[a-z0-9_]+|yt_[a-z0-9_]+)` \|/gm)].map((match) => match[1]);
  assert.deepEqual([...BACKUP_KEYS].sort(), documentedKeys.sort(), "Every documented user-data key is backed up");
  assert.equal(BACKUP_KEYS.includes(BACKUP_ANNOUNCEMENT_SEEN_KEY), false, "Device-local announcement is outside the backup schema");
  assert.equal(await loadBackupAnnouncementSeen(), false, "The 2.1 announcement appears on first launch");
  await setBackupAnnouncementSeen();
  assert.equal(await loadBackupAnnouncementSeen(), true, "Dismissal survives a reload");
  data.set("rt_goals_v1", JSON.stringify([goal]));
  data.set("yt_habits_v1", JSON.stringify([habit]));
  data.set("yt_goal_history_v1", JSON.stringify([history, { ...history, year: 2024 }]));
  data.set("yt_custom_themes_v1", JSON.stringify([custom]));
  data.set("rt_hue_v1", "custom:c1");
  data.set("yt_current_year_v1", "2025");
  data.set("rt_year_v1", "2025");
  const beforePopulatedExport = new Map(data);
  const populated = parseBackup(await createBackup());
  assert.equal(Object.hasOwn(populated.payload, BACKUP_ANNOUNCEMENT_SEEN_KEY), false);
  assert.deepEqual(data, beforePopulatedExport, "Populated export must not write to storage");
  assert.deepEqual(backupPreview(populated), { exportedAt: populated.exportedAt, goals: 1, habits: 1, history: 2, customThemes: 1 });
  assert.throws(() => parseBackup("{"), /valid JSON/);
  assert.throws(() => parseBackup(changed(populated, (b) => b.appId = "other")), /not a Yearly Tracker/);
  assert.throws(() => parseBackup(changed(populated, (b) => b.schemaVersion = 2)), /version/);
  assert.throws(() => parseBackup(changed(populated, (b) => b.exportedAt = "2026-02-30T00:00:00.000Z")), /date/);
  assert.throws(() => parseBackup(changed(populated, (b) => b.payload.yt_habits_v1 = JSON.stringify([{ ...habit, checks: { "2026-01-01": 3 } }]))), /Invalid records/);
  assert.throws(() => parseBackup("x".repeat(10 * 1024 * 1024 + 1)), /too large/);
  data.set("rt_goals_v1", "[]");
  await restoreBackup(populated);
  assert.equal(await loadBackupAnnouncementSeen(), true, "Import keeps the device-local dismissal");
  assert.equal(data.get("rt_goals_v1"), JSON.stringify([goal]));
  assert.equal(data.get("yt_habits_v1"), JSON.stringify([habit]));
  assert.deepEqual((await loadGoalsWithMeta()).goals, [goal]);
  assert.equal(await loadCurrentYear(), 2025);
  assert.equal(await loadHue(), "custom:c1");
  assert.equal((await loadCustomThemes())[0].id, "c1");
  assert.deepEqual(await loadGoalHistory(), [history, { ...history, year: 2024 }]);
  assert.equal(JSON.parse(data.get("yt_habits_v1"))[0].checks["2025-12-31"], 2);
  assert.equal(JSON.parse(data.get("yt_backup_pre_import_v1")).payload.rt_goals_v1, "[]");
  // One failed write must restore the full previous snapshot.
  const prior = Object.fromEntries(await fakeStorage.multiGet(BACKUP_KEYS));
  const replacement = parseBackup(changed(populated, (b) => { b.payload.rt_goals_v1 = "[]"; b.payload.yt_habits_v1 = "[]"; }));
  failWrite = true;
  await assert.rejects(restoreBackup(replacement), /recovered/);
  assert.deepEqual(Object.fromEntries(await fakeStorage.multiGet(BACKUP_KEYS)), prior);
  // Simulate an interrupted process with a journal and an already changed key.
  data.set("yt_backup_restore_in_progress_v1", "1");
  data.set("rt_goals_v1", "[]");
  assert.equal(await recoverInterruptedRestore(), true);
  assert.deepEqual(Object.fromEntries(await fakeStorage.multiGet(BACKUP_KEYS)), prior);
  // If rollback cannot finish, keep the journal and recover before hydration.
  failWrite = true;
  failRollback = true;
  const fatal = await restoreBackup(replacement).catch((error) => error);
  assert.equal(fatal.code, "RESTORE_RECOVERY_REQUIRED");
  assert.equal(data.get("yt_backup_restore_in_progress_v1"), "1");
  failRollback = false;
  assert.equal(await recoverInterruptedRestore(), true);
  assert.deepEqual(Object.fromEntries(await fakeStorage.multiGet(BACKUP_KEYS)), prior);
  // Pending writes must be included in export.
  const pending = appStorage.setItem("rt_hue_v1", "random-art");
  const snapshot = createBackup();
  await pending;
  assert.equal(parseBackup(await snapshot).payload.rt_hue_v1, "random-art");
  // A write initiated during a read snapshot waits, then persists normally.
  pauseRead = true;
  const started = new Promise((resolve) => { readStarted = resolve; });
  const concurrentExport = createBackup();
  await started;
  const lateWrite = appStorage.setItem("rt_hue_v1", "evergreen");
  pauseRead = false;
  releaseRead();
  assert.equal(parseBackup(await concurrentExport).payload.rt_hue_v1, "random-art");
  await lateWrite;
  assert.equal(data.get("rt_hue_v1"), "evergreen");
  failAppWrite = true;
  await assert.rejects(appStorage.setItem("rt_hue_v1", "unsaved"), /save failed/);
  await assert.rejects(createBackup(), /could not be saved/);
  await appStorage.setItem("rt_hue_v1", "evergreen");
  await createBackup();
  await restoreBackup(empty);
  assert.equal(data.get("rt_goals_v1") ?? null, null);
  assert.equal(data.get("yt_habits_v1") ?? null, null);
  assert.equal(data.get("yt_backup_restored_empty_v1"), "1");
  await prepareWidgetArtwork("cypresses");
  await prepareWidgetArtwork("cypresses");
  assert.equal(artworkCalls.length, 1, "Normal widget sync reuses shared artwork");
  await prepareWidgetArtwork("cypresses", { force: true });
  assert.equal(artworkCalls.length, 2, "Post-restore widget sync can regenerate artwork");
  await prepareWidgetArtwork(null);
  assert.deepEqual(artworkCalls[2], ["clear"], "Restoring a non-art theme clears native artwork");
  failArtwork = true;
  assert.equal(await prepareWidgetArtwork("cypresses", { force: true }), false);
  failArtwork = false;
  assert.equal(await prepareWidgetArtwork("cypresses", { force: true }), true);
  assert.equal(BACKUP_APP_ID, "com.andresbotia.ResolutionTracker");
  console.log("Backup checks passed: empty/populated export, validation, replacement, rollback, failed rollback recovery, crash recovery, pending/deferred writes, read-only export, failed-save export guard, empty restore, artwork refresh.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
