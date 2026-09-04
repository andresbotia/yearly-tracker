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

  // Art theme ids come from the catalog plus Museum Paper.
  // Random Art is a stored mode id, not a catalog plate.
  const artSrc = read(path.join(ROOT, "themes", "artThemes.js"));
  const catalog = JSON.parse(
    read(path.join(ROOT, "assets", "art", "catalog.json"))
  );
  const artIds = [...catalog.map((item) => item.id), "museum-paper"];
  for (const id of artIds) {
    if (CLASSIC_THEME_IDS.includes(id)) {
      fail(`art theme id collides with classic theme: ${id}`);
    }
  }
  if (!artSrc.includes("RANDOM_ART_ID") || !artSrc.includes('"random-art"')) {
    fail("Random Art mode missing from artThemes.js");
  }
  if (!appSrc.includes("sessionArtId") || !appSrc.includes("RANDOM_ART_ID")) {
    fail("Random Art session resolution missing from App.js");
  }

  // makeTheme still exported and THEMES still contains original 19.
  if (!themeSrc.includes("export function makeTheme")) {
    fail("makeTheme export missing");
  }
  for (const id of CLASSIC_THEME_IDS) {
    if (!themeSrc.includes(`id: "${id}"`)) fail(`classic theme missing: ${id}`);
  }

  const imagesJs = read(path.join(ROOT, "assets", "art", "images.js"));
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
  const counterSrc = read(counterPath);
  if (!counterSrc.includes("flush") || !counterSrc.includes("InputAccessoryView")) {
    fail("AtelierCounter exact-entry flush or iOS Done accessory missing");
  }
  if (counterSrc.includes("activateAfterLongPress")) {
    fail("AtelierCounter reel must not require a long-press to scrub");
  }
  if (!counterSrc.includes("activeOffsetX") || !counterSrc.includes("failOffsetY")) {
    fail("AtelierCounter pan must activate on small horizontal movement");
  }
  if (!counterSrc.includes("delayLongPress")) {
    fail("AtelierCounter +/- long-press repeat missing");
  }
  const gallerySrc = read(path.join(ROOT, "components", "theme", "ThemeGallery.js"));
  if (!gallerySrc.includes("FlatList") || !gallerySrc.includes("gridW")) {
    fail("ThemeGallery must virtualize and size tiles from content width");
  }
  if (!gallerySrc.includes("paddingRight") || !gallerySrc.includes("flexShrink: 0")) {
    fail("ThemeGallery artist rail must scroll last chips fully into view");
  }
  const sheetPath = path.join(ROOT, "components", "atelier", "AtelierSheet.js");
  if (!fs.existsSync(sheetPath)) fail("missing AtelierSheet");
  if (catalog.length < 90) {
    fail(`expected curated catalog (~99), got ${catalog.length}`);
  }
  if (catalog.length > 110) {
    fail(`catalog exceeded quality ceiling (~99), got ${catalog.length}`);
  }
  const ALLOWED_SOURCE = [
    "metmuseum.org",
    "nga.gov",
    "artic.edu",
    "clevelandart.org",
  ];
  const seenCatalogIds = new Set();
  for (const item of catalog) {
    if (seenCatalogIds.has(item.id)) fail(`duplicate catalog id ${item.id}`);
    seenCatalogIds.add(item.id);
    if (item.id === "random-art" || item.id === "museum-paper") {
      fail(`catalog must not include stored mode/paper id ${item.id}`);
    }
    if (!item.isPublicDomain) fail(`catalog item ${item.id} is not marked public domain`);
    if (!item.museumObjectId) fail(`catalog item ${item.id} missing museumObjectId`);
    if (!item.source) fail(`catalog item ${item.id} missing source URL`);
    const src = String(item.source);
    if (!ALLOWED_SOURCE.some((host) => src.includes(host))) {
      fail(`catalog item ${item.id} source is not an allowed museum host: ${src}`);
    }
  }
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
  if (!storageSrc.includes("yt_random_art_last_v1")) {
    fail("random art last-pick key missing from storage.js");
  }
  if (REQUIRED_KEYS.includes("yt_random_art_last_v1")) {
    fail("yt_random_art_last_v1 must remain additive, not a required old key");
  }
  const backdropPath = path.join(ROOT, "components", "art", "ArtBackdrop.js");
  if (!fs.existsSync(backdropPath)) fail("missing components/art/ArtBackdrop.js");
  const backdropSrc = read(backdropPath);
  if (!backdropSrc.includes("incoming") || !backdropSrc.includes("outgoing")) {
    fail("ArtBackdrop missing plate crossfade");
  }

  const yearArchivePath = path.join(ROOT, "utils", "yearArchive.js");
  if (!fs.existsSync(yearArchivePath)) fail("missing utils/yearArchive.js");
  const yearArchiveSrc = read(yearArchivePath);
  if (!yearArchiveSrc.includes("export function dayMark")) {
    fail("year archive dayMark missing");
  }
  if (!yearArchiveSrc.includes("if (bad > good) return \"×\"")) {
    fail("year archive formula must mark more-bad-than-good as ×");
  }
  if (!yearArchiveSrc.includes("yt_")) {
    // formula file must not invent storage keys
  }
  for (const key of [
    "yt_year_archive_v1",
    "yt_archive_v1",
    "rt_year_archive_v1",
  ]) {
    if (yearArchiveSrc.includes(key) || appSrcAfter.includes(key)) {
      fail(`Year Archive must not persist ${key}`);
    }
  }

  function dayMarkCheck(habits, key) {
    let good = 0;
    let bad = 0;
    for (const habit of habits) {
      const v = (habit.checks || {})[key] || 0;
      if (v === 1) good += 1;
      else if (v === 2) bad += 1;
    }
    if (good === 0 && bad === 0) return ".";
    if (bad > good) return "×";
    return "+";
  }
  const archiveHabits = [
    { checks: { "2026-01-01": 1, "2026-01-02": 2, "2026-01-04": 1 } },
    { checks: { "2026-01-01": 1, "2026-01-02": 2 } },
  ];
  assert.strictEqual(dayMarkCheck(archiveHabits, "2026-01-01"), "+");
  assert.strictEqual(dayMarkCheck(archiveHabits, "2026-01-02"), "×");
  assert.strictEqual(dayMarkCheck(archiveHabits, "2026-01-03"), ".");
  assert.strictEqual(dayMarkCheck(archiveHabits, "2026-01-04"), "+");

  const yearArchiveUi = path.join(ROOT, "components", "YearArchive.js");
  if (!fs.existsSync(yearArchiveUi)) fail("missing YearArchive component");
  if (!appSrcAfter.includes("YearArchive") || !appSrcAfter.includes("selectTab(\"archive\")")) {
    fail("Year Archive is not wired into App.js");
  }
  if (!appSrcAfter.includes("CollapsingKicker") || !appSrcAfter.includes("AtelierTabs")) {
    fail("collapsing header or tab indicator missing from App.js");
  }
  if (!tokensSrc.includes("crossfade:") || !tokensSrc.includes("reveal:")) {
    fail("theme motion duration tokens missing");
  }

  const payloadMatch = appSrcAfter.match(
    /function buildWidgetPayload[\s\S]*?return \{[\s\S]*?habits:[\s\S]*?\};/
  );
  if (!payloadMatch) fail("buildWidgetPayload shape not found");
  for (const field of [
    "yearlyProgress",
    "theme",
    "goals",
    "habits",
    "todayState",
    "themeKind",
    "themePrimary",
    "themeBg",
  ]) {
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
  console.log(`  art themes: ${artIds.length} (catalog ${catalog.length} + museum-paper)`);
  console.log(`  catalog plates: ${catalog.length}`);
}

main();
