// App.js

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  AppState,
  NativeModules,
  ScrollView,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableFlatList from "react-native-draggable-flatlist";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ProgressRing from "./components/ProgressRing";
import GoalItem from "./components/GoalItem";
import HabitRow from "./components/HabitRow";
import { THEMES, makeTheme } from "./utils/theme";
import {
  loadGoalsWithMeta,
  saveGoals,
  loadHue,
  saveHue,
  loadWelcomeSeen,
  setWelcomeSeen,
  // ✅ new rollover + history
  loadCurrentYear,
  saveCurrentYear,
  appendGoalHistory,
} from "./utils/storage";

const HABITS_KEY = "yt_habits_v1";
const HABITS_WELCOME_SEEN_KEY = "yt_habits_welcome_seen_v1";

const SQUARE = 34;
const LABEL_W = 140;
const LABEL_GAP = 10;

// Android-only layout patch helpers (keeps iOS exactly the same)
const ANDROID = Platform.OS === "android";

const GOAL_TEMPLATES = [
  { label: "Read books", title: "Read 20 books", type: "count", target: "20" },
  { label: "Run miles", title: "Run 200 miles", type: "count", target: "200" },
  {
    label: "Lose weight",
    title: "Lose 15 pounds",
    type: "count",
    target: "15",
  },
  { label: "Save money", title: "Save $1000", type: "count", target: "1000" },
  { label: "Workouts", title: "Do 150 workouts", type: "count", target: "150" },
  { label: "Milestone", title: "Run a 5K", type: "boolean", target: "" },
];

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function goalPercent(goal) {
  if (goal.type === "boolean") return goal.progress === 1 ? 100 : 0;
  if (!goal.target || goal.target <= 0) return 0;
  return clamp((goal.progress / goal.target) * 100, 0, 100);
}

function isGoalComplete(goal) {
  return goalPercent(goal) >= 100;
}

function sortGoals(goals) {
  const inProgress = [];
  const completed = [];

  goals.forEach((goal) => {
    if (isGoalComplete(goal)) completed.push(goal);
    else inProgress.push(goal);
  });

  return [...inProgress, ...completed];
}

function makeStarterGoals() {
  const now = Date.now();
  return [
    {
      id: uid(),
      title: "Run a 5K",
      type: "boolean",
      target: null,
      progress: 0,
      createdAt: now,
    },
    {
      id: uid(),
      title: "Read 20 books",
      type: "count",
      target: 20,
      progress: 0,
      createdAt: now,
    },
    {
      id: uid(),
      title: "Run 200 miles",
      type: "count",
      target: 200,
      progress: 0,
      createdAt: now,
    },
    {
      id: uid(),
      title: "Lose 30 pounds",
      type: "count",
      target: 30,
      progress: 0,
      createdAt: now,
    },
  ];
}

function makeStarterHabits() {
  return ["Workout", "Cardio", "Drink Water", "Read"].map((t) => ({
    id: uid(),
    title: t,
    checks: {},
  }));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dateKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthName(d) {
  return d.toLocaleString(undefined, { month: "long" });
}

function lastNDays(n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    out.push({
      key: dateKey(dt),
      num: dt.getDate(),
    });
  }
  return out;
}

