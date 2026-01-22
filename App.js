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
import ColorPicker, {
  HueCircular,
  Panel1,
  Swatches,
  PreviewText,
  colorKit,
} from "reanimated-color-picker";

import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import DraggableFlatList from "react-native-draggable-flatlist";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  pushWidgetPayloadAndroid,
  setDebugWidgetTextAndroid,
} from "./native/widgetBridge.android";

import ProgressRing from "./components/ProgressRing";
import GoalItem from "./components/GoalItem";
import HabitRow from "./components/HabitRow";
import HabitHistory from "./components/HabitHistory";
import {
  THEMES,
  makeTheme,
  CUSTOM_THEME_PREFIX,
  buildPaletteFromPrimary,
  ensurePaletteComplete,
} from "./utils/theme";
import {
  loadGoalsWithMeta,
  saveGoals,
  loadHue,
  saveHue,
  loadWelcomeSeen,
  setWelcomeSeen,
  loadCurrentYear,
  saveCurrentYear,
  appendGoalHistory,
  loadCustomThemes,
  saveCustomThemes,
} from "./utils/storage";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

const HABITS_KEY = "yt_habits_v1";
const HABITS_WELCOME_SEEN_KEY = "yt_habits_welcome_seen_v1";

const SQUARE = 34;
const LABEL_W = 140;
const LABEL_GAP = 10;

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
const customSwatches = new Array(6)
  .fill("#fff")
  .map(() => colorKit.randomRgbColor().hex());

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

