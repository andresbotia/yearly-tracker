// utils/storage.js

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
};

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