export default function App() {
  const year = new Date().getFullYear();

  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState("habits");
  const [goals, setGoals] = useState([]);
  const [themeChoice, setThemeChoice] = useState("bright-blue");

  // ✅ Only allow one habit swipe-open at a time
  const openHabitSwipeRef = useRef(null); // stores Swipeable instance
  const openHabitSwipeId = useRef(null);

  // ✅ Close any currently open habit row (safe to call anytime)
  function closeOpenHabitSwipe() {
    const ref = openHabitSwipeRef.current;
    if (ref && typeof ref.close === "function") {
      try {
        ref.close();
      } catch {}
    }
    openHabitSwipeRef.current = null;
    openHabitSwipeId.current = null;
  }

  function handleHabitSwipeOpen(habitId, swipeableInstance) {
    // If another row is open, close it first
    if (
      openHabitSwipeId.current &&
      openHabitSwipeId.current !== habitId &&
      openHabitSwipeRef.current
    ) {
      closeOpenHabitSwipe();
    }

    // Track the currently open row
    openHabitSwipeRef.current = swipeableInstance || null;
    openHabitSwipeId.current = habitId || null;
  }

  function handleHabitSwipeClose(habitId) {
    // Only clear if the closing row is the one we tracked
    if (openHabitSwipeId.current === habitId) {
      openHabitSwipeRef.current = null;
      openHabitSwipeId.current = null;
    }
  }

  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const [habitsWelcomeOpen, setHabitsWelcomeOpen] = useState(false);
  const [habitsWelcomeSeen, setHabitsWelcomeSeen] = useState(true);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("count");
  const [targetText, setTargetText] = useState("10");

  const [editOpen, setEditOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [editValue, setEditValue] = useState("0");
  const editAnim = useRef(new Animated.Value(0)).current;

  const [habits, setHabits] = useState([]);
  const [habitAddOpen, setHabitAddOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState("");

  // ✅ Step 2: hide completed toggle
  const [hideCompleted, setHideCompleted] = useState(false);

  // ✅ Step 1: undo toast
  const [undo, setUndo] = useState(null); // { kind: 'goal'|'habit', item, index }
  const undoTimerRef = useRef(null);

  // ✅ Annual rollover modal + source year
  const [yearRolloverOpen, setYearRolloverOpen] = useState(false);
  const [rolloverFromYear, setRolloverFromYear] = useState(null);

  // ✅ earlier chat: edit goal details modal
  const [goalDetailsOpen, setGoalDetailsOpen] = useState(false);
  const [goalDetailsGoal, setGoalDetailsGoal] = useState(null);
  const [goalDetailsTitle, setGoalDetailsTitle] = useState("");
  const [goalDetailsType, setGoalDetailsType] = useState("count");
  const [goalDetailsTargetText, setGoalDetailsTargetText] = useState("10");

  // ✅ earlier chat: edit habit title modal
  const [habitEditOpen, setHabitEditOpen] = useState(false);
  const [habitEditHabit, setHabitEditHabit] = useState(null);
  const [habitEditTitle, setHabitEditTitle] = useState("");

  const theme = useMemo(() => makeTheme(themeChoice), [themeChoice]);
  const dates = useMemo(() => lastNDays(5), [activeTab]);

  const [goalDragging, setGoalDragging] = useState(false);
  const [habitDragging, setHabitDragging] = useState(false);

  const yearlyPercent = useMemo(() => {
    if (!goals.length) return 0;
    const sum = goals.reduce((acc, g) => acc + goalPercent(g), 0);
    return sum / goals.length;
  }, [goals]);

  const visibleGoals = useMemo(() => {
    if (!hideCompleted) return goals;
    return goals.filter((g) => !isGoalComplete(g));
  }, [goals, hideCompleted]);

  const WidgetBridge = useMemo(() => {
    if (Platform.OS !== "ios") return null;
    const mod = NativeModules?.WidgetBridge ?? null;
    return mod;
  }, []);

  function yearlyPercentFromGoals(goalsArr) {
    if (!Array.isArray(goalsArr) || goalsArr.length === 0) return 0;
    const sum = goalsArr.reduce((acc, g) => acc + goalPercent(g), 0);
    return sum / goalsArr.length;
  }

  function habitTodayState(habit) {
    const key = dateKey(new Date());
    const v = (habit?.checks || {})[key] || 0;
    return v === 1 ? 1 : v === 2 ? 2 : 0;
  }

  function buildWidgetPayload(nextGoals, nextHabits) {
    const yp = yearlyPercentFromGoals(nextGoals);
    const yearlyProgress01 = clamp(yp / 100, 0, 1);

    return {
      yearlyProgress: yearlyProgress01,
      theme: String(theme?.hue ?? themeChoice ?? ""),
      goals: (nextGoals || []).map((g) => ({
        id: String(g.id),
        title: String(g.title || ""),
        percent: clamp(goalPercent(g) / 100, 0, 1),
      })),
      habits: (nextHabits || []).map((h) => ({
        id: String(h.id),
        title: String(h.title || ""),
        todayState: habitTodayState(h),
      })),
    };
  }

  function pushWidgets(nextGoals, nextHabits) {
    if (Platform.OS !== "ios") return;
    if (!WidgetBridge?.setWidgetPayload) return;

    try {
      const payload = buildWidgetPayload(nextGoals, nextHabits);
      WidgetBridge.setWidgetPayload(JSON.stringify(payload));
    } catch (e) {
      console.log("Widget sync failed:", e);
    }
  }

  function playEditOpenAnim() {
    editAnim.setValue(0);
    Animated.spring(editAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 90,
    }).start();
  }

  async function hapticLight() {
    try {
      await Haptics.selectionAsync();
    } catch {}
  }

  async function hapticSuccess() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  }

  async function hapticDragStart() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }

  async function loadHabits() {
    try {
      const raw = await AsyncStorage.getItem(HABITS_KEY);
      if (!raw) return { habits: [], hasStoredValue: false };
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return { habits: [], hasStoredValue: false };
      return { habits: parsed, hasStoredValue: true };
    } catch {
      return { habits: [], hasStoredValue: false };
    }
  }

  async function saveHabits(next) {
    setHabits(next);
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(next));
    } catch {}
  }

  async function loadHabitsWelcomeSeen() {
    try {
      const raw = await AsyncStorage.getItem(HABITS_WELCOME_SEEN_KEY);
      return raw === "1";
    } catch {
      return true;
    }
  }

  async function setHabitsWelcomeSeenFlag() {
    try {
      await AsyncStorage.setItem(HABITS_WELCOME_SEEN_KEY, "1");
    } catch {}
  }

  function showUndo(kind, item, index) {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndo({ kind, item, index });
    undoTimerRef.current = setTimeout(() => {
      setUndo(null);
      undoTimerRef.current = null;
    }, 4500);
  }

  async function performUndo() {
    if (!undo) return;

    if (undo.kind === "goal") {
      const idx = Number.isFinite(undo.index) ? undo.index : 0;
      const next = [...goals];
      next.splice(clamp(idx, 0, next.length), 0, undo.item);
      await persistGoals(next);
      await hapticSuccess();
    } else {
      const idx = Number.isFinite(undo.index) ? undo.index : 0;
      const next = [...habits];
      next.splice(clamp(idx, 0, next.length), 0, undo.item);
      await saveHabits(next);
      await hapticSuccess();
    }

    setUndo(null);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }

  useEffect(() => {
    if (activeTab !== "habits") closeOpenHabitSwipe();
  }, [activeTab]);

  // ✅ Helper: summary + snapshot
  function computeGoalSummary(goalsArr) {
    const safe = Array.isArray(goalsArr) ? goalsArr : [];
    const totalCount = safe.length;

    if (!totalCount) {
      return { avgPercent: 0, completedCount: 0, totalCount: 0 };
    }

    let sum = 0;
    let completedCount = 0;

    for (const g of safe) {
      const pct = goalPercent(g);
      sum += pct;
      if (pct >= 100) completedCount += 1;
    }

    const avgPercent = Number((sum / totalCount).toFixed(1));
    return { avgPercent, completedCount, totalCount };
  }

  function buildHistoryEntry(prevYear, goalsArr) {
    const safe = Array.isArray(goalsArr) ? goalsArr : [];
    return {
      year: Number(prevYear),
      savedAt: Date.now(),
      goals: safe.map((g) => ({
        id: g?.id,
        title: g?.title,
        type: g?.type,
        target: g?.target ?? null,
        progress: g?.progress ?? 0,
        createdAt: g?.createdAt ?? null,
      })),
      summary: computeGoalSummary(safe),
    };
  }

  async function commitRolloverSnapshot() {
    // Only snapshot when there was an actual previous year stored
    const prev = Number(rolloverFromYear);
    if (!Number.isFinite(prev)) return;

    // Snapshot the "previous year" goals before applying changes
    const entry = buildHistoryEntry(prev, goals);
    await appendGoalHistory(entry);
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [
          { goals: storedGoals, hasStoredValue: hasGoalStorage },
          storedHue,
          welcomeSeen,
          { habits: storedHabits, hasStoredValue: hasHabitStorage },
          habitsSeenFlag,
          storedYear,
        ] = await Promise.all([
          loadGoalsWithMeta(),
          loadHue(),
          loadWelcomeSeen(),
          loadHabits(),
          loadHabitsWelcomeSeen(),
          loadCurrentYear(), // ✅ new
        ]);

        if (!mounted) return;

        let finalGoals = [];
        let finalHabits = [];

        if (!hasGoalStorage) {
          const seeded = makeStarterGoals();
          finalGoals = sortGoals(seeded);
          setGoals(finalGoals);
          await saveGoals(finalGoals);
        } else {
          finalGoals = sortGoals(storedGoals);
          setGoals(finalGoals);
        }

        if (typeof storedHue === "number" || typeof storedHue === "string") {
          setThemeChoice(storedHue);
        }

        if (!hasHabitStorage) {
          finalHabits = makeStarterHabits();
          setHabits(finalHabits);
          try {
            await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(finalHabits));
          } catch {}
        } else {
          finalHabits = storedHabits;
          setHabits(finalHabits);
        }

        setHabitsWelcomeSeen(habitsSeenFlag);

        if (!welcomeSeen) setWelcomeOpen(true);

        if (storedYear == null) {
          // If truly first run, set and do nothing
          await saveCurrentYear(year);
        } else if (storedYear !== year) {
          // Year changed: block with rollover modal after data loads
          setRolloverFromYear(storedYear);
          setYearRolloverOpen(true);
        } else {
          // Ensure new key is present even if we only had legacy
          await saveCurrentYear(year);
        }

        pushWidgets(finalGoals, finalHabits);
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [WidgetBridge]);

  useEffect(() => {
    if (!ready) return;
    pushWidgets(goals, habits);
  }, [ready, goals, habits, themeChoice]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        pushWidgets(goals, habits);
      }
    });

    return () => sub.remove?.();
  }, [ready, goals, habits, themeChoice]);

  useEffect(() => {
    if (activeTab !== "habits") return;
    if (habitsWelcomeSeen) return;
    if (welcomeOpen) return;

    setHabitsWelcomeOpen(true);
    setHabitsWelcomeSeen(true);
    setHabitsWelcomeSeenFlag();
  }, [activeTab, habitsWelcomeSeen, welcomeOpen]);

  async function persistGoals(nextGoals) {
    const ordered = sortGoals(nextGoals);
    setGoals(ordered);
    await saveGoals(ordered);
  }

  async function closeWelcome() {
    setWelcomeOpen(false);
    await setWelcomeSeen();

    setHabitsWelcomeSeen(true);
    await setHabitsWelcomeSeenFlag();
  }

  function normalizeNewGoal() {
    const cleanTitle = title.trim();
    if (!cleanTitle) return null;

    if (type === "boolean") {
      return {
        id: uid(),
        title: cleanTitle,
        type: "boolean",
        target: null,
        progress: 0,
        createdAt: Date.now(),
      };
    }

    const t = Number(targetText);
    if (!Number.isFinite(t) || t <= 0) return null;

    return {
      id: uid(),
      title: cleanTitle,
      type: "count",
      target: Math.floor(t),
      progress: 0,
      createdAt: Date.now(),
    };
  }

  async function handleAddGoal() {
    const g = normalizeNewGoal();
    if (!g) return;

    const next = [g, ...goals];
    await persistGoals(next);

    setTitle("");
    setType("count");
    setTargetText("10");
    setAddOpen(false);

    await hapticSuccess(); // ✅ Step 6
  }

  async function handleDeleteGoal(id) {
    await hapticLight();

    const idx = goals.findIndex((g) => g.id === id);
    const item = goals.find((g) => g.id === id);
    const next = goals.filter((g) => g.id !== id);

    await persistGoals(next);

    if (item) showUndo("goal", item, idx); // ✅ Step 1
  }

  async function openEdit(goal) {
    await hapticLight();
    setEditGoal(goal);

    if (goal.type === "count") {
      setEditValue(String(goal.progress ?? 0));
    } else {
      setEditValue("0");
    }

    setEditOpen(true);
    playEditOpenAnim();
  }

  function closeEdit() {
    setEditOpen(false);
    setEditGoal(null);
    setEditValue("0");
  }

  async function bumpEditCount(delta) {
    if (!editGoal || editGoal.type !== "count") return;

    await hapticLight();

    const t = editGoal.target || 0;
    const cur = Number(editValue);
    const curSafe = Number.isFinite(cur) ? cur : 0;

    const next = clamp(Math.floor(curSafe + delta), 0, t);
    setEditValue(String(next));
  }

  async function saveEditCount() {
    if (!editGoal || editGoal.type !== "count") return;

    const t = editGoal.target || 0;
    const n = Number(editValue);
    if (!Number.isFinite(n)) return;

    const nextProgress = clamp(Math.floor(n), 0, t);

    const next = goals.map((g) =>
      g.id === editGoal.id ? { ...g, progress: nextProgress } : g
    );

    const willBeComplete = t > 0 && nextProgress >= t;
    if (willBeComplete) await hapticSuccess();
    else await hapticLight();

    await persistGoals(next);
    closeEdit();
  }

  async function setMilestoneComplete(done) {
    if (!editGoal || editGoal.type !== "boolean") return;

    if (done) await hapticSuccess();
    else await hapticLight();

    const next = goals.map((g) =>
      g.id === editGoal.id ? { ...g, progress: done ? 1 : 0 } : g
    );
    await persistGoals(next);
    closeEdit();
  }

  // ✅ Goal details editing (title/type/goal number) — keeps progress
  async function openGoalDetails(goal) {
    await hapticLight();
    setGoalDetailsGoal(goal);
    setGoalDetailsTitle(String(goal.title || ""));
    setGoalDetailsType(goal.type === "boolean" ? "boolean" : "count");
    setGoalDetailsTargetText(
      goal.type === "count" && goal.target ? String(goal.target) : "10"
    );
    setGoalDetailsOpen(true);
  }

  function closeGoalDetails() {
    setGoalDetailsOpen(false);
    setGoalDetailsGoal(null);
    setGoalDetailsTitle("");
    setGoalDetailsType("count");
    setGoalDetailsTargetText("10");
  }

  async function saveGoalDetails() {
    if (!goalDetailsGoal) return;

    const cleanTitle = goalDetailsTitle.trim();
    if (!cleanTitle) return;

    let nextType = goalDetailsType === "boolean" ? "boolean" : "count";

    let nextTarget = null;
    if (nextType === "count") {
      const t = Number(goalDetailsTargetText);
      if (!Number.isFinite(t) || t <= 0) return;
      nextTarget = Math.floor(t);
    }

    const next = goals.map((g) => {
      if (g.id !== goalDetailsGoal.id) return g;

      // keep progress as best as possible
      let nextProgress = g.progress ?? 0;

      if (nextType === "boolean") {
        nextProgress = nextProgress >= 1 ? 1 : 0;
        return {
          ...g,
          title: cleanTitle,
          type: "boolean",
          target: null,
          progress: nextProgress,
        };
      }

      // count
      if (!Number.isFinite(nextProgress)) nextProgress = 0;
      nextProgress = clamp(Math.floor(nextProgress), 0, nextTarget || 0);

      return {
        ...g,
        title: cleanTitle,
        type: "count",
        target: nextTarget,
        progress: nextProgress,
      };
    });

    await persistGoals(next);
    closeGoalDetails();
    await hapticSuccess(); // ✅ Step 6
  }

  async function handlePickTheme(nextTheme) {
    setThemeChoice(nextTheme);
    await saveHue(nextTheme);
    await hapticSuccess(); // ✅ Step 6
  }

  async function addHabit() {
    const t = habitTitle.trim();
    if (!t) return;

    await hapticLight();

    const next = [{ id: uid(), title: t, checks: {} }, ...habits];
    setHabitTitle("");
    setHabitAddOpen(false);
    await saveHabits(next);

    await hapticSuccess(); // ✅ Step 6
  }

  async function toggleHabit(habitId, dayKey) {
    await hapticLight();

    const next = habits.map((h) => {
      if (h.id !== habitId) return h;

      const checks = { ...(h.checks || {}) };
      const cur = checks[dayKey] || 0;

      let nextVal = 0;
      if (cur === 0) nextVal = 1;
      else if (cur === 1) nextVal = 2;
      else nextVal = 0;

      if (nextVal === 0) delete checks[dayKey];
      else checks[dayKey] = nextVal;

      return { ...h, checks };
    });

    await saveHabits(next);

    // subtle “success” when marking good (1)
    const h = next.find((x) => x.id === habitId);
    if (h) {
      const v = (h.checks || {})[dayKey] || 0;
      if (v === 1) await hapticSuccess();
    }
  }

  async function deleteHabit(habitId) {
    await hapticLight();

    const idx = habits.findIndex((h) => h.id === habitId);
    const item = habits.find((h) => h.id === habitId);
    const next = habits.filter((h) => h.id !== habitId);

    await saveHabits(next);

    if (item) showUndo("habit", item, idx); // ✅ Step 1
  }

  // ✅ Habit title editing
  async function openHabitEdit(habit) {
    await hapticLight();
    setHabitEditHabit(habit);
    setHabitEditTitle(String(habit?.title || ""));
    setHabitEditOpen(true);
  }

  function closeHabitEdit() {
    setHabitEditOpen(false);
    setHabitEditHabit(null);
    setHabitEditTitle("");
  }

  async function saveHabitEdit() {
    if (!habitEditHabit) return;
    const t = habitEditTitle.trim();
    if (!t) return;

    const next = habits.map((h) =>
      h.id === habitEditHabit.id ? { ...h, title: t } : h
    );

    await saveHabits(next);
    closeHabitEdit();
    await hapticSuccess(); // ✅ Step 6
  }

  // ✅ Annual rollover handlers (GOALS only; HABITS unchanged)
  async function handleRolloverCarryOver() {
    await hapticLight();

    // snapshot previous year goals
    await commitRolloverSnapshot();

    // keep goals as-is, just commit new year
    await saveCurrentYear(year);

    setYearRolloverOpen(false);
    setRolloverFromYear(null);

    pushWidgets(goals, habits);
    await hapticSuccess();
  }

  async function handleRolloverResetProgress() {
    await hapticLight();

    await commitRolloverSnapshot();

    const resetGoals = goals.map((g) => ({
      ...g,
      progress: 0,
    }));

    await persistGoals(resetGoals);
    await saveCurrentYear(year);

    setYearRolloverOpen(false);
    setRolloverFromYear(null);

    pushWidgets(resetGoals, habits);
    await hapticSuccess();
  }

  async function handleRolloverStartNewGoals() {
    await hapticLight();

    await commitRolloverSnapshot();

    const cleared = [];
    await persistGoals(cleared);
    await saveCurrentYear(year);

    setYearRolloverOpen(false);
    setRolloverFromYear(null);

    pushWidgets(cleared, habits);
    await hapticSuccess();
  }

  async function handleRolloverDecideLater() {
    await hapticLight();
    // Do NOT update currentYear key; re-prompt next app open
    setYearRolloverOpen(false);
    pushWidgets(goals, habits);
  }

  const topHeader = (
    <View style={styles.header}>
      <Text style={[styles.appTitle, { color: theme.text }]}>
        Yearly Tracker
      </Text>
      <Text style={[styles.yearText, { color: theme.mutedText }]}>{year}</Text>

      <View style={[styles.tabRow, ANDROID && styles.noGap]}>
        <Pressable
          onPress={() => {
            closeOpenHabitSwipe();
            setActiveTab("habits");
          }}
          style={[
            styles.tabPill,
            {
              backgroundColor:
                activeTab === "habits" ? theme.primary : theme.card,
              borderColor:
                activeTab === "habits" ? theme.primary : theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "habits" ? theme.primaryTextOn : theme.text,
              },
            ]}
          >
            Habits
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            closeOpenHabitSwipe();
            setActiveTab("goals");
          }}
          style={[
            styles.tabPill,
            ANDROID && styles.ml10,
            {
              backgroundColor:
                activeTab === "goals" ? theme.primary : theme.card,
              borderColor: activeTab === "goals" ? theme.primary : theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "goals" ? theme.primaryTextOn : theme.text,
              },
            ]}
          >
            Goals
          </Text>
        </Pressable>
      </View>

      {activeTab === "goals" ? (
        <>
          <View style={styles.ringCard(theme)}>
            <ProgressRing
              size={176}
              strokeWidth={14}
              percent={yearlyPercent}
              theme={theme}
              label="Year completion"
            />
            <View style={{ marginTop: 12, alignItems: "center" }}>
              <Text style={[styles.bigPct, { color: theme.text }]}>
                {Math.round(yearlyPercent)}%
              </Text>
              <Text style={[styles.bigPctSub, { color: theme.mutedText }]}>
                average across goals
              </Text>
            </View>
          </View>

          <View style={[styles.actionsRow, ANDROID && styles.noGap]}>
            <Pressable
              onPress={() => setAddOpen(true)}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: pressed
                    ? theme.primaryPressed
                    : theme.primary,
                },
              ]}
            >
              <Text
                style={[styles.primaryBtnText, { color: theme.primaryTextOn }]}
              >
                Add Goal
              </Text>
            </Pressable>
          </View>

          <View style={styles.divider(theme)} />

          <View style={[styles.sectionHeaderRow, ANDROID && styles.noGap]}>
            <Text style={[styles.sectionTitle, { color: theme.mutedText }]}>
              Goals
            </Text>

            <Pressable
              onPress={async () => {
                await hapticLight();
                setHideCompleted((v) => !v);
              }}
              style={({ pressed }) => [
                styles.togglePill,
                {
                  borderColor: theme.border,
                  backgroundColor: pressed ? theme.border : theme.card,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Toggle hide completed goals"
            >
              <Text style={[styles.toggleText, { color: theme.text }]}>
                {hideCompleted ? "Show completed" : "Hide completed"}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <View style={styles.habitsHeaderGrid}>
            <View style={{ width: LABEL_W, paddingRight: LABEL_GAP }}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.monthTitle, { color: theme.text }]}
              >
                {monthName(new Date())}
              </Text>
            </View>

            <View style={styles.daysRow}>
              {dates.map((d) => (
                <View key={d.key} style={styles.dayCell}>
                  <Text style={[styles.dayNum, { color: theme.mutedText }]}>
                    {d.num}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider(theme)} />
        </>
      )}
    </View>
  );

  if (!ready) {
    return (
      <GestureHandlerRootView style={styles.safe}>
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.safe}>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        {activeTab === "goals" ? (
          <DraggableFlatList
            activationDistance={12}
            data={visibleGoals}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={topHeader}
            onDragBegin={() => {
              if (!goalDragging) {
                setGoalDragging(true);
                hapticDragStart();
              }
            }}
            onDragEnd={({ data }) => {
              setGoalDragging(false);

              if (hideCompleted) {
                const completed = goals.filter((g) => isGoalComplete(g));
                const merged = [...data, ...completed];
                persistGoals(merged);
              } else {
                persistGoals(data);
              }
            }}
            renderItem={({ item, drag, isActive }) => (
              <GoalItem
                goal={item}
                theme={theme}
                onProgress={openEdit}
                onEditDetails={openGoalDetails}
                onDelete={handleDeleteGoal}
                onDrag={drag}
                dragging={isActive}
              />
            )}
          />
        ) : (
          <DraggableFlatList
            activationDistance={12}
            data={habits}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={topHeader}
            onDragBegin={() => {
              closeOpenHabitSwipe(); // ✅ prevents a row staying open while dragging
              if (!habitDragging) {
                setHabitDragging(true);
                hapticDragStart();
              }
            }}
            onDragEnd={({ data }) => {
              setHabitDragging(false);
              saveHabits(data);
            }}
            renderItem={({ item, drag, isActive }) => (
              <HabitRow
                habit={item}
                dates={dates}
                theme={theme}
                onToggle={toggleHabit}
                onDelete={deleteHabit}
                onEdit={openHabitEdit}
                onDrag={drag}
                dragging={isActive}
                labelWidth={LABEL_W}
                squareSize={SQUARE}
                labelGap={LABEL_GAP}
                onSwipeOpen={handleHabitSwipeOpen}
                onSwipeClose={handleHabitSwipeClose}
              />
            )}
            ListFooterComponent={
              <View style={{ marginTop: 14 }}>
                <View style={[styles.actionsRow, ANDROID && styles.noGap]}>
                  <Pressable
                    onPress={() => setHabitAddOpen(true)}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      {
                        backgroundColor: pressed
                          ? theme.primaryPressed
                          : theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.primaryBtnText,
                        { color: theme.primaryTextOn },
                      ]}
                    >
                      Add Habit
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setCustomizeOpen(true)}
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      ANDROID && styles.ml10,
                      {
                        backgroundColor: pressed ? theme.border : theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.secondaryBtnText, { color: theme.text }]}
                    >
                      Theme
                    </Text>
                  </Pressable>
                </View>
              </View>
            }
          />
        )}

        {/* ✅ Step 1: Undo toast */}
        {!!undo && (
          <View
            style={[
              styles.undoWrap,
              { borderColor: theme.border, backgroundColor: theme.card },
            ]}
          >
            <Text
              style={[styles.undoText, { color: theme.text }]}
              numberOfLines={1}
            >
              {undo.kind === "goal" ? "Goal deleted" : "Habit deleted"}
            </Text>

            <Pressable
              onPress={performUndo}
              style={({ pressed }) => [
                styles.undoBtn,
                {
                  backgroundColor: pressed
                    ? theme.primaryPressed
                    : theme.primary,
                },
              ]}
            >
              <Text
                style={[styles.undoBtnText, { color: theme.primaryTextOn }]}
              >
                Undo
              </Text>
            </Pressable>
          </View>
        )}

        {/* ✅ Annual rollover (blocking until a choice or "later") */}
        <Modal
          visible={yearRolloverOpen}
          animationType="fade"
          transparent
          // blocking: don't allow back button to dismiss without a choice
          onRequestClose={() => {}}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                New year detected
              </Text>

              <Text
                style={[
                  styles.modalSub,
                  { color: theme.mutedText, marginTop: 10, lineHeight: 18 },
                ]}
              >
                It’s {year}. What do you want to do with your goals?
              </Text>

              {!!rolloverFromYear && (
                <Text
                  style={[
                    styles.modalSub,
                    { color: theme.mutedText, marginTop: 8, lineHeight: 18 },
                  ]}
                >
                  We’ll save a snapshot of {rolloverFromYear} before applying
                  your choice.
                </Text>
              )}

              <View style={styles.rolloverStack}>
                <Pressable
                  onPress={handleRolloverCarryOver}
                  style={({ pressed }) => [
                    styles.rolloverBtn,
                    {
                      backgroundColor: pressed ? theme.border : theme.bg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.rolloverBtnTitle, { color: theme.text }]}
                  >
                    Keep goals + keep progress
                  </Text>
                  <Text
                    style={[styles.rolloverBtnSub, { color: theme.mutedText }]}
                  >
                    Carry everything over into {year}.
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleRolloverResetProgress}
                  style={({ pressed }) => [
                    styles.rolloverBtn,
                    {
                      backgroundColor: pressed ? theme.border : theme.bg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.rolloverBtnTitle, { color: theme.text }]}
                  >
                    Keep goals, reset progress
                  </Text>
                  <Text
                    style={[styles.rolloverBtnSub, { color: theme.mutedText }]}
                  >
                    Start fresh at 0 while keeping the list.
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleRolloverStartNewGoals}
                  style={({ pressed }) => [
                    styles.rolloverBtn,
                    {
                      backgroundColor: pressed
                        ? theme.primaryPressed
                        : theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.rolloverBtnTitle,
                      { color: theme.primaryTextOn },
                    ]}
                  >
                    Start new goals
                  </Text>
                  <Text
                    style={[
                      styles.rolloverBtnSub,
                      { color: theme.primaryTextOn, opacity: 0.9 },
                    ]}
                  >
                    Clear your goals list for a clean slate.
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleRolloverDecideLater}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    {
                      alignSelf: "flex-end",
                      marginTop: 6,
                      backgroundColor: pressed ? theme.border : theme.bg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.modalBtnText, { color: theme.text }]}>
                    Decide later
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Habits welcome */}
        <Modal
          visible={habitsWelcomeOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setHabitsWelcomeOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Habits
              </Text>

              <Text
                style={[
                  styles.modalSub,
                  { color: theme.mutedText, marginTop: 10, lineHeight: 18 },
                ]}
              >
                Tap a square to track that day. Tap cycles: Off → Good → Bad →
                Off.
              </Text>

              <View style={{ marginTop: 10 }}>
                <Text style={[styles.bullet, { color: theme.text }]}>
                  • Simple habits (like reading) are basically On/Off.
                </Text>
                <Text style={[styles.bullet, { color: theme.text }]}>
                  • Working out can be marked “good” or “bad”.
                </Text>
                <Text style={[styles.bullet, { color: theme.text }]}>
                  • Swipe a habit left to edit or delete it.
                </Text>
                <Text style={[styles.bullet, { color: theme.text }]}>
                  • Press and hold a habit to reorder it.
                </Text>
              </View>

              <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                <Pressable
                  onPress={() => setHabitsWelcomeOpen(false)}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    {
                      backgroundColor: pressed
                        ? theme.primaryPressed
                        : theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalBtnText,
                      { color: theme.primaryTextOn },
                    ]}
                  >
                    Got it
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Main welcome */}
        <Modal
          visible={welcomeOpen}
          animationType="fade"
          transparent
          onRequestClose={closeWelcome}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Welcome to Yearly Tracker
              </Text>

              <Text
                style={[
                  styles.modalSub,
                  { color: theme.mutedText, marginTop: 10, lineHeight: 18 },
                ]}
              >
                “Success is the product of daily habits—not once-in-a-lifetime
                transformations.”
              </Text>
              <Text
                style={[
                  styles.modalSub,
                  { color: theme.mutedText, marginTop: 6 },
                ]}
              >
                — James Clear
              </Text>

              <View style={{ marginTop: 14 }}>
                <Text style={[styles.bullet, { color: theme.text }]}>
                  • No accounts
                </Text>
                <Text style={[styles.bullet, { color: theme.text }]}>
                  • No tracking or analytics
                </Text>
                <Text style={[styles.bullet, { color: theme.text }]}>
                  • Everything is stored locally on your phone
                </Text>
              </View>

              <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                <Pressable
                  onPress={closeWelcome}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    {
                      backgroundColor: pressed
                        ? theme.primaryPressed
                        : theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalBtnText,
                      { color: theme.primaryTextOn },
                    ]}
                  >
                    Get Started
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Habit */}
        <Modal
          visible={habitEditOpen}
          animationType="fade"
          transparent
          onRequestClose={closeHabitEdit}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Edit Habit
              </Text>

              <Text style={[styles.label, { color: theme.mutedText }]}>
                Habit name
              </Text>
              <TextInput
                value={habitEditTitle}
                onChangeText={setHabitEditTitle}
                placeholder="e.g., Workout"
                placeholderTextColor={theme.mutedText}
                style={[
                  styles.input,
                  {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.bg,
                  },
                ]}
                autoCorrect={false}
                autoCapitalize="words"
                maxLength={24}
              />

              <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                <Pressable
                  onPress={closeHabitEdit}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    {
                      backgroundColor: pressed ? theme.border : theme.bg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.modalBtnText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={saveHabitEdit}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    ANDROID && styles.ml10,
                    {
                      backgroundColor: pressed
                        ? theme.primaryPressed
                        : theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalBtnText,
                      { color: theme.primaryTextOn },
                    ]}
                  >
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Habit */}
        <Modal
          visible={habitAddOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setHabitAddOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Add Habit
              </Text>

              <Text style={[styles.label, { color: theme.mutedText }]}>
                Habit name
              </Text>
              <TextInput
                value={habitTitle}
                onChangeText={setHabitTitle}
                placeholder="e.g., Workout"
                placeholderTextColor={theme.mutedText}
                style={[
                  styles.input,
                  {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.bg,
                  },
                ]}
                autoCorrect={false}
                autoCapitalize="words"
                maxLength={24}
              />

              <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                <Pressable
                  onPress={() => setHabitAddOpen(false)}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    {
                      backgroundColor: pressed ? theme.border : theme.bg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.modalBtnText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={addHabit}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    ANDROID && styles.ml10,
                    {
                      backgroundColor: pressed
                        ? theme.primaryPressed
                        : theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalBtnText,
                      { color: theme.primaryTextOn },
                    ]}
                  >
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Goal Details */}
        <Modal
          visible={goalDetailsOpen}
          animationType="slide"
          transparent
          onRequestClose={closeGoalDetails}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Edit Goal
              </Text>

              <Text style={[styles.label, { color: theme.mutedText }]}>
                Title
              </Text>
              <TextInput
                value={goalDetailsTitle}
                onChangeText={setGoalDetailsTitle}
                placeholder="e.g., Read 30 books"
                placeholderTextColor={theme.mutedText}
                style={[
                  styles.input,
                  {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.bg,
                  },
                ]}
                autoCorrect={false}
                autoCapitalize="sentences"
                maxLength={60}
              />

              <Text style={[styles.label, { color: theme.mutedText }]}>
                Type
              </Text>
              <View style={[styles.typeRow, ANDROID && styles.noGap]}>
                <Pressable
                  onPress={() => setGoalDetailsType("count")}
                  style={({ pressed }) => [
                    styles.pill,
                    {
                      backgroundColor:
                        goalDetailsType === "count" ? theme.primary : theme.bg,
                      borderColor:
                        goalDetailsType === "count"
                          ? theme.primary
                          : theme.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color:
                          goalDetailsType === "count"
                            ? theme.primaryTextOn
                            : theme.text,
                      },
                    ]}
                  >
                    Count
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setGoalDetailsType("boolean")}
                  style={({ pressed }) => [
                    styles.pill,
                    ANDROID && styles.ml10,
                    {
                      backgroundColor:
                        goalDetailsType === "boolean"
                          ? theme.primary
                          : theme.bg,
                      borderColor:
                        goalDetailsType === "boolean"
                          ? theme.primary
                          : theme.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color:
                          goalDetailsType === "boolean"
                            ? theme.primaryTextOn
                            : theme.text,
                      },
                    ]}
                  >
                    Milestone
                  </Text>
                </Pressable>
              </View>

              {goalDetailsType === "count" && (
                <>
                  <Text style={[styles.label, { color: theme.mutedText }]}>
                    Goal
                  </Text>
                  <TextInput
                    value={goalDetailsTargetText}
                    onChangeText={setGoalDetailsTargetText}
                    keyboardType={
                      Platform.OS === "ios" ? "number-pad" : "numeric"
                    }
                    placeholder="e.g., 30"
                    placeholderTextColor={theme.mutedText}
                    style={[
                      styles.input,
                      {
                        borderColor: theme.border,
                        color: theme.text,
                        backgroundColor: theme.bg,
                      },
                    ]}
                    maxLength={6}
                  />
                </>
              )}

              <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                <Pressable
                  onPress={closeGoalDetails}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    {
                      backgroundColor: pressed ? theme.border : theme.bg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.modalBtnText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={saveGoalDetails}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    ANDROID && styles.ml10,
                    {
                      backgroundColor: pressed
                        ? theme.primaryPressed
                        : theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalBtnText,
                      { color: theme.primaryTextOn },
                    ]}
                  >
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Goal */}
        <Modal
          visible={addOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setAddOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Add Goal
              </Text>

              {/* ✅ Step 4: Templates */}
              <Text style={[styles.label, { color: theme.mutedText }]}>
                Templates
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 8 }}
                contentContainerStyle={[
                  styles.templateRow,
                  ANDROID && styles.noGap,
                ]}
              >
                {GOAL_TEMPLATES.map((t) => (
                  <Pressable
                    key={t.label}
                    onPress={async () => {
                      await hapticLight();
                      setTitle(t.title);
                      setType(t.type);
                      if (t.type === "count") setTargetText(t.target);
                    }}
                    style={({ pressed }) => [
                      styles.templateChip,
                      {
                        borderColor: theme.border,
                        backgroundColor: pressed ? theme.border : theme.bg,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.templateChipText, { color: theme.text }]}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: theme.mutedText }]}>
                Title
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Read 20 books"
                placeholderTextColor={theme.mutedText}
                style={[
                  styles.input,
                  {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.bg,
                  },
                ]}
                autoCorrect={false}
                autoCapitalize="sentences"
                maxLength={60}
              />

              <Text style={[styles.label, { color: theme.mutedText }]}>
                Type
              </Text>
              <View style={[styles.typeRow, ANDROID && styles.noGap]}>
                <Pressable
                  onPress={() => setType("count")}
                  style={({ pressed }) => [
                    styles.pill,
                    {
                      backgroundColor:
                        type === "count" ? theme.primary : theme.bg,
                      borderColor:
                        type === "count" ? theme.primary : theme.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color:
                          type === "count" ? theme.primaryTextOn : theme.text,
                      },
                    ]}
                  >
                    Count
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setType("boolean")}
                  style={({ pressed }) => [
                    styles.pill,
                    ANDROID && styles.ml10,
                    {
                      backgroundColor:
                        type === "boolean" ? theme.primary : theme.bg,
                      borderColor:
                        type === "boolean" ? theme.primary : theme.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color:
                          type === "boolean" ? theme.primaryTextOn : theme.text,
                      },
                    ]}
                  >
                    Milestone
                  </Text>
                </Pressable>
              </View>

              {type === "count" && (
                <>
                  <Text style={[styles.label, { color: theme.mutedText }]}>
                    Goal
                  </Text>
                  <TextInput
                    value={targetText}
                    onChangeText={setTargetText}
                    keyboardType={
                      Platform.OS === "ios" ? "number-pad" : "numeric"
                    }
                    placeholder="e.g., 10"
                    placeholderTextColor={theme.mutedText}
                    style={[
                      styles.input,
                      {
                        borderColor: theme.border,
                        color: theme.text,
                        backgroundColor: theme.bg,
                      },
                    ]}
                    maxLength={6}
                  />
                </>
              )}

              <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                <Pressable
                  onPress={() => setAddOpen(false)}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    {
                      backgroundColor: pressed ? theme.border : theme.bg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.modalBtnText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleAddGoal}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    ANDROID && styles.ml10,
                    {
                      backgroundColor: pressed
                        ? theme.primaryPressed
                        : theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalBtnText,
                      { color: theme.primaryTextOn },
                    ]}
                  >
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Theme */}
        <Modal
          visible={customizeOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setCustomizeOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Theme
              </Text>
              <Text style={[styles.modalSub, { color: theme.mutedText }]}>
                Pick a theme
              </Text>

              <View
                style={[
                  styles.themeGrid,
                  ANDROID && styles.noGap,
                  ANDROID && styles.themeGridAndroid,
                ]}
              >
                {THEMES.map((t) => {
                  const selected = t.id === themeChoice;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => handlePickTheme(t.id)}
                      style={({ pressed }) => [
                        styles.themeCard,
                        ANDROID && styles.themeCardAndroid,
                        {
                          borderColor: selected ? theme.primary : theme.border,
                          backgroundColor: selected ? theme.ringBg : theme.card,
                          opacity: pressed ? 0.9 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[styles.themeHeader, ANDROID && styles.noGap]}
                      >
                        <Text style={[styles.themeName, { color: theme.text }]}>
                          {t.name}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.swatchRow,
                          ANDROID && styles.noGap,
                          ANDROID && styles.swatchRowAndroid,
                        ]}
                      >
                        <View
                          style={[
                            styles.themeSwatch,
                            { backgroundColor: t.palette.primary },
                          ]}
                        />
                        <View
                          style={[
                            styles.themeSwatch,
                            { backgroundColor: t.palette.card },
                          ]}
                        />
                        <View
                          style={[
                            styles.themeSwatch,
                            { backgroundColor: t.palette.bg },
                          ]}
                        />
                      </View>

                      <Text
                        style={[
                          styles.themeHint,
                          ANDROID && styles.themeHintAndroid,
                          { color: theme.mutedText },
                        ]}
                      >
                        Tap to apply
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                <Pressable
                  onPress={() => setCustomizeOpen(false)}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    {
                      backgroundColor: pressed
                        ? theme.primaryPressed
                        : theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalBtnText,
                      { color: theme.primaryTextOn },
                    ]}
                  >
                    Done
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Progress */}
        <Modal
          visible={editOpen}
          animationType="fade"
          transparent
          onRequestClose={closeEdit}
        >
          <View style={styles.modalBackdrop}>
            <Animated.View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                {
                  opacity: editAnim,
                  transform: [
                    {
                      scale: editAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.97, 1],
                      }),
                    },
                    {
                      translateY: editAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {!!editGoal && (
                <>
                  <Text
                    style={[styles.editTitle, { color: theme.text }]}
                    numberOfLines={2}
                  >
                    {editGoal.title}
                  </Text>

                  {editGoal.type === "count" ? (
                    <>
                      {(() => {
                        const cur = Number(editValue);
                        const curSafe = Number.isFinite(cur)
                          ? Math.max(0, Math.floor(cur))
                          : 0;
                        const target = Math.max(
                          0,
                          Number(editGoal.target || 0)
                        );
                        const pct =
                          target > 0 ? Math.round((curSafe / target) * 100) : 0;

                        return (
                          <>
                            <View style={styles.editMetaRow}>
                              <Text
                                style={[
                                  styles.editHint,
                                  { color: theme.mutedText },
                                ]}
                              >
                                {`${curSafe} / ${target}`}
                              </Text>
                              <Text
                                style={[
                                  styles.editHint,
                                  { color: theme.mutedText },
                                ]}
                              >
                                {`${pct}%`}
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.progressTrack,
                                {
                                  backgroundColor: theme.bg,
                                  borderColor: theme.border,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${Math.max(
                                      0,
                                      Math.min(100, pct)
                                    )}%`,
                                    backgroundColor: theme.primary,
                                  },
                                ]}
                              />
                            </View>
                          </>
                        );
                      })()}

                      <View
                        style={[styles.stepperRow, ANDROID && styles.noGap]}
                      >
                        <Pressable
                          onPress={() => bumpEditCount(-1)}
                          style={({ pressed }) => [
                            styles.stepperBtn,
                            {
                              backgroundColor: pressed
                                ? theme.border
                                : theme.bg,
                              borderColor: theme.border,
                            },
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel="Decrease"
                        >
                          <Text
                            style={[
                              styles.stepperBtnText,
                              { color: theme.text },
                            ]}
                          >
                            −
                          </Text>
                        </Pressable>

                        <TextInput
                          value={editValue}
                          onChangeText={setEditValue}
                          keyboardType={
                            Platform.OS === "ios" ? "number-pad" : "numeric"
                          }
                          style={[
                            styles.stepperValue,
                            {
                              borderColor: theme.border,
                              color: theme.text,
                              backgroundColor: theme.bg,
                            },
                          ]}
                          maxLength={8}
                        />

                        <Pressable
                          onPress={() => bumpEditCount(1)}
                          style={({ pressed }) => [
                            styles.stepperBtn,
                            ANDROID && styles.ml10,
                            {
                              backgroundColor: pressed
                                ? theme.border
                                : theme.bg,
                              borderColor: theme.border,
                            },
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel="Increase"
                        >
                          <Text
                            style={[
                              styles.stepperBtnText,
                              { color: theme.text },
                            ]}
                          >
                            +
                          </Text>
                        </Pressable>
                      </View>

                      <View
                        style={[styles.modalActions, ANDROID && styles.noGap]}
                      >
                        <Pressable
                          onPress={closeEdit}
                          style={({ pressed }) => [
                            styles.modalBtn,
                            {
                              backgroundColor: pressed
                                ? theme.border
                                : theme.bg,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[styles.modalBtnText, { color: theme.text }]}
                          >
                            Cancel
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={saveEditCount}
                          style={({ pressed }) => [
                            styles.modalBtn,
                            ANDROID && styles.ml10,
                            {
                              backgroundColor: pressed
                                ? theme.primaryPressed
                                : theme.primary,
                              borderColor: theme.primary,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.modalBtnText,
                              { color: theme.primaryTextOn },
                            ]}
                          >
                            Done
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <>
                      {(() => {
                        const isDone = (editGoal?.progress ?? 0) === 1;

                        return (
                          <View
                            style={[
                              styles.milestoneMiniRow,
                              ANDROID && styles.noGap,
                            ]}
                          >
                            <Pressable
                              onPress={() => setMilestoneComplete(false)}
                              style={({ pressed }) => {
                                const selected = !isDone;
                                return [
                                  styles.miniPill,
                                  {
                                    backgroundColor: selected
                                      ? pressed
                                        ? theme.primaryPressed
                                        : theme.primary
                                      : pressed
                                      ? theme.border
                                      : theme.bg,
                                    borderColor: selected
                                      ? theme.primary
                                      : theme.border,
                                  },
                                ];
                              }}
                            >
                              <Text
                                style={[
                                  styles.miniPillText,
                                  {
                                    color: !isDone
                                      ? theme.primaryTextOn
                                      : theme.text,
                                  },
                                ]}
                              >
                                Not yet
                              </Text>
                            </Pressable>

                            <Pressable
                              onPress={() => setMilestoneComplete(true)}
                              style={({ pressed }) => {
                                const selected = isDone;
                                return [
                                  styles.miniPill,
                                  ANDROID && styles.ml10,
                                  {
                                    backgroundColor: selected
                                      ? pressed
                                        ? theme.primaryPressed
                                        : theme.primary
                                      : pressed
                                      ? theme.border
                                      : theme.bg,
                                    borderColor: selected
                                      ? theme.primary
                                      : theme.border,
                                  },
                                ];
                              }}
                            >
                              <Text
                                style={[
                                  styles.miniPillText,
                                  {
                                    color: isDone
                                      ? theme.primaryTextOn
                                      : theme.text,
                                  },
                                ]}
                              >
                                Done
                              </Text>
                            </Pressable>
                          </View>
                        );
                      })()}

                      <View
                        style={[styles.modalActions, ANDROID && styles.noGap]}
                      >
                        <Pressable
                          onPress={closeEdit}
                          style={({ pressed }) => [
                            styles.modalBtn,
                            {
                              backgroundColor: pressed
                                ? theme.border
                                : theme.bg,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[styles.modalBtnText, { color: theme.text }]}
                          >
                            Close
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </>
              )}
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  header: { paddingTop: 8, paddingBottom: 10 },
  appTitle: { fontSize: 30, fontWeight: "900", letterSpacing: 0.2 },
  yearText: { marginTop: 4, fontSize: 13, fontWeight: "800" },

  tabRow: { marginTop: 14, flexDirection: "row", gap: 10 },
  tabPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: { fontSize: 13, fontWeight: "900", letterSpacing: 0.2 },

  ringCard: (theme) => ({
    marginTop: 16,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
  }),
  bigPct: { fontSize: 22, fontWeight: "900", letterSpacing: 0.2 },
  bigPctSub: { marginTop: 4, fontSize: 12, fontWeight: "700" },

  actionsRow: { marginTop: 14, flexDirection: "row", gap: 10 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 14, fontWeight: "900", letterSpacing: 0.2 },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "900", letterSpacing: 0.2 },

  divider: (theme) => ({
    marginTop: 16,
    height: 1,
    backgroundColor: theme.border,
  }),

  sectionHeaderRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  togglePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  habitsHeaderGrid: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  monthTitle: {
    fontSize: 28,
    fontWeight: "950",
    letterSpacing: 0.2,
    flexShrink: 1,
  },

  daysRow: { flexDirection: "row", width: SQUARE * 5 },
  dayCell: { width: SQUARE, alignItems: "center", justifyContent: "center" },
  dayNum: { fontSize: 14, fontWeight: "800", letterSpacing: 0.2 },

  bullet: { marginTop: 6, fontSize: 13, fontWeight: "800" },

  undoWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  undoText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.2,
    flex: 1,
  },
  undoBtn: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  undoBtnText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 16,
    justifyContent: "center",
  },
  modalCard: { borderWidth: 1, borderRadius: 22, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "900" },
  modalSub: { marginTop: 6, fontSize: 13, fontWeight: "600" },

  // ✅ Rollover stacked choices
  rolloverStack: { marginTop: 14, gap: 10 },
  rolloverBtn: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rolloverBtnTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 0.2 },
  rolloverBtnSub: { marginTop: 4, fontSize: 12, fontWeight: "700" },

  label: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  input: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "800",
  },

  templateRow: {
    paddingRight: 10,
    gap: 10,
  },
  templateChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  templateChipText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  typeRow: { marginTop: 10, flexDirection: "row", gap: 10 },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: { fontSize: 13, fontWeight: "900", letterSpacing: 0.2 },

  inlineInfo: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  inlineInfoText: { fontSize: 12, fontWeight: "700" },

  countRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginTop: -1,
  },
  countInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },

  themeGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  themeCard: {
    flexBasis: "48%",
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },

  themeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  themeName: { fontSize: 14, fontWeight: "900", letterSpacing: 0.2 },
  swatchRow: {
    flexDirection: "row",
    gap: 6,
    width: 100,
    justifyContent: "space-between",
    paddingTop: 10,
  },
  themeSwatch: { width: 16, height: 16, borderRadius: 6 },
  themeHint: { marginTop: 10, fontSize: 12, fontWeight: "700" },

  milestoneRow: { marginTop: 14, flexDirection: "row", gap: 10 },
  milestoneBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneText: { fontSize: 13, fontWeight: "900", letterSpacing: 0.2 },

  modalActions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  modalBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 92,
    alignItems: "center",
  },
  modalBtnText: { fontSize: 13, fontWeight: "900", letterSpacing: 0.2 },

  // Edit Progress modal
  editTitle: { fontSize: 16, fontWeight: "900", letterSpacing: 0.2 },
  editMetaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editHint: { marginTop: 6, fontSize: 12, fontWeight: "700" },

  progressTrack: {
    marginTop: 8,
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999 },

  stepperRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginTop: -1,
  },
  stepperValue: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },

  milestoneMiniRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  miniPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  miniPillText: { fontSize: 13, fontWeight: "900", letterSpacing: 0.2 },

  // -------------------------
  // ANDROID-ONLY PATCH STYLES
  // -------------------------
  noGap: { gap: 0 },

  ml10: { marginLeft: 10 },
  mr10: { marginRight: 10 },

  themeGridAndroid: { justifyContent: "space-between" },

  themeCardAndroid: {
    width: "48%",
    marginBottom: 12,
  },

  swatchRowAndroid: { justifyContent: "space-between" },

  themeHintAndroid: { marginTop: 8 },
});
