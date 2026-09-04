// Year Archive — presentation derived from existing habit checks.
// Do not persist this view. Do not invent a second tracking database.
//
// Day mark formula (deterministic):
//   For calendar date key "YYYY-MM-DD" and the current habit list:
//     G = number of habits whose check is 1 (good)
//     B = number of habits whose check is 2 (bad)
//     Missing keys count as 0 (empty).
//     If G === 0 and B === 0 → "."   (nothing logged)
//     If B > G             → "×"   (more bad than good)
//     Else                 → "+"   (something logged, good >= bad)
//
// Stored habit values remain 0 | 1 | 2. These characters are display only.

import { habitStateChar } from "./habitAscii";

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function archiveDateKey(year, monthIndex, day) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function isFutureDay(year, monthIndex, day, todayDate) {
  if (!todayDate) return false;
  const y = todayDate.getFullYear();
  const m = todayDate.getMonth();
  const d = todayDate.getDate();
  if (year > y) return true;
  if (year < y) return false;
  if (monthIndex > m) return true;
  if (monthIndex < m) return false;
  return day > d;
}

export function dayMark(habits, key) {
  const list = Array.isArray(habits) ? habits : [];
  let good = 0;
  let bad = 0;
  for (const habit of list) {
    const v = (habit?.checks || {})[key] || 0;
    if (v === 1) good += 1;
    else if (v === 2) bad += 1;
  }
  if (good === 0 && bad === 0) return ".";
  if (bad > good) return "×";
  return "+";
}

export function dayLedger(habits, key) {
  const list = Array.isArray(habits) ? habits : [];
  return list.map((habit) => {
    const value = (habit?.checks || {})[key] || 0;
    return {
      id: habit.id,
      title: habit.title,
      value,
      char: habitStateChar(value),
    };
  });
}

const MONTH_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function buildYearArchive(habits, year, todayDate = new Date()) {
  const y = Number(year);
  const months = [];
  const maxMonth =
    y < todayDate.getFullYear()
      ? 11
      : y > todayDate.getFullYear()
        ? -1
        : todayDate.getMonth();

  for (let m = 0; m <= maxMonth; m += 1) {
    const count = daysInMonth(y, m);
    const days = [];
    let line = "";
    for (let d = 1; d <= count; d += 1) {
      const key = archiveDateKey(y, m, d);
      const mark = dayMark(habits, key);
      const future = isFutureDay(y, m, d, todayDate);
      days.push({ key, num: d, mark, future });
      line += mark;
    }
    months.push({
      monthIndex: m,
      short: MONTH_SHORT[m],
      label: MONTH_LONG[m],
      days,
      line,
    });
  }

  return {
    year: y,
    months,
    formula:
      "Per day: G=good(1), B=bad(2); '.' if G=B=0; '×' if B>G; otherwise '+'",
  };
}

export { MONTH_SHORT, MONTH_LONG };
