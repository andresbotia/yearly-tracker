// utils/theme.js

export const THEMES = [
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
];

export function makeTheme(choice) {
  // If the user picked a named theme, use it; otherwise fall back to hue-based
  // theme for backward compatibility.
  const found = THEMES.find((t) => t.id === choice);
  if (found) {
    return { ...found.palette, hue: found.id };
  }

  const safeHue =
    typeof choice === "number" && Number.isFinite(choice) ? choice : 210;

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
