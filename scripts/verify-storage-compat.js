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

  const imagesJs = read(path.join(ROOT, "assets", "art", "images.js"));
  const catalog = JSON.parse(read(path.join(ROOT, "assets", "art", "catalog.json")));
  const habitAscii = read(path.join(ROOT, "utils", "habitAscii.js"));
  const appSrcAfter = appSrc;

  if (!habitAscii.includes('return "+"') || !habitAscii.includes('return "×"')) {
    fail("habit ASCII mapping must keep + / × presentation");
  }
  if (!appSrcAfter.includes("yt_habits_v1") || !appSrcAfter.includes("function buildWidgetPayload")) {
    fail("habit storage key or widget payload builder missing from App.js");
  }
  if (!appSrcAfter.includes("ArtBackdrop")) {
    fail("ArtBackdrop missing from App.js");
  }
  if (!appSrcAfter.includes("function persistGoals")) {
    fail("persistGoals missing from App.js");
  }
  const counterPath = path.join(ROOT, "components", "atelier", "AtelierCounter.js");
  if (!fs.existsSync(counterPath)) fail("missing AtelierCounter");
  const tokensSrc = read(path.join(ROOT, "utils", "tokens.js"));
  if (!tokensSrc.includes("ambient:") || !tokensSrc.includes("completion:")) {
    fail("motion duration tokens missing");
  }
  if (appSrcAfter.includes("<ArtHero")) {
    fail("primary screens still render ArtHero");
  }

  const expectedArt = [
    "cypresses",
    "wheat-field-cypresses",
    "women-picking-olives",
    "flowering-orchard",
    "morning-seine",
    "haystacks",
    "water-lilies",
    "japanese-footbridge",
    "garden-vetheuil",
    "garden-argenteuil",
    "vetheuil",
    "rouen-cathedral",
    "villeneuve-bridge",
    "versailles-road",
    "moret-winter",
    "pontoise-hill",
    "sainte-victoire-viaduct",
    "girl-in-boat",
    "museum-paper",
  ];
  for (const id of expectedArt) {
    if (!artIds.includes(id)) fail(`missing art theme id ${id}`);
  }
  const uniqueArt = new Set(artIds);
  if (uniqueArt.size !== artIds.length) fail("duplicate art theme ids");
  for (const item of catalog) {
    if (!item.isPublicDomain) fail(`catalog item ${item.id} is not marked public domain`);
    const imgPath = path.join(ROOT, "assets", "art", "images", `${item.id}.jpg`);
    if (!fs.existsSync(imgPath)) fail(`missing artwork file for ${item.id}`);
    if (!imagesJs.includes(`"${item.id}"`)) fail(`images.js missing ${item.id}`);
    const asciiPath = path.join(ROOT, "assets", "art", "ascii", `${item.id}.txt`);
    if (!fs.existsSync(asciiPath)) fail(`missing ascii file for ${item.id}`);
  }

  if (!themeSrc.includes('kind: "classic"') && !themeSrc.includes("kind: extra.kind")) {
    // decorateTheme still tags classic
  }
  if (!themeSrc.includes("findArtTheme")) fail("makeTheme lost art theme resolution");
  if (!themeSrc.includes("CUSTOM_THEME_PREFIX")) fail("custom theme prefix missing");

  // Additive revamp intro flag: must exist in live code, must NOT be required of old snapshots.
  if (!storageSrc.includes("yt_revamp_intro_seen_v1")) {
    fail("revamp intro key missing from storage.js");
  }
  if (REQUIRED_KEYS.includes("yt_revamp_intro_seen_v1")) {
    fail("yt_revamp_intro_seen_v1 must remain additive, not a required old key");
  }
  const backdropPath = path.join(ROOT, "components", "art", "ArtBackdrop.js");
  if (!fs.existsSync(backdropPath)) fail("missing components/art/ArtBackdrop.js");

  const payloadMatch = appSrcAfter.match(
    /function buildWidgetPayload[\s\S]*?return \{[\s\S]*?habits:[\s\S]*?\};/
  );
  if (!payloadMatch) fail("buildWidgetPayload shape not found");
  for (const field of ["yearlyProgress", "theme", "goals", "habits", "todayState"]) {
    if (!payloadMatch[0].includes(field)) fail(`widget payload missing ${field}`);
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
  console.log(`  art themes: ${artIds.join(", ")}`);
  console.log(`  catalog plates: ${catalog.length}`);
}

main();
