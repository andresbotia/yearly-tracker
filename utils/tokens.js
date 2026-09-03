// Design tokens for the museum-catalogue × journal visual system.
// Presentation only — no persistence, no business logic.
//
// Hallmark · genre: editorial · theme: museum-paper
// paper: oklch(96.2% 0.012 92) · ink: oklch(18% 0.018 72) · accent: ink

export const ASCII_RAMP = " .:-=+*#%@";

export const SPACE = {
  "3xs": 2,
  "2xs": 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

export const TYPE_SIZE = {
  kicker: 10,
  caption: 11,
  body: 15,
  bodyLg: 17,
  title: 22,
  display: 30,
  hero: 40,
};

export const TYPE_TRACK = {
  kicker: 1.6,
  display: 0.4,
  data: 0.8,
};

export const RADIUS = {
  none: 0,
  hairline: 2,
  input: 4,
};

export const MOTION = {
  short: 160,
  medium: 240,
  reduced: 120,
};

export const TYPOGRAPHY = {
  display: "Fraunces",
  body: "Source Serif 4",
  data: "IBM Plex Mono",
  fallbackDisplay: "Georgia",
  fallbackBody: undefined,
  fallbackData: "Courier New",
};

export const VISUAL = {
  classic: {
    imageOpacity: 0,
    grainOpacity: 0,
    asciiOpacity: 0,
    paperVeilOpacity: 0,
    previewAsciiOpacity: 0,
    borderStyle: "rounded",
    cornerStyle: "rounded",
  },
  art: {
    // Full-canvas backdrop: the painting is the environment.
    // The paper veil carries readability; ASCII is a print texture.
    imageOpacity: 1,
    grainOpacity: 0.05,
    asciiOpacity: 0.05,
    paperVeilOpacity: 0.74,
    previewAsciiOpacity: 0.12,
    borderStyle: "hairline",
    cornerStyle: "square",
  },
};

export const LEGIBILITY = {
  keyline: "rgba(28, 25, 22, 0.08)",
  wash: "rgba(246, 243, 236, 0.12)",
};

export const ASCII = {
  enabled: false,
  opacity: 0.05,
  characters: ASCII_RAMP,
  columns: 52,
};

export function fontFamily(role, loaded = false) {
  if (role === "display") {
    return loaded ? "Fraunces_700Bold" : TYPOGRAPHY.fallbackDisplay;
  }
  if (role === "data") {
    return loaded ? "IBMPlexMono_400Regular" : TYPOGRAPHY.fallbackData;
  }
  return loaded ? "SourceSerif4_400Regular" : TYPOGRAPHY.fallbackBody;
}
