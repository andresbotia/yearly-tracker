// Art themes are additive. They never replace classic THEMES ids.
// Existing saved themeChoice values (bright-blue, custom:<id>, numeric hues)
// continue to resolve through utils/theme.js exactly as before.

import { ASCII, TYPOGRAPHY, VISUAL } from "../utils/tokens";
import { ARTWORK_CATALOG, artworkMetadata } from "../assets/art/catalog";

export const RANDOM_ART_ID = "random-art";

const PAPER = {
  bg: "#f6f3ec",
  card: "#fbf8f1",
  text: "#1c1916",
  mutedText: "#6b645c",
  primaryTextOn: "#f6f3ec",
  ringBg: "#e8e2d6",
  border: "#d8d0c4",
  danger: "#9b2c2c",
};

const NAMED_PALETTE = {
  cypresses: ["#3f5a38", "#2f452b"],
  "wheat-field-cypresses": ["#8a6b2e", "#6f5424"],
  "women-picking-olives": ["#6b6a3a", "#52522c"],
  "flowering-orchard": ["#8a4a3a", "#6f3a2e"],
  "morning-seine": ["#5d6f7a", "#485863"],
  haystacks: ["#8a6a38", "#6c522c"],
  "water-lilies": ["#3b6468", "#2d4e52"],
  "japanese-footbridge": ["#2f5a48", "#234538"],
  "garden-vetheuil": ["#6d7a38", "#55602c"],
  "garden-argenteuil": ["#4e6b42", "#3c5333"],
  vetheuil: ["#3e6a4a", "#2f5239"],
  "rouen-cathedral": ["#5a6278", "#454c5e"],
  "villeneuve-bridge": ["#4a6f88", "#38566a"],
  "versailles-road": ["#6a6e58", "#525544"],
  "moret-winter": ["#5c6a74", "#46525a"],
  "pontoise-hill": ["#6b7058", "#545745"],
  "sainte-victoire-viaduct": ["#4a6a5e", "#385248"],
  "girl-in-boat": ["#4e6e62", "#3c554b"],
  "red-fuji": ["#8a4a38", "#6f3a2c"],
  "keelmen-moonlight": ["#3a4a5a", "#2c3846"],
  "southampton-water": ["#3a4854", "#2c3842"],
  "moonlight-wood-island": ["#2f3e4a", "#243038"],
  "flower-clouds": ["#6a4a62", "#52384c"],
};

const ARTIST_PALETTE = {
  "Vincent van Gogh": ["#6a5a32", "#524526"],
  "Claude Monet": ["#3b6468", "#2d4e52"],
  "Alfred Sisley": ["#4a6f88", "#38566a"],
  "Camille Pissarro": ["#6b7058", "#545745"],
  "Paul Cézanne": ["#4a6a5e", "#385248"],
  "Berthe Morisot": ["#4e6e62", "#3c554b"],
  "Childe Hassam": ["#5d6f7a", "#485863"],
  "Gustave Caillebotte": ["#5a6278", "#454c5e"],
  "Eugène Boudin": ["#5c6a74", "#46525a"],
  "Armand Guillaumin": ["#3e6a4a", "#2f5239"],
  "John Singer Sargent": ["#6d7a38", "#55602c"],
  "Johan Barthold Jongkind": ["#5d6f7a", "#485863"],
  "Katsushika Hokusai": ["#3a5a6a", "#2c4654"],
  "Utagawa Hiroshige": ["#4a5c68", "#384650"],
  "Joseph Mallord William Turner": ["#8a6a3a", "#6c522c"],
  "Camille Corot": ["#6a6e58", "#525544"],
  "Jean Baptiste Camille Corot": ["#6a6e58", "#525544"],
  "Jean-Baptiste-Camille Corot": ["#6a6e58", "#525544"],
  "Charles François Daubigny": ["#5c6a4a", "#465238"],
  "James McNeill Whistler": ["#4a5560", "#38424c"],
  "Odilon Redon": ["#6a4a58", "#523844"],
  "Winslow Homer": ["#3e5a68", "#2f4652"],
};

