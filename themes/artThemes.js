// Art themes are additive. They never replace classic THEMES ids.
// Existing saved themeChoice values (bright-blue, custom:<id>, numeric hues)
// continue to resolve through utils/theme.js exactly as before.
// Existing art ids (cypresses, flowering-orchard, water-lilies, morning-seine,
// vetheuil, museum-paper) remain stable.

import { ASCII, TYPOGRAPHY, VISUAL } from "../utils/tokens";
import { artworkMetadata } from "../assets/art/catalog";

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

function artTheme({ id, name, primary, primaryPressed, extras = {} }) {
  const art = artworkMetadata(id);
  return {
    id,
    name,
    kind: "art",
    palette: {
      ...PAPER,
      primary,
      primaryPressed,
      ...extras,
    },
    artwork: art,
    typography: { ...TYPOGRAPHY },
    ascii: {
      ...ASCII,
      enabled: true,
    },
    visual: { ...VISUAL.art },
  };
}

export const ART_THEME_GROUPS = [
  { key: "van-gogh", label: "Van Gogh", artist: "Vincent van Gogh" },
  { key: "monet", label: "Monet", artist: "Claude Monet" },
  { key: "sisley", label: "Sisley", artist: "Alfred Sisley" },
  { key: "pissarro", label: "Pissarro", artist: "Camille Pissarro" },
  { key: "cezanne", label: "Cézanne", artist: "Paul Cézanne" },
  { key: "morisot", label: "Morisot", artist: "Berthe Morisot" },
];

export const ART_THEMES = [
  artTheme({
    id: "cypresses",
    name: "Cypresses",
    primary: "#3f5a38",
    primaryPressed: "#2f452b",
  }),
  artTheme({
    id: "wheat-field-cypresses",
    name: "Wheat Field with Cypresses",
    primary: "#8a6b2e",
    primaryPressed: "#6f5424",
  }),
  artTheme({
    id: "women-picking-olives",
    name: "Women Picking Olives",
    primary: "#6b6a3a",
    primaryPressed: "#52522c",
  }),
  artTheme({
    id: "flowering-orchard",
    name: "Flowering Orchard",
    primary: "#8a4a3a",
    primaryPressed: "#6f3a2e",
  }),
  artTheme({
    id: "morning-seine",
    name: "Morning Seine",
    primary: "#5d6f7a",
    primaryPressed: "#485863",
  }),
  artTheme({
    id: "haystacks",
    name: "Haystacks",
    primary: "#8a6a38",
    primaryPressed: "#6c522c",
  }),
  artTheme({
    id: "water-lilies",
    name: "Water Lilies",
    primary: "#3b6468",
    primaryPressed: "#2d4e52",
  }),
  artTheme({
    id: "japanese-footbridge",
    name: "Japanese Footbridge",
    primary: "#2f5a48",
    primaryPressed: "#234538",
  }),
  artTheme({
    id: "garden-vetheuil",
    name: "Garden at Vétheuil",
    primary: "#6d7a38",
    primaryPressed: "#55602c",
  }),
  artTheme({
    id: "garden-argenteuil",
    name: "Garden in Argenteuil",
    primary: "#4e6b42",
    primaryPressed: "#3c5333",
  }),
  artTheme({
    id: "vetheuil",
    name: "Vétheuil",
    primary: "#3e6a4a",
    primaryPressed: "#2f5239",
  }),
  artTheme({
    id: "rouen-cathedral",
    name: "Rouen Cathedral",
    primary: "#5a6278",
    primaryPressed: "#454c5e",
  }),
  artTheme({
    id: "villeneuve-bridge",
    name: "Villeneuve Bridge",
    primary: "#4a6f88",
    primaryPressed: "#38566a",
  }),
  artTheme({
    id: "versailles-road",
    name: "Versailles Road",
    primary: "#6a6e58",
    primaryPressed: "#525544",
  }),
  artTheme({
    id: "moret-winter",
    name: "Moret Winter",
    primary: "#5c6a74",
    primaryPressed: "#46525a",
  }),
  artTheme({
    id: "pontoise-hill",
    name: "Jalais Hill",
    primary: "#6b7058",
    primaryPressed: "#545745",
  }),
  artTheme({
    id: "sainte-victoire-viaduct",
    name: "Sainte-Victoire",
    primary: "#4a6a5e",
    primaryPressed: "#385248",
  }),
  artTheme({
    id: "girl-in-boat",
    name: "Girl in a Boat",
    primary: "#4e6e62",
    primaryPressed: "#3c554b",
  }),
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

export function findArtTheme(choice) {
  if (typeof choice !== "string") return null;
  return ART_THEMES.find((t) => t.id === choice) || null;
}
