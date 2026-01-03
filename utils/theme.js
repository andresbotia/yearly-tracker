// utils/theme.js

export const HUE_OPTIONS = [0, 30, 60, 120, 180, 210, 270, 300];

export function makeTheme(hue) {
  // Minimal, high-contrast light theme derived from one hue (HSL).
  const safeHue = typeof hue === "number" ? hue : 210;

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
