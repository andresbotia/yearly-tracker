// utils/storage.js
//
// STORAGE INVENTORY (do not rename keys)
// ---------------------------------------------------------------------------
// Key                         Purpose                         Schema
// rt_goals_v1                 Current-year goals              Goal[]
// rt_hue_v1                   Theme choice                    string id | number hue | "custom:<id>"
// rt_welcome_seen_v1          Welcome modal seen              "1"
// rt_year_v1                  Legacy stored year              number string
// yt_current_year_v1          Current tracked year            number string
// yt_goal_history_v1          Yearly goal snapshots           HistoryEntry[]
// yt_custom_themes_v1         User-created palettes           CustomTheme[]
// yt_habits_v1                Habits + daily checks           Habit[]   (App.js)
// yt_habits_welcome_seen_v1   Habits intro seen               "1"       (App.js)
//
// Goal: { id, title, type: "count"|"boolean", target, progress, createdAt }
// Habit: { id, title, checks: { "YYYY-MM-DD": 0|1|2 } }  // 0 empty, 1 good, 2 bad
// HistoryEntry: { year, savedAt, goals: Goal[], summary: { avgPercent, completedCount, totalCount } }
// CustomTheme: { id, name, palette: { primary, bg, card, border, text, mutedText, primaryTextOn, primaryPressed, ringBg, ... }, createdAt }
//
// Readers of new fields must treat them as optional (?? default).
// Unknown fields on persisted objects must be preserved.

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  goals: "rt_goals_v1",
  hue: "rt_hue_v1",
  welcomeSeen: "rt_welcome_seen_v1",

  // Legacy (kept for backwards compatibility with older installs)
  yearLegacy: "rt_year_v1",

  // ✅ New (annual rollover + history foundation)
  currentYear: "yt_current_year_v1",
  goalHistory: "yt_goal_history_v1",

  // ✅ New: custom themes
  customThemes: "yt_custom_themes_v1",
};

export const STORAGE_KEYS = KEYS;

// -----------------------------
// Goals
// -----------------------------

// Returns { goals: Goal[], hasStoredValue: boolean }
export async function loadGoalsWithMeta() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.goals);
    if (raw === null) return { goals: [], hasStoredValue: false }; // truly first run

    const parsed = JSON.parse(raw);
    const goals = Array.isArray(parsed) ? parsed : [];
    return { goals, hasStoredValue: true };
  } catch {
    // If corrupted, treat as stored value exists (so we don't keep reseeding)
    return { goals: [], hasStoredValue: true };
  }
}

export async function saveGoals(goals) {
  await AsyncStorage.setItem(KEYS.goals, JSON.stringify(goals));
}

// -----------------------------
// Theme
// -----------------------------

export async function loadHue() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.hue);
    if (!raw) return null;
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
    return raw; // allow named themes
  } catch {
    return null;
  }
}

export async function saveHue(hue) {
  await AsyncStorage.setItem(KEYS.hue, String(hue));
}

// -----------------------------
// Welcome
// -----------------------------

export async function loadWelcomeSeen() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.welcomeSeen);
    return raw === "1";
  } catch {
    return true; // fail safe: don't block the user with a modal
  }
}

export async function setWelcomeSeen() {
  await AsyncStorage.setItem(KEYS.welcomeSeen, "1");
}

// -----------------------------
// ✅ Annual rollover: current year
// -----------------------------

// Returns stored year (number) or null.
// Migration: if new key missing but legacy year exists, return legacy year.
export async function loadCurrentYear() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.currentYear);
    if (raw) {
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }

    // fallback to legacy key (older versions)
    const legacy = await AsyncStorage.getItem(KEYS.yearLegacy);
    if (!legacy) return null;

    const n2 = Number(legacy);
    return Number.isFinite(n2) ? n2 : null;
  } catch {
    return null;
  }
}

export async function saveCurrentYear(year) {
  const y = Number(year);
  if (!Number.isFinite(y)) return;

  // write new key
  await AsyncStorage.setItem(KEYS.currentYear, String(y));

  // also keep legacy updated (harmless; helps older builds if ever installed)
  try {
    await AsyncStorage.setItem(KEYS.yearLegacy, String(y));
  } catch {}
}

// -----------------------------
// ✅ Goal history (array of yearly snapshots)
// -----------------------------

