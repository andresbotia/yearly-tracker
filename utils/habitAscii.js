// Presentation mapping for habit check values.
// Stored numeric states stay 0 | 1 | 2. Do not write these characters back.

export function habitStateChar(value) {
  if (value === 1) return "+";
  if (value === 2) return "×";
  return ".";
}

export function habitStateLabel(value) {
  if (value === 1) return "good";
  if (value === 2) return "bad";
  return "empty";
}
