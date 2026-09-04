// DEV-only first-run presentation-flag helpers.
// Production / TestFlight / App Store builds must never execute these.
// Mutates additive presentation flags only. Never touches goals, habits,
// history, custom themes, or rt_hue_v1.

import { DevSettings } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./storage";

const DATA_KEYS = Object.freeze([
  STORAGE_KEYS.goals,
  "yt_habits_v1",
  STORAGE_KEYS.goalHistory,
  STORAGE_KEYS.customThemes,
  STORAGE_KEYS.hue,
]);

async function qaRemoveFlags(keys) {
  if (!__DEV__) return;
  const blocked = new Set(DATA_KEYS);
  const safe = keys.filter((key) => key && !blocked.has(key));
  if (!safe.length) return;
  await AsyncStorage.multiRemove(safe);
}

async function qaSetFlag(key, value) {
  if (!__DEV__) return;
  if (!key || DATA_KEYS.includes(key)) return;
  await AsyncStorage.setItem(key, value);
}

export async function simulateFreshInstall() {
  if (!__DEV__) return;
  await qaRemoveFlags([
    STORAGE_KEYS.welcomeSeen,
    STORAGE_KEYS.revampIntroSeen,
    STORAGE_KEYS.revampThemeChoiceSeen,
    STORAGE_KEYS.onboardingSeen,
  ]);
}

export async function simulateOldYearlyTrackerUser() {
  if (!__DEV__) return;
  await qaSetFlag(STORAGE_KEYS.welcomeSeen, "1");
  await qaRemoveFlags([
    STORAGE_KEYS.revampIntroSeen,
    STORAGE_KEYS.revampThemeChoiceSeen,
  ]);
  await qaSetFlag(STORAGE_KEYS.onboardingSeen, "1");
}

export async function simulateEarlierRevampUser() {
  if (!__DEV__) return;
  await qaSetFlag(STORAGE_KEYS.welcomeSeen, "1");
  await qaSetFlag(STORAGE_KEYS.revampIntroSeen, "1");
  await qaRemoveFlags([STORAGE_KEYS.revampThemeChoiceSeen]);
  await qaSetFlag(STORAGE_KEYS.onboardingSeen, "1");
}

export async function replayOnboardingFlags() {
  if (!__DEV__) return;
  await qaRemoveFlags([STORAGE_KEYS.onboardingSeen]);
}

export async function resetThemeChoicePrompt() {
  if (!__DEV__) return;
  await qaRemoveFlags([STORAGE_KEYS.revampThemeChoiceSeen]);
}

export function reloadForQa() {
  if (!__DEV__) return;
  try {
    DevSettings.reload();
  } catch {}
}
