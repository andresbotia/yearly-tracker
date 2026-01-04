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
];

export function makeTheme(choice) {
  const found = THEMES.find((t) => t.id === choice);
  if (found) {
    return { ...found.palette, hue: found.id };
  }

  // fallback (older hue-based themes)
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
