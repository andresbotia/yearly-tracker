// utils/theme.js

export const CUSTOM_THEME_PREFIX = "custom:";

// Required (for your Custom Theme editor / validation)
export const REQUIRED_CUSTOM_PALETTE_KEYS = [
  "primary",
  "bg",
  "card",
  "border",
  "text",
  "mutedText",
  "primaryTextOn",
  "primaryPressed",
  "ringBg",
];

// -----------------
// Built-in themes
// (Your original 10 are kept EXACTLY the same)
// + 10 more built-ins added at the bottom
// -----------------
export const THEMES = [
  // -----------------
  // Light themes
  // -----------------
  {
    id: "bright-blue",
    name: "Bright Blue",
    palette: {
      bg: "#f4f7ff",
      card: "#ffffff",
      text: "#0b2447",
      mutedText: "#4f5f7a",
      primary: "#2b6dff",
      primaryPressed: "#1f56d1",
      primaryTextOn: "#f5f8ff",
      ringBg: "#e1e8ff",
      border: "#d7e0f8",
      danger: "#d62828",
    },
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    palette: {
      bg: "#fff7f0",
      card: "#ffffff",
      text: "#3b1b0a",
      mutedText: "#845b42",
      primary: "#ff7b3e",
      primaryPressed: "#e8662c",
      primaryTextOn: "#fff5ec",
      ringBg: "#ffe2d0",
      border: "#ffd4b9",
      danger: "#c1121f",
    },
  },
  {
    id: "evergreen",
    name: "Evergreen",
    palette: {
      bg: "#f3f9f5",
      card: "#ffffff",
      text: "#0f2418",
      mutedText: "#4d6756",
      primary: "#2f9e44",
      primaryPressed: "#26863a",
      primaryTextOn: "#f4fff8",
      ringBg: "#d9eddf",
      border: "#cde5d4",
      danger: "#d11149",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    palette: {
      bg: "#f6f4ff",
      card: "#ffffff",
      text: "#221c3b",
      mutedText: "#6b6685",
      primary: "#7c6cff",
      primaryPressed: "#6757e6",
      primaryTextOn: "#f8f7ff",
      ringBg: "#e6e2ff",
      border: "#dad5ff",
      danger: "#c9184a",
    },
  },
  {
    id: "sand",
    name: "Soft Sand",
    palette: {
      bg: "#faf8f3",
      card: "#ffffff",
      text: "#2a2418",
      mutedText: "#7a705c",
      primary: "#c49a3a",
      primaryPressed: "#ad8731",
      primaryTextOn: "#fffaf0",
      ringBg: "#efe6cc",
      border: "#e6dbc1",
      danger: "#b42318",
    },
  },

  // -----------------
  // Dark themes
  // -----------------
  {
    id: "deep-blue",
    name: "Deep Blue",
    palette: {
      bg: "#0f172a",
      card: "#111827",
      text: "#f8fafc",
      mutedText: "#cbd5e1",
      primary: "#fb923c",
      primaryPressed: "#f97316",
      primaryTextOn: "#0b1020",
      ringBg: "#1e293b",
      border: "#1f2937",
      danger: "#f87171",
    },
  },
  {
    id: "noir",
    name: "Noir",
    palette: {
      bg: "#0b0b0f",
      card: "#121218",
      text: "#f4f4f5",
      mutedText: "#c4c4cc",
      primary: "#ffffff",
      primaryPressed: "#e2e8f0",
      primaryTextOn: "#0b0b0f",
      ringBg: "#1b1b21",
      border: "#1f1f27",
      danger: "#ff6b6b",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    palette: {
      bg: "#060b1a",
      card: "#0c1224",
      text: "#e5e7eb",
      mutedText: "#9ca3af",
      primary: "#38bdf8",
      primaryPressed: "#0ea5e9",
      primaryTextOn: "#020617",
      ringBg: "#111827",
      border: "#1f2937",
      danger: "#fb7185",
    },
  },
  {
    id: "forest-night",
    name: "Forest Night",
    palette: {
      bg: "#081412",
      card: "#0f1f1b",
      text: "#e6f4f1",
      mutedText: "#9fbfb5",
      primary: "#34d399",
      primaryPressed: "#10b981",
      primaryTextOn: "#052e2b",
      ringBg: "#12332c",
      border: "#1c4a40",
      danger: "#f43f5e",
    },
  },
  {
    id: "ember",
    name: "Ember",
    palette: {
      bg: "#120a0a",
      card: "#1c1212",
      text: "#fff5f5",
      mutedText: "#e5bcbc",
      primary: "#f97316",
      primaryPressed: "#ea580c",
      primaryTextOn: "#1a0a04",
      ringBg: "#2a1610",
      border: "#3a1f17",
      danger: "#ef4444",
    },
  },

  // -----------------
  // +10 NEW built-in themes
  // -----------------
  {
    id: "mint",
    name: "Mint Pop",
    palette: {
      bg: "#f3fbf8",
      card: "#ffffff",
      text: "#0b2a20",
      mutedText: "#4f7a6a",
      primary: "#18b981",
      primaryPressed: "#0f9a6a",
      primaryTextOn: "#f2fffb",
      ringBg: "#d8f6ea",
      border: "#c9efdf",
      danger: "#d62828",
    },
  },
  {
    id: "rose",
    name: "Rose Blush",
    palette: {
      bg: "#fff5f7",
      card: "#ffffff",
      text: "#3a0b18",
      mutedText: "#7a4f5c",
      primary: "#f43f5e",
      primaryPressed: "#e11d48",
      primaryTextOn: "#fff1f4",
      ringBg: "#ffe0e7",
      border: "#ffd0db",
      danger: "#c1121f",
    },
  },
  {
    id: "citrus",
    name: "Citrus",
    palette: {
      bg: "#fbfff3",
      card: "#ffffff",
      text: "#24330b",
      mutedText: "#6f7a4f",
      primary: "#84cc16",
      primaryPressed: "#65a30d",
      primaryTextOn: "#f7ffe8",
      ringBg: "#e9f7c9",
      border: "#def0b6",
      danger: "#b42318",
    },
  },
  {
    id: "ocean",
    name: "Ocean Air",
    palette: {
      bg: "#f1fbff",
      card: "#ffffff",
      text: "#082a3b",
      mutedText: "#4f6e7a",
      primary: "#06b6d4",
      primaryPressed: "#0891b2",
      primaryTextOn: "#effcff",
      ringBg: "#d2f3fb",
      border: "#c2ecf7",
      danger: "#d62828",
    },
  },
  {
    id: "paper",
    name: "Paper",
    palette: {
      bg: "#fafaf7",
      card: "#ffffff",
      text: "#1d1d1f",
      mutedText: "#6b7280",
      primary: "#111827",
      primaryPressed: "#0b1220",
      primaryTextOn: "#f9fafb",
      ringBg: "#eef2f7",
      border: "#e5e7eb",
      danger: "#b42318",
    },
  },
  {
    id: "slate",
    name: "Slate Night",
    palette: {
      bg: "#0b1220",
      card: "#0f1a2e",
      text: "#f8fafc",
      mutedText: "#cbd5e1",
      primary: "#a78bfa",
      primaryPressed: "#8b5cf6",
      primaryTextOn: "#0b1020",
      ringBg: "#101e35",
      border: "#1a2a44",
      danger: "#fb7185",
    },
  },
  {
    id: "coffee",
    name: "Coffee",
    palette: {
      bg: "#120d0a",
      card: "#1a120e",
      text: "#fff7ed",
      mutedText: "#e7d2c1",
      primary: "#f59e0b",
      primaryPressed: "#d97706",
      primaryTextOn: "#1a0f05",
      ringBg: "#281a12",
      border: "#3a2418",
      danger: "#ef4444",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    palette: {
      bg: "#070a14",
      card: "#0b1022",
      text: "#e2e8f0",
      mutedText: "#aab6c6",
      primary: "#22c55e",
      primaryPressed: "#16a34a",
      primaryTextOn: "#04130a",
      ringBg: "#0f1b2a",
      border: "#16263d",
      danger: "#fb7185",
    },
  },
  {
    id: "neon",
    name: "Neon Punch",
    palette: {
      bg: "#07070b",
      card: "#0f0f16",
      text: "#f4f4f5",
      mutedText: "#c4c4cc",
      primary: "#22d3ee",
      primaryPressed: "#06b6d4",
      primaryTextOn: "#041015",
      ringBg: "#141427",
      border: "#23233a",
      danger: "#ff6b6b",
    },
  },
];

// -----------------
// Tiny color helpers (no deps)
// -----------------
function clamp255(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function isHex6(s) {
  return typeof s === "string" && /^#?[0-9a-fA-F]{6}$/.test(s.trim());
}
function normHex(hex) {
  if (!hex) return "#000000";
  const t = String(hex).trim();
  if (t.startsWith("#")) return `#${t.slice(1).toLowerCase()}`;
  return `#${t.toLowerCase()}`;
}
function hexToRgb(hex) {
  const h = normHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}
function rgbToHex({ r, g, b }) {
  const rr = clamp255(r).toString(16).padStart(2, "0");
  const gg = clamp255(g).toString(16).padStart(2, "0");
  const bb = clamp255(b).toString(16).padStart(2, "0");
  return `#${rr}${gg}${bb}`;
}
function mixHex(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const m = {
    r: A.r + (B.r - A.r) * t,
    g: A.g + (B.g - A.g) * t,
    b: A.b + (B.b - A.b) * t,
  };
  return rgbToHex(m);
}
function darken(hex, amount01) {
  return mixHex(hex, "#000000", Math.max(0, Math.min(1, amount01)));
}

// Relative luminance + contrast helpers
function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function relLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastRatio(a, b) {
  const L1 = relLuminance(a);
  const L2 = relLuminance(b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}
function bestTextOn(bg) {
  const black = "#0b0b0f";
  const white = "#f8fafc";
  return contrastRatio(bg, black) >= contrastRatio(bg, white) ? black : white;
}

// -----------------
// Derive a full palette from a single primary color
// (used for "Auto-fill" in the custom theme editor)
// -----------------
export function buildPaletteFromPrimary(primary, mode = "light") {
  const p = isHex6(primary) ? normHex(primary) : "#2b6dff";
  const isDark = mode === "dark";

  const bg = isDark ? "#0b1020" : "#f5f7fa";
  const card = isDark ? "#10182a" : "#ffffff";
  const border = isDark ? "#1c2a44" : "#e3e7ef";

  const text = isDark ? "#f8fafc" : "#0b1220";
  const mutedText = isDark ? "#cbd5e1" : "#5b6472";

  const primaryPressed = darken(p, 0.18);
  const primaryTextOn = bestTextOn(p);

  const ringBg = isDark ? mixHex(p, bg, 0.75) : mixHex(p, "#ffffff", 0.82);

  return {
    bg,
    card,
    text,
    mutedText,
    primary: p,
    primaryPressed,
    primaryTextOn,
    ringBg,
    border,
    danger: "#ef4444",
  };
}

// Ensures required keys exist; fills missing from a derived palette
export function ensurePaletteComplete(palette, mode = "light") {
  const base = buildPaletteFromPrimary(palette?.primary, mode);
  const safe = { ...base, ...(palette || {}) };

  const hexFields = [
    "primary",
    "bg",
    "card",
    "border",
    "text",
    "mutedText",
    "primaryTextOn",
    "primaryPressed",
    "ringBg",
    "danger",
  ];

  for (const k of hexFields) {
    if (!safe[k] || !isHex6(safe[k])) safe[k] = base[k];
    else safe[k] = normHex(safe[k]);
  }

  // keep these consistent even if user didn't enter them
  safe.primaryPressed = isHex6(palette?.primaryPressed)
    ? normHex(palette.primaryPressed)
    : darken(safe.primary, 0.18);

  safe.primaryTextOn = isHex6(palette?.primaryTextOn)
    ? normHex(palette.primaryTextOn)
    : bestTextOn(safe.primary);

  safe.danger = safe.danger || "#ef4444";
  return safe;
}

// -----------------
// Theme resolver
// choice can be:
// - built-in id: "bright-blue"
// - custom id: "custom:<uuid>"
// - legacy numeric hue: 210
// -----------------
export function makeTheme(choice, customThemes = []) {
  // 1) Custom theme selection: "custom:<id>"
  if (typeof choice === "string" && choice.startsWith(CUSTOM_THEME_PREFIX)) {
    const id = choice.slice(CUSTOM_THEME_PREFIX.length);
    const found = (customThemes || []).find(
      (t) => String(t?.id) === String(id)
    );
    if (found?.palette) {
      const bg = isHex6(found.palette.bg)
        ? normHex(found.palette.bg)
        : "#f5f7fa";
      const isDark = relLuminance(bg) < 0.35;
      const palette = ensurePaletteComplete(
        found.palette,
        isDark ? "dark" : "light"
      );
      return { ...palette, hue: choice };
    }
  }

  // 2) Built-in themes
  const builtIn = THEMES.find((t) => t.id === choice);
  if (builtIn) {
    return { ...builtIn.palette, hue: builtIn.id };
  }

  // 3) Legacy fallback (older hue-based themes)
  const asNum =
    typeof choice === "number"
      ? choice
      : typeof choice === "string"
      ? Number(choice)
      : NaN;

  const safeHue = Number.isFinite(asNum) ? asNum : 210;

  return {
    hue: safeHue,
    bg: `hsl(${safeHue}, 25%, 97%)`,
    card: `hsl(${safeHue}, 25%, 100%)`,
    text: `hsl(${safeHue}, 20%, 12%)`,
    mutedText: `hsl(${safeHue}, 10%, 42%)`,
    primary: `hsl(${safeHue}, 80%, 45%)`,
    primaryPressed: `hsl(${safeHue}, 80%, 40%)`,
    primaryTextOn: `hsl(${safeHue}, 20%, 98%)`,
    ringBg: `hsl(${safeHue}, 15%, 88%)`,
    border: `hsl(${safeHue}, 15%, 86%)`,
    danger: `hsl(0, 75%, 52%)`,
  };
}
