function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function asciiBar(percent, width = 24, fill = "+", empty = ".") {
  const pct = clamp(Number(percent) || 0, 0, 100);
  const filled = Math.round((pct / 100) * width);
  return `${fill.repeat(filled)}${empty.repeat(Math.max(0, width - filled))}`;
}
