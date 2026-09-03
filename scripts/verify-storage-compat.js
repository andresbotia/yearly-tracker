#!/usr/bin/env node
// Upgrade-compat check: old AsyncStorage snapshot vs current code contracts.
// Does not import React Native. Fails the process on any contract break.

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const FIXTURE = path.join(
  ROOT,
  "__fixtures__",
  "upgrade",
  "v1-asyncstorage.json"
);

const REQUIRED_KEYS = [
  "rt_goals_v1",
  "rt_hue_v1",
  "rt_welcome_seen_v1",
  "rt_year_v1",
  "yt_current_year_v1",
  "yt_goal_history_v1",
  "yt_custom_themes_v1",
  "yt_habits_v1",
  "yt_habits_welcome_seen_v1",
];

const CLASSIC_THEME_IDS = [
  "bright-blue",
  "sunset",
  "evergreen",
  "lavender",
  "sand",
  "deep-blue",
  "noir",
  "midnight",
  "forest-night",
  "ember",
  "mint",
  "rose",
  "citrus",
  "ocean",
  "paper",
  "slate",
  "coffee",
  "aurora",
  "neon",
];

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function parseJsonField(raw) {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function fail(msg) {
  console.error("FAIL:", msg);
  process.exitCode = 1;
}

function main() {
  const snapshot = JSON.parse(read(FIXTURE));
  const themeSrc = read(path.join(ROOT, "utils", "theme.js"));
  const storageSrc = read(path.join(ROOT, "utils", "storage.js"));
  const appSrc = read(path.join(ROOT, "App.js"));

  for (const key of REQUIRED_KEYS) {
    if (!(key in snapshot)) fail(`fixture missing key ${key}`);
  }

  for (const key of REQUIRED_KEYS) {
    if (key.startsWith("rt_") || key.startsWith("yt_")) {
      const renamed =
        storageSrc.includes(`"${key}"`) || appSrc.includes(`"${key}"`);
      if (!renamed) fail(`live code no longer references storage key ${key}`);
    }
  }

  const goals = parseJsonField(snapshot.rt_goals_v1);
  assert.ok(Array.isArray(goals) && goals.length === 5, "expected 5 goals");
  for (const g of goals) {
    for (const field of ["id", "title", "type", "progress", "createdAt"]) {
      if (!(field in g)) fail(`goal ${g.id || "?"} missing ${field}`);
    }
  }
  const completed = goals.filter((g) => {
    if (g.type === "boolean") return g.progress === 1;
    return g.target > 0 && g.progress >= g.target;
  });
  assert.ok(completed.length === 1, "expected one completed goal in fixture");

  const habits = parseJsonField(snapshot.yt_habits_v1);
  assert.ok(Array.isArray(habits) && habits.length >= 3, "expected habits");
  for (const h of habits) {
    if (!h.id || !h.title || typeof h.checks !== "object") {
      fail(`habit shape invalid: ${h.id}`);
    }
    for (const [day, val] of Object.entries(h.checks)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) fail(`bad habit date key ${day}`);
      if (![0, 1, 2].includes(val)) fail(`habit ${h.id} has invalid state ${val}`);
    }
  }

  const hue = snapshot.rt_hue_v1;
  if (!CLASSIC_THEME_IDS.includes(hue) && hue !== "custom:ct_user_ink") {
    // evergreen is in the classic list; this is the fixture's stored choice
    if (typeof hue !== "string" && typeof hue !== "number") {
      fail(`unexpected hue type ${typeof hue}`);
    }
  }
  if (!themeSrc.includes(`id: "${hue}"`) && hue !== "custom:ct_user_ink") {
    fail(`stored theme id ${hue} is no longer in THEMES`);
  }

  const custom = parseJsonField(snapshot.yt_custom_themes_v1);
  assert.ok(Array.isArray(custom) && custom[0]?.id === "ct_user_ink");
  assert.strictEqual(custom[0].futureFieldShouldSurvive, true);

  const history = parseJsonField(snapshot.yt_goal_history_v1);
  assert.ok(Array.isArray(history) && history[0]?.year === 2025);
  assert.ok(history[0].goals?.[0]?.id === "g_old_run");

  // Art theme ids must not collide with classic ids.
  const artSrc = read(path.join(ROOT, "themes", "artThemes.js"));
  const artIds = [...artSrc.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
  for (const id of artIds) {
    if (CLASSIC_THEME_IDS.includes(id)) {
      fail(`art theme id collides with classic theme: ${id}`);
    }
  }

  // makeTheme still exported and THEMES still contains original 19.
  if (!themeSrc.includes("export function makeTheme")) {
    fail("makeTheme export missing");
  }
  for (const id of CLASSIC_THEME_IDS) {
    if (!themeSrc.includes(`id: "${id}"`)) fail(`classic theme missing: ${id}`);
  }

  if (process.exitCode) {
    console.error("Storage compatibility check failed.");
    process.exit(1);
  }
  console.log("Storage compatibility check passed.");
  console.log(`  keys: ${REQUIRED_KEYS.length}`);
  console.log(`  goals: ${goals.length}`);
  console.log(`  habits: ${habits.length}`);
  console.log(`  theme: ${hue}`);
  console.log(`  history years: ${history.map((h) => h.year).join(", ")}`);
}

main();