export async function loadGoalHistory() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.goalHistory);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendGoalHistory(entry) {
  try {
    const existing = await loadGoalHistory();
    const next = [...existing, entry];
    await AsyncStorage.setItem(KEYS.goalHistory, JSON.stringify(next));
  } catch {
    // ignore
  }
}

// -----------------------------
// ✅ Custom themes (stored locally)
// Data format: [{ id, name, palette: {...}, createdAt }]
// -----------------------------

function safeParseJSON(raw, fallback) {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function isHex6(s) {
  return typeof s === "string" && /^#?[0-9a-fA-F]{6}$/.test(s.trim());
}

function normHex(hex) {
  if (!hex) return "#000000";
  const t = String(hex).trim();
  if (t.startsWith("#")) return `#${t.slice(1).toLowerCase()}`;
  return `#${t.toLowerCase()}`;
}

// A light-weight "fill missing" so storage is resilient even if caller passes partial palette.
// (Your theme.js will also ensure completeness at render time.)
function ensurePaletteShape(palette) {
  const p = { ...(palette || {}) };

  const required = {
    primary: isHex6(p.primary) ? normHex(p.primary) : "#2b6dff",
    bg: isHex6(p.bg) ? normHex(p.bg) : "#f5f7fa",
    card: isHex6(p.card) ? normHex(p.card) : "#ffffff",
    border: isHex6(p.border) ? normHex(p.border) : "#e3e7ef",
    text: isHex6(p.text) ? normHex(p.text) : "#0b1220",
    mutedText: isHex6(p.mutedText) ? normHex(p.mutedText) : "#5b6472",
    primaryTextOn: isHex6(p.primaryTextOn)
      ? normHex(p.primaryTextOn)
      : "#ffffff",
    primaryPressed: isHex6(p.primaryPressed)
      ? normHex(p.primaryPressed)
      : "#1f56d1",
    ringBg: isHex6(p.ringBg) ? normHex(p.ringBg) : "#e1e8ff",
  };

  // Keep unknown palette keys (e.g. danger, future art fields).
  const extra = {};
  for (const [k, v] of Object.entries(p)) {
    if (k in required) continue;
    extra[k] = v;
  }

  return { ...required, ...extra };
}

export function sanitizeCustomThemeRecord(rec) {
  const id = rec?.id ? String(rec.id) : uid();
  const name =
    String(rec?.name || "")
      .trim()
      .slice(0, 32) || "Custom Theme";
  const palette = ensurePaletteShape(rec?.palette);

  const base = {
    id,
    name,
    palette,
    createdAt: Number(rec?.createdAt) || Date.now(),
  };

  // Preserve unknown top-level fields so future optional metadata survives.
  const extra = {};
  if (rec && typeof rec === "object") {
    for (const [k, v] of Object.entries(rec)) {
      if (k in base) continue;
      extra[k] = v;
    }
  }

  return { ...extra, ...base };
}

export async function loadCustomThemes() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.customThemes);
    const parsed = safeParseJSON(raw, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeCustomThemeRecord);
  } catch {
    return [];
  }
}

export async function saveCustomThemes(themes) {
  const safe = Array.isArray(themes)
    ? themes.map(sanitizeCustomThemeRecord)
    : [];
  try {
    await AsyncStorage.setItem(KEYS.customThemes, JSON.stringify(safe));
  } catch {}
  return safe;
}

export async function addCustomTheme({ name, palette }) {
  const current = await loadCustomThemes();
  const next = [
    ...current,
    sanitizeCustomThemeRecord({
      id: uid(),
      name,
      palette,
      createdAt: Date.now(),
    }),
  ];
  return await saveCustomThemes(next);
}

export async function updateCustomTheme(id, { name, palette }) {
  const current = await loadCustomThemes();
  const next = current.map((t) => {
    if (String(t.id) !== String(id)) return t;
    return sanitizeCustomThemeRecord({
      ...t,
      name: name ?? t.name,
      palette: palette ?? t.palette,
    });
  });
  return await saveCustomThemes(next);
}

export async function deleteCustomTheme(id) {
  const current = await loadCustomThemes();
  const next = current.filter((t) => String(t.id) !== String(id));
  return await saveCustomThemes(next);
}

// -----------------------------
// Legacy exports (kept so older code won't break if referenced elsewhere)
// -----------------------------

export async function loadStoredYear() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.yearLegacy);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function setStoredYear(year) {
  await AsyncStorage.setItem(KEYS.yearLegacy, String(year));
}
