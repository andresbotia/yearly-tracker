// features/share/shareData.js

const DAY_MS = 24 * 60 * 60 * 1000;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dateKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfDay(d) {
  const out = new Date(d);
  out.setHours(12, 0, 0, 0);
  return out;
}

function lastNDays(n, baseDate = new Date()) {
  const out = [];
  const today = startOfDay(baseDate);
  for (let i = n - 1; i >= 0; i -= 1) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    out.push(dt);
  }
  return out;
}

function formatShortDate(d) {
  return d.toLocaleString(undefined, { month: "short", day: "numeric" });
}

function goalPercent(goal) {
  if (!goal) return 0;
  if (goal.type === "boolean") return goal.progress === 1 ? 100 : 0;
  if (!goal.target || goal.target <= 0) return 0;
  return Math.max(0, Math.min(100, (goal.progress / goal.target) * 100));
}

function isGoalComplete(goal) {
  return goalPercent(goal) >= 100;
}

export function getWeeklyRecap({ habits = [], baseDate = new Date() }) {
  const days = lastNDays(7, baseDate);
  const start = days[0];
  const end = days[days.length - 1];
  const totalSlots = habits.length * days.length;

  let good = 0;
  let bad = 0;
  const perHabit = habits.map((h) => {
    let goodCount = 0;
    days.forEach((d) => {
      const v = (h.checks || {})[dateKey(d)] || 0;
      if (v === 1) {
        good += 1;
        goodCount += 1;
      } else if (v === 2) {
        bad += 1;
      }
    });
    return { title: h.title, goodCount };
  });

  const totalChecks = good + bad;
  const missed = Math.max(0, totalSlots - totalChecks);
  const consistencyPct =
    totalSlots > 0 ? Math.round((totalChecks / totalSlots) * 100) : 0;

  const topHabits = perHabit
    .filter((h) => h.goodCount > 0)
    .sort((a, b) => b.goodCount - a.goodCount)
    .slice(0, 3);

  return {
    rangeLabel: `${formatShortDate(start)} - ${formatShortDate(end)}`,
    totalChecks,
    good,
    bad,
    missed,
    consistencyPct,
    topHabits,
  };
}

export function getGoalProgress(goal) {
  if (!goal) return null;
  const pct = Math.round(goalPercent(goal));
  return {
    title: goal.title,
    pct,
    progress: goal.progress,
    target: goal.target,
    type: goal.type,
    isComplete: isGoalComplete(goal),
  };
}

export function getHabitStreak(habit, baseDate = new Date()) {
  if (!habit) return null;
  const today = startOfDay(baseDate);
  let streak = 0;
  for (let i = 0; i < 366; i += 1) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    const v = (habit.checks || {})[dateKey(dt)] || 0;
    if (v > 0) streak += 1;
    else break;
  }

  const last14 = lastNDays(14, baseDate).map((d) => {
    const v = (habit.checks || {})[dateKey(d)] || 0;
    return { key: dateKey(d), state: v };
  });

  return {
    title: habit.title,
    streak,
    last14,
  };
}

export function getYearSoFar({ habits = [], goals = [], baseDate = new Date() }) {
  const start = new Date(baseDate.getFullYear(), 0, 1);
  const startDay = startOfDay(start);
  const endDay = startOfDay(baseDate);
  const daysSoFar = Math.floor((endDay - startDay) / DAY_MS) + 1;
  const totalSlots = habits.length * daysSoFar;

  const startKey = dateKey(startDay);
  const endKey = dateKey(endDay);

  let good = 0;
  let bad = 0;

  habits.forEach((h) => {
    const checks = h.checks || {};
    Object.keys(checks).forEach((k) => {
      if (k < startKey || k > endKey) return;
      const v = checks[k] || 0;
      if (v === 1) good += 1;
      else if (v === 2) bad += 1;
    });
  });

  const missed = Math.max(0, totalSlots - good - bad);
  const goalsComplete = goals.filter((g) => isGoalComplete(g)).length;
  const avgProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce((acc, g) => acc + goalPercent(g), 0) / goals.length
        )
      : 0;

  return {
    year: baseDate.getFullYear(),
    goalsComplete,
    avgProgress,
    good,
    bad,
    missed,
  };
}
