// utils/storage.js

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  goals: "rt_goals_v1",
  hue: "rt_hue_v1",
  welcomeSeen: "rt_welcome_seen_v1",
};

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

export async function loadHue() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.hue);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function saveHue(hue) {
  await AsyncStorage.setItem(KEYS.hue, String(hue));
}

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