function paletteFor(item) {
  return (
    NAMED_PALETTE[item.id] ||
    ARTIST_PALETTE[item.artist] || ["#4a5a48", "#384538"]
  );
}

function shortName(title) {
  const t = String(title || "");
  if (t.length <= 28) return t;
  return t.slice(0, 26).trim() + "…";
}

function artThemeFromCatalog(item) {
  const [primary, primaryPressed] = paletteFor(item);
  return {
    id: item.id,
    name: shortName(item.displayTitle || item.title),
    kind: "art",
    palette: {
      ...PAPER,
      primary,
      primaryPressed,
    },
    artwork: artworkMetadata(item.id),
    typography: { ...TYPOGRAPHY },
    ascii: {
      ...ASCII,
      enabled: true,
    },
    visual: { ...VISUAL.art },
  };
}

export function artistGroupLabel(artist) {
  if (/van gogh/i.test(artist)) return "Van Gogh";
  if (/monet/i.test(artist)) return "Monet";
  if (/sisley/i.test(artist)) return "Sisley";
  if (/pissarro/i.test(artist)) return "Pissarro";
  if (/cézanne|cezanne/i.test(artist)) return "Cézanne";
  if (/morisot/i.test(artist)) return "Morisot";
  if (/hassam/i.test(artist)) return "Hassam";
  if (/caillebotte/i.test(artist)) return "Caillebotte";
  if (/boudin/i.test(artist)) return "Boudin";
  if (/sargent/i.test(artist)) return "Sargent";
  if (/guillaumin/i.test(artist)) return "Guillaumin";
  if (/jongkind/i.test(artist)) return "Jongkind";
  if (/hokusai/i.test(artist)) return "Hokusai";
  if (/hiroshige/i.test(artist)) return "Hiroshige";
  if (/turner/i.test(artist)) return "Turner";
  if (/corot/i.test(artist)) return "Corot";
  if (/daubigny/i.test(artist)) return "Daubigny";
  if (/whistler/i.test(artist)) return "Whistler";
  if (/redon/i.test(artist)) return "Redon";
  if (/homer/i.test(artist)) return "Homer";
  const parts = String(artist || "").split(" ").filter(Boolean);
  return parts[parts.length - 1] || "Other";
}

export const ART_THEME_GROUPS = (() => {
  const seen = [];
  for (const item of ARTWORK_CATALOG) {
    const label = artistGroupLabel(item.artist);
    if (seen.some((g) => g.label === label)) continue;
    seen.push({ key: label.toLowerCase(), label, artist: item.artist });
  }
  return seen;
})();

export const ART_THEMES = [
  ...ARTWORK_CATALOG.map(artThemeFromCatalog),
  {
    id: "museum-paper",
    name: "Museum Paper",
    kind: "art",
    palette: {
      ...PAPER,
      primary: "#1c1916",
      primaryPressed: "#11100e",
      primaryTextOn: "#f6f3ec",
    },
    artwork: null,
    typography: { ...TYPOGRAPHY },
    ascii: { ...ASCII, enabled: false },
    visual: {
      ...VISUAL.art,
      imageOpacity: 0,
      asciiOpacity: 0,
      paperVeilOpacity: 0,
      previewAsciiOpacity: 0,
    },
  },
];

export const ART_THEME_IDS = ART_THEMES.map((t) => t.id);

export function randomArtPool() {
  return ART_THEMES.filter((t) => t.artwork && t.id !== "museum-paper");
}

export function pickRandomArtId(excludeId) {
  const pool = randomArtPool();
  const filtered = excludeId
    ? pool.filter((t) => t.id !== excludeId)
    : pool;
  const list = filtered.length ? filtered : pool;
  if (!list.length) return "cypresses";
  return list[Math.floor(Math.random() * list.length)].id;
}

export function findArtTheme(choice) {
  if (typeof choice !== "string") return null;
  if (choice === RANDOM_ART_ID) return null;
  return ART_THEMES.find((t) => t.id === choice) || null;
}
