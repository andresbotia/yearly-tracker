// Art themes are additive. They never replace classic THEMES ids.
// Existing saved themeChoice values (bright-blue, custom:<id>, numeric hues)
// continue to resolve through utils/theme.js exactly as before.

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

export const ART_THEMES = [
  artTheme({
    id: "cypresses",
    name: "Cypresses",
    primary: "#3f5a38",
    primaryPressed: "#2f452b",
  }),
  artTheme({
    id: "flowering-orchard",
    name: "Flowering Orchard",
    primary: "#8a4a3a",
    primaryPressed: "#6f3a2e",
  }),
  artTheme({
    id: "water-lilies",
    name: "Water Lilies",
    primary: "#3b6468",
    primaryPressed: "#2d4e52",
  }),
  artTheme({
    id: "morning-seine",
    name: "Morning Seine",
    primary: "#5d6f7a",
    primaryPressed: "#485863",
  }),
  artTheme({
    id: "vetheuil",
    name: "Vétheuil",
    primary: "#3e6a4a",
    primaryPressed: "#2f5239",
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