function NativeDebugPanel() {
  const info = useMemo(() => {
    console.log("RN bridgeless flags", {
      hasBatchedBridge: !!global.__fbBatchedBridge,
      hasTurboModuleProxy: !!global.__turboModuleProxy,
      bridgeless: global.RN$Bridgeless,
    });
    const keys = Object.keys(NativeModules || {});
    return {
      platform: Platform.OS,
      appOwnership: Constants.appOwnership,
      executionEnvironment: Constants.executionEnvironment,
      androidPackage: Constants.expoConfig?.android?.package,
      nativeModulesCount: keys.length,
      nativeModulesSample: keys.slice(0, 30),
      widgetBridge: NativeModules?.WidgetBridgeAndroid ? "FOUND" : "MISSING",
      widgetBridgeKeys: NativeModules?.WidgetBridgeAndroid
        ? Object.keys(NativeModules.WidgetBridgeAndroid)
        : [],
    };
  }, []);

  return (
    <ScrollView style={{ padding: 12 }}>
      <Text style={{ fontWeight: "700", fontSize: 18 }}>
        Native Bridge Debug
      </Text>
      <Text>Platform: {info.platform}</Text>
      <Text>appOwnership: {String(info.appOwnership)}</Text>
      <Text>executionEnvironment: {String(info.executionEnvironment)}</Text>
      <Text>expoConfig.android.package: {String(info.androidPackage)}</Text>
      <Text>NativeModules count: {info.nativeModulesCount}</Text>
      <Text>WidgetBridgeAndroid: {info.widgetBridge}</Text>

      <Text style={{ marginTop: 10, fontWeight: "700" }}>
        NativeModules sample:
      </Text>
      <Text selectable>
        {JSON.stringify(info.nativeModulesSample, null, 2)}
      </Text>

      <Text style={{ marginTop: 10, fontWeight: "700" }}>
        WidgetBridgeAndroid keys:
      </Text>
      <Text selectable>{JSON.stringify(info.widgetBridgeKeys, null, 2)}</Text>
    </ScrollView>
  );
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

function lastNDays(n, baseDate = new Date()) {
  const out = [];
  const today = new Date(baseDate);

  // helps avoid DST edge weirdness around midnight
  today.setHours(12, 0, 0, 0);

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

function isHex6(v) {
  const s = String(v ?? "").trim();
  return /^#?[0-9a-fA-F]{6}$/.test(s);
}

function normalizeHex(s) {
  const t = String(s || "").trim();
  if (!t) return "";
  return t.startsWith("#")
    ? `#${t.slice(1).toLowerCase()}`
    : `#${t.toLowerCase()}`;
}

function sanitizeName(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 28);
}
// Returns "#rrggbb" (lowercase) OR "" if it can't be normalized
function normalizeHex6(input) {
  // Accept plain strings only; anything else becomes ""
  let s = typeof input === "string" ? input.trim().toLowerCase() : "";
  if (!s) return "";

  // Small named-color safety net (optional)
  const NAMED = {
    white: "#ffffff",
    black: "#000000",
    red: "#ff0000",
    green: "#00ff00",
    blue: "#0000ff",
    transparent: "", // treat as invalid for our purposes
  };
  if (NAMED[s] !== undefined) return NAMED[s];

  // rgb()/rgba() -> hex6
  if (s.startsWith("rgb")) {
    const nums = s.match(/[-+]?\d*\.?\d+/g) || [];
    if (nums.length >= 3) {
      const r = clamp(Math.round(Number(nums[0])), 0, 255);
      const g = clamp(Math.round(Number(nums[1])), 0, 255);
      const b = clamp(Math.round(Number(nums[2])), 0, 255);
      const to2 = (n) => n.toString(16).padStart(2, "0");
      return `#${to2(r)}${to2(g)}${to2(b)}`;
    }
    return "";
  }

  // Strip "#"
  if (s.startsWith("#")) s = s.slice(1);

  // Expand short hex: rgb / rgba
  if (/^[0-9a-f]{3}$/.test(s)) {
    s = s
      .split("")
      .map((ch) => ch + ch)
      .join(""); // rgb -> rrggbb
  } else if (/^[0-9a-f]{4}$/.test(s)) {
    // rgba -> rrggbbaa
    s = s
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }

  // Drop alpha if present: rrggbbaa -> rrggbb
  if (/^[0-9a-f]{8}$/.test(s)) s = s.slice(0, 6);

  // Validate final rrggbb
  if (!/^[0-9a-f]{6}$/.test(s)) return "";

  return `#${s}`;
}

export default function App() {
  const year = new Date().getFullYear();

  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState("habits");
  const [goals, setGoals] = useState([]);
  const [historyYear, setHistoryYear] = useState(year);

  // Theme selection can be:
  // - built-in id (string)
  // - legacy hue number/string
  // - "custom:<id>"
  const [themeChoice, setThemeChoice] = useState("bright-blue");

  const pickerShared = useSharedValue("#ffffff");

  const pickerPreviewStyle = useAnimatedStyle(() => {
    return { backgroundColor: pickerShared.value };
  });

  // Custom themes list stored in AsyncStorage
  const [customThemes, setCustomThemesState] = useState([]);

  // Theme modal pages
  const [themePage, setThemePage] = useState("pick"); // 'pick' | 'create'
  const [customName, setCustomName] = useState("");
  const [customMode, setCustomMode] = useState("light"); // 'light' | 'dark'

  // Custom theme inputs (simple: only 3 colors)
  const [ctPrimary, setCtPrimary] = useState("#2b6dff");
  const [ctBg, setCtBg] = useState("#f5f7fa");
  const [ctText, setCtText] = useState("#0b1220");

  // Simple color picker overlay (NOT a nested Modal)
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState(null); // 'primary' | 'bg' | 'text'
  const [pickerStartHex, setPickerStartHex] = useState("#ffffff"); // to revert on Cancel
  const [pickerValue, setPickerValue] = useState("#ffffff"); // final chosen value (js)
  const [pickerInitHex, setPickerInitHex] = useState("#ffffff");

  const [todayTick, setTodayTick] = useState(Date.now());
  const lastDayKeyRef = useRef(dateKey(new Date()));

  // const pickerShared = useSharedValue("#ffffff"); // keeps picker stable when overlay opens

  // Only allow one habit swipe-open at a time
  const openHabitSwipeRef = useRef(null);
  const openHabitSwipeId = useRef(null);

  // const pickerPreviewStyle = useAnimatedStyle(() => {
  //   return { backgroundColor: safeHex6(pickerShared.value, "#ffffff") };
  // });

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
  function refreshDayIfNeeded() {
    const nowKey = dateKey(new Date());
    if (nowKey !== lastDayKeyRef.current) {
      lastDayKeyRef.current = nowKey;
      setTodayTick(Date.now()); // forces header + dates to recompute
      closeOpenHabitSwipe(); // optional: avoids swipe state weirdness across days
    }
  }

  // Always returns a safe "#rrggbb"
  function safeHex6(input, fallback = "#ffffff") {
    const fb = normalizeHex6(fallback) || "#ffffff";
    return normalizeHex6(input) || fb;
  }
  function applyPickerHex(next) {
    const safe = safeHex6(next, pickerStartHex || "#ffffff");
    setPickerValue(safe);
    setPickerUIValue(safe);
    setPickerRemountKey((k) => k + 1); // keeps picker synced reliably
  }

  function handleHabitSwipeOpen(habitId, swipeableInstance) {
    if (
      openHabitSwipeId.current &&
      openHabitSwipeId.current !== habitId &&
      openHabitSwipeRef.current
    ) {
      closeOpenHabitSwipe();
    }
    openHabitSwipeRef.current = swipeableInstance || null;
    openHabitSwipeId.current = habitId || null;
  }

  function handleHabitSwipeClose(habitId) {
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
  const [pickerUIValue, setPickerUIValue] = useState("#ffffff"); // drives the ColorPicker's value prop
  const [pickerRemountKey, setPickerRemountKey] = useState(0); // forces picker to refresh when typing
  const [hexEditing, setHexEditing] = useState(false);
  const [hexDraft, setHexDraft] = useState("#ffffff");

  const editAnim = useRef(new Animated.Value(0)).current;

  // reopen theme modal after picking (legacy; no longer needed since picker is inline)
  const [resumeThemeAfterPicker, setResumeThemeAfterPicker] = useState(false);
  const [resumeThemePage, setResumeThemePage] = useState("create"); // 'pick' | 'create'

  const [habits, setHabits] = useState([]);
  const [habitAddOpen, setHabitAddOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState("");

  // Hide completed goals toggle
  const [hideCompleted, setHideCompleted] = useState(false);

  // Undo toast
  const [undo, setUndo] = useState(null); // { kind: 'goal'|'habit', item, index }
  const undoTimerRef = useRef(null);

  // Annual rollover modal + source year
  const [yearRolloverOpen, setYearRolloverOpen] = useState(false);
  const [rolloverFromYear, setRolloverFromYear] = useState(null);

  // Edit goal details modal
  const [goalDetailsOpen, setGoalDetailsOpen] = useState(false);
  const [goalDetailsGoal, setGoalDetailsGoal] = useState(null);
  const [goalDetailsTitle, setGoalDetailsTitle] = useState("");
  const [goalDetailsType, setGoalDetailsType] = useState("count");
  const [goalDetailsTargetText, setGoalDetailsTargetText] = useState("10");

  // Edit habit title modal
  const [habitEditOpen, setHabitEditOpen] = useState(false);
  const [habitEditHabit, setHabitEditHabit] = useState(null);
  const [habitEditTitle, setHabitEditTitle] = useState("");

  const theme = useMemo(
    () => makeTheme(themeChoice, customThemes),
    [themeChoice, customThemes],
  );
  const todayDate = useMemo(() => new Date(todayTick), [todayTick]);
  const dates = useMemo(
    () => lastNDays(5, new Date(todayTick)),
    [activeTab, todayTick],
  );

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
    try {
      const basePayload = buildWidgetPayload(nextGoals, nextHabits);

      // iOS: keep exact shape you already use
      const iosJson = JSON.stringify(basePayload);

      if (Platform.OS === "ios" && WidgetBridge?.setWidgetPayload) {
        WidgetBridge.setWidgetPayload(iosJson);
        return;
      }

      if (Platform.OS === "android") {
        // ✅ push the SAME payload to each widget key
        pushWidgetPayloadAndroid({
          ...basePayload,
          widgetType: "yearly_progress",
        });
        pushWidgetPayloadAndroid({ ...basePayload, widgetType: "goals_list" });
        pushWidgetPayloadAndroid({ ...basePayload, widgetType: "habits" });
        pushWidgetPayloadAndroid({
          ...basePayload,
          widgetType: "goal_highlight",
        });

        console.log(
          "ANDROID WIDGET PAYLOAD (base)",
          JSON.stringify(basePayload),
        );
      }
    } catch (e) {
      console.log("Widget sync failed:", e);
    }
  }

  useEffect(() => {
    if (!ready) return;
    if (Platform.OS !== "android") return;

    try {
      if (__DEV__) {
        setDebugWidgetTextAndroid(`DBG ${Date.now()}`);
      } else {
        // Clear it so titles go back to normal in production builds
        setDebugWidgetTextAndroid("");
      }
    } catch (e) {
      console.log("setDebugWidgetTextAndroid failed", e);
    }
  }, [ready]);

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
    const prev = Number(rolloverFromYear);
    if (!Number.isFinite(prev)) return;

    const entry = buildHistoryEntry(prev, goals);
    await appendGoalHistory(entry);
  }

  // Custom themes helpers
  async function persistCustomThemes(next) {
    setCustomThemesState(next);
    try {
      await saveCustomThemes(next);
    } catch {}
  }

  function resetCreateFormToDefaults() {
    const base = buildPaletteFromPrimary("#2b6dff", "light");
    setCustomName("");
    setCustomMode("light");
    setCtPrimary(base.primary);
    setCtBg(base.bg);
    setCtText(base.text);
  }

  function currentCreatePaletteDraft() {
    const draft = {
      primary: normalizeHex6(ctPrimary),
      bg: normalizeHex6(ctBg),
      text: normalizeHex6(ctText),
      danger: "#ef4444",
    };
    return ensurePaletteComplete(draft, customMode);
  }

  async function autoFillFromPrimary() {
    const p = isHex6(ctPrimary) ? normalizeHex(ctPrimary) : "#2b6dff";
    const base = buildPaletteFromPrimary(p, customMode);

    await hapticLight();
    setCtPrimary(base.primary);
    setCtBg(base.bg);
    setCtText(base.text);
  }

  async function createCustomThemeAndSelect() {
    const name = sanitizeName(customName);
    if (!name) return;

    const draft = currentCreatePaletteDraft();
    const required = [draft.primary, draft.bg, draft.text];
    if (required.some((v) => !isHex6(v))) return;

    const id = uid();
    const entry = {
      id,
      name,
      palette: draft,
      createdAt: Date.now(),
    };

    const next = [entry, ...(customThemes || [])];
    await persistCustomThemes(next);

    const choice = `${CUSTOM_THEME_PREFIX}${id}`;
    await handlePickTheme(choice);

    // Close Theme modal after saving + selecting
    setCustomizeOpen(false);

    setThemePage("pick");
    resetCreateFormToDefaults();
    await hapticSuccess();
  }

  async function deleteCustomTheme(id) {
    await hapticLight();
    const next = (customThemes || []).filter(
      (t) => String(t.id) !== String(id),
    );
    await persistCustomThemes(next);

    const selectedIsThis =
      typeof themeChoice === "string" &&
      themeChoice.startsWith(CUSTOM_THEME_PREFIX) &&
      themeChoice.slice(CUSTOM_THEME_PREFIX.length) === String(id);

    if (selectedIsThis) {
      await handlePickTheme("bright-blue");
    }
    await hapticSuccess();
  }

  function openColorPicker(target) {
    const cur =
      target === "primary" ? ctPrimary : target === "bg" ? ctBg : ctText;

    const start = safeHex6(cur, "#ffffff");

    setColorPickerTarget(target);
    setPickerStartHex(start);

    setHexEditing(false);
    setHexDraft(start);

    applyPickerHex(start);
    setColorPickerOpen(true);
  }

  function onPickerChangeJS(c) {
    const next = safeHex6(c?.hex, pickerValue || pickerStartHex || "#ffffff");
    setPickerValue(next);
    setPickerUIValue(next);
    // don't remount while dragging (keeps it smooth)
  }
  // UI thread (no React setState here)
  const onPickerChange = (c) => {
    "worklet";
    pickerShared.value = c?.hex ?? "#ffffff";
  };

  // JS thread (commit once when user lets go)
  function onPickerCompleteJS(c) {
    const next = safeHex6(c?.hex, pickerUIValue || "#ffffff");
    pickerShared.value = next;

    // only set state if it actually changed (prevents extra rerenders)
    setPickerUIValue((prev) => (prev === next ? prev : next));
    setPickerValue((prev) => (prev === next ? prev : next));
  }

  // This runs on JS thread when user completes a pick (lift finger / tap)
  function onPickerComplete(color) {
    const h = normalizeHex6(color?.hex) || pickerValue || "#ffffff";
    setPickerValue(h);

    // Update the target value immediately
    if (colorPickerTarget === "primary") setCtPrimary(h);
    else if (colorPickerTarget === "bg") setCtBg(h);
    else if (colorPickerTarget === "text") setCtText(h);
  }

  async function cancelColorPicker() {
    await hapticLight();

    const back = safeHex6(pickerStartHex, "#ffffff");
    setPickerValue(back);
    setPickerUIValue(back);
    setPickerRemountKey((k) => k + 1);

    setColorPickerOpen(false);
    setColorPickerTarget(null);
  }

  async function doneColorPicker() {
    await hapticLight();

    const final = safeHex6(pickerValue, pickerStartHex || "#ffffff");

    // Commit only on Done ✅
    if (colorPickerTarget === "primary") setCtPrimary(final);
    else if (colorPickerTarget === "bg") setCtBg(final);
    else if (colorPickerTarget === "text") setCtText(final);

    setHexEditing(false);
    setColorPickerOpen(false);
    setColorPickerTarget(null);
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
          storedCustomThemes,
        ] = await Promise.all([
          loadGoalsWithMeta(),
          loadHue(),
          loadWelcomeSeen(),
          loadHabits(),
          loadHabitsWelcomeSeen(),
          loadCurrentYear(),
          loadCustomThemes(),
        ]);

        if (!mounted) return;

        const ct = Array.isArray(storedCustomThemes) ? storedCustomThemes : [];
        setCustomThemesState(ct);

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
          await saveCurrentYear(year);
        } else if (storedYear !== year) {
          setRolloverFromYear(storedYear);
          setYearRolloverOpen(true);
        } else {
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

    refreshDayIfNeeded(); // run once when ready

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshDayIfNeeded();
      }
      if (state === "background") {
        pushWidgets(goals, habits);
      }
    });

    return () => sub.remove?.();
  }, [ready, goals, habits, themeChoice]);

  useEffect(() => {
    if (!ready) return;

    let t;

    const scheduleNextMidnight = () => {
      const now = new Date();

      // next midnight local time (+1s buffer)
      const next = new Date(now);
      next.setHours(24, 0, 1, 0);

      const ms = next.getTime() - now.getTime();

      t = setTimeout(() => {
        refreshDayIfNeeded();
        scheduleNextMidnight();
      }, ms);
    };

    scheduleNextMidnight();

    return () => {
      if (t) clearTimeout(t);
    };
  }, [ready]);

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

    await hapticSuccess();
  }

  async function handleDeleteGoal(id) {
    await hapticLight();

    const idx = goals.findIndex((g) => g.id === id);
    const item = goals.find((g) => g.id === id);
    const next = goals.filter((g) => g.id !== id);

    await persistGoals(next);

    if (item) showUndo("goal", item, idx);
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
      g.id === editGoal.id ? { ...g, progress: nextProgress } : g,
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
      g.id === editGoal.id ? { ...g, progress: done ? 1 : 0 } : g,
    );
    await persistGoals(next);
    closeEdit();
  }

  async function openGoalDetails(goal) {
    await hapticLight();
    setGoalDetailsGoal(goal);
    setGoalDetailsTitle(String(goal.title || ""));
    setGoalDetailsType(goal.type === "boolean" ? "boolean" : "count");
    setGoalDetailsTargetText(
      goal.type === "count" && goal.target ? String(goal.target) : "10",
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
    await hapticSuccess();
  }

  async function handlePickTheme(nextTheme) {
    setThemeChoice(nextTheme);
    await saveHue(nextTheme);
    await hapticSuccess();
  }

  async function addHabit() {
    const t = habitTitle.trim();
    if (!t) return;

    await hapticLight();

    const next = [{ id: uid(), title: t, checks: {} }, ...habits];
    setHabitTitle("");
    setHabitAddOpen(false);
    await saveHabits(next);

    await hapticSuccess();
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

    if (item) showUndo("habit", item, idx);
  }

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
      h.id === habitEditHabit.id ? { ...h, title: t } : h,
    );

    await saveHabits(next);
    closeHabitEdit();
    await hapticSuccess();
  }

  // Annual rollover handlers (GOALS only; HABITS unchanged)
  async function handleRolloverCarryOver() {
    await hapticLight();
    await commitRolloverSnapshot();
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
      ) : activeTab === "habits" ? (
        <>
          <View style={styles.habitsHeaderGrid}>
            <View style={{ width: LABEL_W, paddingRight: LABEL_GAP }}>
              <Pressable
                onPress={() => {
                  setHistoryYear(todayDate.getFullYear());
                  setActiveTab("history");
                }}
                style={({ pressed }) => [
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="View habit history for this month"
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.monthTitle, { color: theme.text }]}
                >
                  {monthName(new Date(todayTick))}
                </Text>
              </Pressable>
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
      ) : null}
    </View>
  );

  if (!ready) {
    return (
      <GestureHandlerRootView style={styles.safe}>
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} />
      </GestureHandlerRootView>
    );
  }

  // Theme picker data (built-in + custom)
  const customThemeCards = (customThemes || []).map((t) => ({
    id: `${CUSTOM_THEME_PREFIX}${t.id}`,
    name: t.name,
    palette: t.palette,
    _customId: t.id,
    _isCustom: true,
  }));

  const allThemeCards = [...customThemeCards, ...THEMES];
  const createPreview = currentCreatePaletteDraft();

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
        ) : activeTab === "history" ? (
          <ScrollView contentContainerStyle={styles.listContent}>
            {topHeader}
            <HabitHistory
              theme={theme}
              habits={habits}
              historyYear={historyYear}
              onBack={() => setActiveTab("habits")}
              todayDate={todayDate}
            />
          </ScrollView>
        ) : (
          <DraggableFlatList
            activationDistance={12}
            data={habits}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={topHeader}
            onDragBegin={() => {
              closeOpenHabitSwipe();
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
                    onPress={() => {
                      setCustomizeOpen(true);
                      setThemePage("pick");
                    }}
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
        {/* ✅ Annual rollover */}
        <Modal
          visible={yearRolloverOpen}
          animationType="fade"
          transparent
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
        {/* ✅ Theme modal */}
        {/* ✅ Theme modal */}
        <Modal
          visible={customizeOpen}
          animationType="fade"
          transparent
          presentationStyle="overFullScreen"
          onRequestClose={() => {
            if (colorPickerOpen) cancelColorPicker();
            else setCustomizeOpen(false);
          }}
        >
          <View style={styles.modalBackdrop}>
            {/* theme card */}
            <View
              style={[
                styles.modalCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={[styles.themeTopRow, ANDROID && styles.noGap]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Theme
                </Text>

                {themePage === "pick" ? (
                  <Pressable
                    onPress={async () => {
                      await hapticLight();
                      setThemePage("create");
                      resetCreateFormToDefaults();
                    }}
                    style={({ pressed }) => [
                      styles.smallBtn,
                      {
                        backgroundColor: pressed ? theme.border : theme.bg,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.smallBtnText, { color: theme.text }]}>
                      + Custom
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={async () => {
                      await hapticLight();
                      setThemePage("pick");
                    }}
                    style={({ pressed }) => [
                      styles.smallBtn,
                      {
                        backgroundColor: pressed ? theme.border : theme.bg,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.smallBtnText, { color: theme.text }]}>
                      Back
                    </Text>
                  </Pressable>
                )}
              </View>

              {themePage === "pick" ? (
                <>
                  <Text style={[styles.modalSub, { color: theme.mutedText }]}>
                    Pick a theme
                  </Text>

                  <ScrollView
                    style={styles.themeScroll}
                    contentContainerStyle={[
                      styles.themeGrid,
                      ANDROID && styles.noGap,
                      ANDROID && styles.themeGridAndroid,
                    ]}
                    showsVerticalScrollIndicator={false}
                  >
                    {allThemeCards.map((t) => {
                      const selected = t.id === themeChoice;
                      const isCustom = !!t._isCustom;

                      return (
                        <Pressable
                          key={t.id}
                          onPress={() => handlePickTheme(t.id)}
                          style={({ pressed }) => [
                            styles.themeCard,
                            ANDROID && styles.themeCardAndroid,
                            {
                              borderColor: selected
                                ? theme.primary
                                : theme.border,
                              borderWidth: selected ? 2 : 1,
                              backgroundColor: "#FFFFFF",
                              opacity: pressed ? 0.92 : 1,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.themeHeader,
                              ANDROID && styles.noGap,
                            ]}
                          >
                            <View style={styles.themeNameWrap}>
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={[styles.themeName, { color: "#000" }]}
                              >
                                {t.name}
                              </Text>
                            </View>

                            {isCustom && (
                              <Pressable
                                onPress={(e) => {
                                  e?.stopPropagation?.();
                                  deleteCustomTheme(t._customId);
                                }}
                                style={({ pressed }) => [
                                  styles.trashIconBtn,
                                  {
                                    backgroundColor: pressed ? "#eee" : "#fff",
                                  },
                                ]}
                                hitSlop={10}
                                accessibilityRole="button"
                                accessibilityLabel={`Delete theme ${t.name}`}
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={18}
                                  color="#111"
                                />
                              </Pressable>
                            )}
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
                              { color: selected ? "#000" : "#555" },
                            ]}
                          >
                            {selected ? "Selected" : "Tap to apply"}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

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
                </>
              ) : (
                <>
                  <Text style={[styles.modalSub, { color: theme.mutedText }]}>
                    Create custom theme
                  </Text>

                  <View style={{ marginTop: 6, maxHeight: 520 }}>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                      contentContainerStyle={{ paddingBottom: 10 }}
                    >
                      <Text style={[styles.label, { color: theme.mutedText }]}>
                        Name
                      </Text>
                      <TextInput
                        value={customName}
                        onChangeText={setCustomName}
                        placeholder="e.g., Ocean Breeze"
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
                        maxLength={28}
                      />

                      <Text style={[styles.label, { color: theme.mutedText }]}>
                        Mode
                      </Text>
                      <View style={[styles.typeRow, ANDROID && styles.noGap]}>
                        <Pressable
                          onPress={async () => {
                            await hapticLight();
                            setCustomMode("light");
                            const p = isHex6(ctPrimary)
                              ? normalizeHex(ctPrimary)
                              : "#2b6dff";
                            const base = buildPaletteFromPrimary(p, "light");
                            setCtPrimary(base.primary);
                            setCtBg(base.bg);
                            setCtText(base.text);
                          }}
                          style={({ pressed }) => [
                            styles.pill,
                            {
                              backgroundColor:
                                customMode === "light"
                                  ? theme.primary
                                  : theme.bg,
                              borderColor:
                                customMode === "light"
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
                                  customMode === "light"
                                    ? theme.primaryTextOn
                                    : theme.text,
                              },
                            ]}
                          >
                            Light
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={async () => {
                            await hapticLight();
                            setCustomMode("dark");
                            const p = isHex6(ctPrimary)
                              ? normalizeHex(ctPrimary)
                              : "#2b6dff";
                            const base = buildPaletteFromPrimary(p, "dark");
                            setCtPrimary(base.primary);
                            setCtBg(base.bg);
                            setCtText(base.text);
                          }}
                          style={({ pressed }) => [
                            styles.pill,
                            ANDROID && styles.ml10,
                            {
                              backgroundColor:
                                customMode === "dark"
                                  ? theme.primary
                                  : theme.bg,
                              borderColor:
                                customMode === "dark"
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
                                  customMode === "dark"
                                    ? theme.primaryTextOn
                                    : theme.text,
                              },
                            ]}
                          >
                            Dark
                          </Text>
                        </Pressable>
                      </View>

                      <View
                        style={[styles.previewRow, ANDROID && styles.noGap]}
                      >
                        <View
                          style={[
                            styles.previewCard,
                            {
                              backgroundColor: createPreview.card,
                              borderColor: createPreview.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: createPreview.text,
                              fontWeight: "900",
                            }}
                          >
                            Preview
                          </Text>
                          <View style={{ height: 10 }} />
                          <View
                            style={[
                              styles.previewBtn,
                              { backgroundColor: createPreview.primary },
                            ]}
                          >
                            <Text
                              style={{
                                color: createPreview.primaryTextOn,
                                fontWeight: "900",
                              }}
                            >
                              Primary
                            </Text>
                          </View>
                        </View>

                        <View style={{ flex: 1 }}>
                          <Pressable
                            onPress={autoFillFromPrimary}
                            style={({ pressed }) => [
                              styles.smallBtnWide,
                              {
                                backgroundColor: pressed
                                  ? theme.border
                                  : theme.bg,
                                borderColor: theme.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.smallBtnText,
                                { color: theme.text },
                              ]}
                            >
                              Auto-fill from primary
                            </Text>
                          </Pressable>

                          <Pressable
                            onPress={() => {
                              resetCreateFormToDefaults();
                              hapticLight();
                            }}
                            style={({ pressed }) => [
                              styles.smallBtnWide,
                              {
                                marginTop: 10,
                                backgroundColor: pressed
                                  ? theme.border
                                  : theme.bg,
                                borderColor: theme.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.smallBtnText,
                                { color: theme.text },
                              ]}
                            >
                              Reset
                            </Text>
                          </Pressable>
                        </View>
                      </View>

                      <Text style={[styles.label, { color: theme.mutedText }]}>
                        Colors
                      </Text>

                      <View
                        style={[styles.colorPickRow, ANDROID && styles.noGap]}
                      >
                        <Pressable
                          onPress={() => openColorPicker("primary")}
                          style={[
                            styles.colorPickItem,
                            {
                              borderColor: theme.border,
                              backgroundColor: theme.bg,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.colorSquare,
                              {
                                backgroundColor: ctPrimary,
                                borderColor: theme.border,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.colorPickText,
                              { color: theme.text },
                            ]}
                          >
                            Primary
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => openColorPicker("bg")}
                          style={[
                            styles.colorPickItem,
                            {
                              borderColor: theme.border,
                              backgroundColor: theme.bg,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.colorSquare,
                              {
                                backgroundColor: ctBg,
                                borderColor: theme.border,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.colorPickText,
                              { color: theme.text },
                            ]}
                          >
                            Background
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => openColorPicker("text")}
                          style={[
                            styles.colorPickItem,
                            {
                              borderColor: theme.border,
                              backgroundColor: theme.bg,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.colorSquare,
                              {
                                backgroundColor: ctText,
                                borderColor: theme.border,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.colorPickText,
                              { color: theme.text },
                            ]}
                          >
                            Text
                          </Text>
                        </Pressable>
                      </View>
                    </ScrollView>
                  </View>

                  <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                    <Pressable
                      onPress={async () => {
                        await hapticLight();
                        setThemePage("pick");
                        resetCreateFormToDefaults();
                      }}
                      style={({ pressed }) => [
                        styles.modalBtn,
                        {
                          backgroundColor: pressed ? theme.border : theme.bg,
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
                      onPress={createCustomThemeAndSelect}
                      style={({ pressed }) => [
                        styles.modalBtn,
                        ANDROID && styles.ml10,
                        {
                          backgroundColor: pressed
                            ? theme.primaryPressed
                            : theme.primary,
                          borderColor: theme.primary,
                          opacity: sanitizeName(customName) ? 1 : 0.5,
                        },
                      ]}
                      disabled={!sanitizeName(customName)}
                    >
                      <Text
                        style={[
                          styles.modalBtnText,
                          { color: theme.primaryTextOn },
                        ]}
                      >
                        Save Theme
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>

            {/* ✅ Picker overlay (no hex typing) */}
            {colorPickerOpen && (
              <View style={styles.pickerOverlay} pointerEvents="box-none">
                <Pressable
                  style={styles.pickerOverlayBackdrop}
                  onPress={cancelColorPicker}
                />

                <View
                  style={[
                    styles.pickerSheet,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <Text style={[styles.pickerTitle, { color: theme.text }]}>
                    {colorPickerTarget === "primary"
                      ? "Pick Primary"
                      : colorPickerTarget === "bg"
                        ? "Pick Background"
                        : "Pick Text"}
                  </Text>

                  <Text style={[styles.pickerSub, { color: theme.mutedText }]}>
                    Drag to choose a color
                  </Text>

                  <View
                    style={[
                      styles.pickerPreviewRow,
                      { borderColor: theme.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.pickerPreviewDot,
                        { backgroundColor: safeHex6(pickerValue, "#ffffff") },
                      ]}
                    />
                    <Text style={[styles.pickerHexText, { color: theme.text }]}>
                      {pickerValue}
                    </Text>
                  </View>

                  {/* only picker scrolls so header + buttons don't get cut off */}
                  <ScrollView
                    style={styles.pickerScroll}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <ColorPicker
                      value={safeHex6(pickerUIValue, "#ffffff")}
                      onChange={onPickerChange}
                      key={pickerRemountKey}
                      onCompleteJS={onPickerCompleteJS}
                      sliderThickness={20}
                      thumbSize={24}
                      boundedThumb
                      style={styles.picker}
                    >
                      <HueCircular
                        containerStyle={{ justifyContent: "center" }}
                        thumbShape="pill"
                      >
                        <Panel1
                          style={{
                            width: "70%",
                            height: "70%",
                            borderRadius: 16,
                            alignSelf: "center",
                          }}
                        />
                      </HueCircular>
                    </ColorPicker>
                  </ScrollView>

                  <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                    <Pressable
                      onPress={cancelColorPicker}
                      style={({ pressed }) => [
                        styles.modalBtn,
                        {
                          backgroundColor: pressed ? theme.border : theme.bg,
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
                      onPress={doneColorPicker}
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
                </View>
              </View>
            )}
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
              {/* keep the rest of your Edit Progress modal exactly as you already have it */}
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
                          Number(editGoal.target || 0),
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
                                      Math.min(100, pct),
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
  pickerHexInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.2,
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

  themeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  smallBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: { fontSize: 12, fontWeight: "900", letterSpacing: 0.2 },

  smallBtnWide: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  previewRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  previewCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12 },
  previewBtn: { borderRadius: 12, paddingVertical: 10, alignItems: "center" },

  trashBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  trashBtnText: { fontSize: 12, fontWeight: "900" },

  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 6,
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
    gap: 10,
  },
  themeName: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  swatchRow: {
    flexDirection: "row",
    gap: 6,
    width: 100,
    justifyContent: "space-between",
    paddingTop: 10,
  },
  themeSwatch: { width: 16, height: 16, borderRadius: 6 },
  themeHint: { marginTop: 10, fontSize: 12, fontWeight: "700" },

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

  colorPickRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
  colorPickItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSquare: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  colorPickText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  colorPickHex: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "800",
  },

  inlinePickerCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },

  swatchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 8,
  },
  swatchCell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchFill: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },

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
  themeScroll: {
    marginTop: 14,
    maxHeight: 420,
  },
  trashIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  themeCreateScroll: {
    marginTop: 8,
    maxHeight: 520, // keeps it inside the modal; user can scroll
  },
  themeCreateScrollContent: {
    paddingBottom: 14,
  },

  pickerContainer: {
    marginTop: 12,
  },
  picker: {
    width: "100%",
  },
  pickerDivider: {
    height: 1,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  pickerSwatches: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pickerSwatch: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  previewTxt: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  pickerOverlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  pickerOverlayCard: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "15%",
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    overflow: "hidden",
  },
  pickerSurface: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    overflow: "hidden", // ✅ clips the Hue ring edges too
  },
  modalCardRelative: {
    position: "relative",
    overflow: "hidden", // clips overlay to rounded corners
  },

  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  pickerSheet: {
    width: "92%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },

  pickerTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  pickerSub: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
  },

  pickerPreviewRow: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  pickerPreviewDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
  },

  pickerHexText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  pickerInner: {
    marginTop: 12,
  },

  pickerPanel: {
    height: 180,
    borderRadius: 14,
    width: "100%",
  },

  pickerHue: {
    width: 210,
    height: 210,
    alignSelf: "center",
  },
  pickerScroll: { marginTop: 12 },
  pickerPanel: {
    width: "100%",
    height: 170,
    borderRadius: 16,
  },

  themeNameWrap: {
    flex: 1,
    minWidth: 0,
  },

  picker: {
    width: "100%",
    alignSelf: "center",
  },
});
