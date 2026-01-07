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
  KeyboardAvoidingView,
  Keyboard,
  StatusBar,
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
} from "./utils/storage";

const HABITS_KEY = "yt_habits_v1";
const HABITS_WELCOME_SEEN_KEY = "yt_habits_welcome_seen_v1";

const SQUARE = 34;
const LABEL_W = 140;
const LABEL_GAP = 10;

// Android-only layout patch helpers (keeps iOS exactly the same)
const ANDROID = Platform.OS === "android";

// Enhancement 1: font weight normalization
const FW = {
  black: ANDROID ? "900" : "950",
  heavy: ANDROID ? "900" : "950",
  extraBold: ANDROID ? "800" : "900",
  bold: ANDROID ? "700" : "800",
  semi: ANDROID ? "600" : "650",
  medium: ANDROID ? "600" : "650",
};

// Enhancement 5: ripple helper (Android only)
const RIPPLE = ANDROID ? { color: "rgba(0,0,0,0.08)" } : null;

// Enhancement: status bar style based on theme id (simple + stable)
const DARK_THEME_IDS = new Set([
  "deep-blue",
  "noir",
  "midnight",
  "forest-night",
  "ember",
]);

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
    out.push({ key: dateKey(dt), num: dt.getDate() });
  }
  return out;
}

export default function App() {
  const year = new Date().getFullYear();

  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState("habits");
  const [goals, setGoals] = useState([]);
  const [themeChoice, setThemeChoice] = useState("bright-blue");

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

  const theme = useMemo(() => makeTheme(themeChoice), [themeChoice]);
  const dates = useMemo(() => lastNDays(5), [activeTab]);

  const [goalDragging, setGoalDragging] = useState(false);
  const [habitDragging, setHabitDragging] = useState(false);

  const yearlyPercent = useMemo(() => {
    if (!goals.length) return 0;
    const sum = goals.reduce((acc, g) => acc + goalPercent(g), 0);
    return sum / goals.length;
  }, [goals]);

  const WidgetBridge = useMemo(() => {
    if (Platform.OS !== "ios") return null;
    const mod = NativeModules?.WidgetBridge ?? null;
    return mod;
  }, []);

  const statusBarStyle = useMemo(() => {
    // prefer explicit theme ID if available
    const id = String(theme?.hue ?? themeChoice ?? "");
    return DARK_THEME_IDS.has(id) ? "light-content" : "dark-content";
  }, [themeChoice, theme]);

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
        ] = await Promise.all([
          loadGoalsWithMeta(),
          loadHue(),
          loadWelcomeSeen(),
          loadHabits(),
          loadHabitsWelcomeSeen(),
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

  // Enhancement 6: disable invalid saves
  const canSaveGoal = useMemo(
    () => !!normalizeNewGoal(),
    [title, type, targetText]
  );
  const canSaveHabit = useMemo(() => !!habitTitle.trim(), [habitTitle]);

  async function handleAddGoal() {
    const g = normalizeNewGoal();
    if (!g) return;

    const next = [g, ...goals];
    await persistGoals(next);

    setTitle("");
    setType("count");
    setTargetText("10");
    setAddOpen(false);
  }

  async function handleDeleteGoal(id) {
    const next = goals.filter((g) => g.id !== id);
    await persistGoals(next);
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

  async function handlePickTheme(nextTheme) {
    setThemeChoice(nextTheme);
    await saveHue(nextTheme);
  }

  async function addHabit() {
    const t = habitTitle.trim();
    if (!t) return;

    await hapticLight();

    const next = [{ id: uid(), title: t, checks: {} }, ...habits];
    setHabitTitle("");
    setHabitAddOpen(false);
    await saveHabits(next);
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
  }

  async function deleteHabit(habitId) {
    await hapticLight();
    const next = habits.filter((h) => h.id !== habitId);
    await saveHabits(next);
  }

  const topHeader = (
    <View style={styles.header}>
      <Text style={[styles.appTitle, { color: theme.text }]}>
        Yearly Tracker
      </Text>
      <Text style={[styles.yearText, { color: theme.mutedText }]}>{year}</Text>

      <View style={[styles.tabRow, ANDROID && styles.noGap]}>
        <Pressable
          onPress={() => setActiveTab("habits")}
          android_ripple={RIPPLE}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "habits" }}
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
          onPress={() => setActiveTab("goals")}
          android_ripple={RIPPLE}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "goals" }}
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
              android_ripple={RIPPLE}
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
          <Text style={[styles.sectionTitle, { color: theme.mutedText }]}>
            Goals
          </Text>
        </>
      ) : (
        <>
          <View style={styles.habitsHeaderGrid}>
            <View style={{ width: LABEL_W, paddingRight: LABEL_GAP }}>
              <Text style={[styles.monthTitle, { color: theme.text }]}>
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
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={theme.bg}
        translucent={false}
      />

      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        {activeTab === "goals" ? (
          <DraggableFlatList
            activationDistance={12}
            data={goals}
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
              persistGoals(data);
            }}
            renderItem={({ item, drag, isActive }) => (
              <GoalItem
                goal={item}
                theme={theme}
                onEdit={openEdit}
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
                onDrag={drag}
                dragging={isActive}
                labelWidth={LABEL_W}
                squareSize={SQUARE}
                labelGap={LABEL_GAP}
              />
            )}
            ListFooterComponent={
              <View style={{ marginTop: 14 }}>
                <View style={[styles.actionsRow, ANDROID && styles.noGap]}>
                  <Pressable
                    onPress={() => setHabitAddOpen(true)}
                    android_ripple={RIPPLE}
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
                    android_ripple={RIPPLE}
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

        {/* Habits welcome */}
        <Modal
          visible={habitsWelcomeOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setHabitsWelcomeOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={Keyboard.dismiss}
            />
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
                  • Swipe a habit left to delete it.
                </Text>
                <Text style={[styles.bullet, { color: theme.text }]}>
                  • Press and hold a habit to reorder it.
                </Text>
              </View>

              <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                <Pressable
                  onPress={() => setHabitsWelcomeOpen(false)}
                  android_ripple={RIPPLE}
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
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={Keyboard.dismiss}
            />
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
                  android_ripple={RIPPLE}
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

        {/* Add Habit */}
        <Modal
          visible={habitAddOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setHabitAddOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={Keyboard.dismiss}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%" }}
            >
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
                    ANDROID && styles.androidInputFix,
                  ]}
                  selectionColor={theme.primary}
                  autoCorrect={false}
                  autoCapitalize="words"
                  maxLength={24}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (canSaveHabit) addHabit();
                  }}
                />

                <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                  <Pressable
                    onPress={() => setHabitAddOpen(false)}
                    android_ripple={RIPPLE}
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
                    android_ripple={RIPPLE}
                    disabled={!canSaveHabit}
                    style={({ pressed }) => [
                      styles.modalBtn,
                      ANDROID && styles.ml10,
                      {
                        backgroundColor: pressed
                          ? theme.primaryPressed
                          : theme.primary,
                        borderColor: theme.primary,
                        opacity: !canSaveHabit ? 0.45 : 1,
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
            </KeyboardAvoidingView>
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
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={Keyboard.dismiss}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%" }}
            >
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
                    ANDROID && styles.androidInputFix,
                  ]}
                  selectionColor={theme.primary}
                  autoCorrect={false}
                  autoCapitalize="sentences"
                  maxLength={60}
                  returnKeyType={type === "count" ? "next" : "done"}
                  onSubmitEditing={() => {
                    if (type === "boolean") {
                      if (canSaveGoal) handleAddGoal();
                    }
                  }}
                />

                <Text style={[styles.label, { color: theme.mutedText }]}>
                  Type
                </Text>
                <View style={[styles.typeRow, ANDROID && styles.noGap]}>
                  <Pressable
                    onPress={() => setType("count")}
                    android_ripple={RIPPLE}
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
                    android_ripple={RIPPLE}
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
                            type === "boolean"
                              ? theme.primaryTextOn
                              : theme.text,
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
                      Target
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
                        ANDROID && styles.androidInputFix,
                      ]}
                      selectionColor={theme.primary}
                      maxLength={6}
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        if (canSaveGoal) handleAddGoal();
                      }}
                    />
                  </>
                )}

                <View style={[styles.modalActions, ANDROID && styles.noGap]}>
                  <Pressable
                    onPress={() => setAddOpen(false)}
                    android_ripple={RIPPLE}
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
                    android_ripple={RIPPLE}
                    disabled={!canSaveGoal}
                    style={({ pressed }) => [
                      styles.modalBtn,
                      ANDROID && styles.ml10,
                      {
                        backgroundColor: pressed
                          ? theme.primaryPressed
                          : theme.primary,
                        borderColor: theme.primary,
                        opacity: !canSaveGoal ? 0.45 : 1,
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
            </KeyboardAvoidingView>
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
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={Keyboard.dismiss}
            />
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

              {/* Android-only patch: remove gap on Android; spacing handled via layout fixes */}
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
                      android_ripple={RIPPLE}
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
                  android_ripple={RIPPLE}
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
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={Keyboard.dismiss}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%" }}
            >
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
                          outputRange: [0.96, 1],
                        }),
                      },
                      {
                        translateY: editAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [14, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Edit Progress
                </Text>

                {!!editGoal && (
                  <>
                    <Text
                      style={[styles.editGoalTitle, { color: theme.text }]}
                      numberOfLines={2}
                    >
                      {editGoal.title}
                    </Text>

                    <Text style={[styles.modalSub, { color: theme.mutedText }]}>
                      {editGoal.type === "count"
                        ? "Set your current value"
                        : "Mark your milestone status"}
                    </Text>

                    {editGoal.type === "count" ? (
                      <>
                        <View
                          style={[
                            styles.inlineInfo,
                            {
                              backgroundColor: theme.bg,
                              borderColor: theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.inlineInfoText,
                              { color: theme.mutedText },
                            ]}
                          >
                            Range: 0 – {editGoal.target}
                          </Text>
                        </View>

                        <Text
                          style={[styles.label, { color: theme.mutedText }]}
                        >
                          Current
                        </Text>

                        <View
                          style={[styles.countRow, ANDROID && styles.noGap]}
                        >
                          <Pressable
                            onPress={() => bumpEditCount(-1)}
                            android_ripple={RIPPLE}
                            style={({ pressed }) => [
                              styles.iconBtn,
                              ANDROID && styles.mr10,
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
                                styles.iconBtnText,
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
                            placeholder="0"
                            placeholderTextColor={theme.mutedText}
                            style={[
                              styles.countInput,
                              {
                                borderColor: theme.border,
                                color: theme.text,
                                backgroundColor: theme.bg,
                              },
                              ANDROID && styles.androidInputFix,
                            ]}
                            selectionColor={theme.primary}
                            maxLength={8}
                            returnKeyType="done"
                            onSubmitEditing={saveEditCount}
                          />

                          <Pressable
                            onPress={() => bumpEditCount(1)}
                            android_ripple={RIPPLE}
                            style={({ pressed }) => [
                              styles.iconBtn,
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
                                styles.iconBtnText,
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
                            android_ripple={RIPPLE}
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
                              style={[
                                styles.modalBtnText,
                                { color: theme.text },
                              ]}
                            >
                              Cancel
                            </Text>
                          </Pressable>

                          <Pressable
                            onPress={saveEditCount}
                            android_ripple={RIPPLE}
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
                      </>
                    ) : (
                      <>
                        <View
                          style={[styles.milestoneRow, ANDROID && styles.noGap]}
                        >
                          <Pressable
                            onPress={() => setMilestoneComplete(false)}
                            android_ripple={RIPPLE}
                            style={({ pressed }) => [
                              styles.milestoneBtn,
                              {
                                backgroundColor: theme.bg,
                                borderColor: theme.border,
                                opacity: pressed ? 0.85 : 1,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.milestoneText,
                                { color: theme.text },
                              ]}
                            >
                              Not yet
                            </Text>
                          </Pressable>

                          <Pressable
                            onPress={() => setMilestoneComplete(true)}
                            android_ripple={RIPPLE}
                            style={({ pressed }) => [
                              styles.milestoneBtn,
                              ANDROID && styles.ml10,
                              {
                                backgroundColor: "transparent",
                                borderColor: theme.border,
                                opacity: pressed ? 0.85 : 1,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.milestoneText,
                                { color: theme.mutedText },
                              ]}
                            >
                              Mark completed
                            </Text>
                          </Pressable>
                        </View>

                        <View
                          style={[styles.modalActions, ANDROID && styles.noGap]}
                        >
                          <Pressable
                            onPress={closeEdit}
                            android_ripple={RIPPLE}
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
                              style={[
                                styles.modalBtnText,
                                { color: theme.text },
                              ]}
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
            </KeyboardAvoidingView>
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
  appTitle: { fontSize: 30, fontWeight: FW.black, letterSpacing: 0.2 },
  yearText: { marginTop: 4, fontSize: 13, fontWeight: FW.extraBold },

  tabRow: { marginTop: 14, flexDirection: "row", gap: 10 },
  tabPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: { fontSize: 13, fontWeight: FW.black, letterSpacing: 0.2 },

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
  bigPct: { fontSize: 22, fontWeight: FW.black, letterSpacing: 0.2 },
  bigPctSub: { marginTop: 4, fontSize: 12, fontWeight: FW.bold },

  actionsRow: { marginTop: 14, flexDirection: "row", gap: 10 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 14, fontWeight: FW.black, letterSpacing: 0.2 },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: FW.black, letterSpacing: 0.2 },

  divider: (theme) => ({
    marginTop: 16,
    height: 1,
    backgroundColor: theme.border,
  }),
  sectionTitle: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: FW.extraBold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  habitsHeaderGrid: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  monthTitle: { fontSize: 34, fontWeight: FW.black, letterSpacing: 0.2 },

  daysRow: { flexDirection: "row", width: SQUARE * 5 },
  dayCell: { width: SQUARE, alignItems: "center", justifyContent: "center" },
  dayNum: { fontSize: 14, fontWeight: FW.extraBold, letterSpacing: 0.2 },

  bullet: { marginTop: 6, fontSize: 13, fontWeight: FW.extraBold },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 16,
    justifyContent: "center",
  },
  modalCard: { borderWidth: 1, borderRadius: 22, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: FW.black },
  modalSub: { marginTop: 6, fontSize: 13, fontWeight: FW.semi },
  editGoalTitle: { marginTop: 10, fontSize: 16, fontWeight: FW.black },

  label: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: FW.extraBold,
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
    fontWeight: FW.extraBold,
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
  pillText: { fontSize: 13, fontWeight: FW.black, letterSpacing: 0.2 },

  inlineInfo: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  inlineInfoText: { fontSize: 12, fontWeight: FW.bold },

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
    fontWeight: FW.black,
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
    fontWeight: FW.extraBold,
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
  themeName: { fontSize: 14, fontWeight: FW.extraBold, letterSpacing: 0.2 },
  swatchRow: {
    flexDirection: "row",
    gap: 6,
    width: 100,
    justifyContent: "space-between",
    paddingTop: 10,
  },
  themeSwatch: { width: 16, height: 16, borderRadius: 6 },
  themeHint: { marginTop: 10, fontSize: 12, fontWeight: FW.bold },

  milestoneRow: { marginTop: 14, flexDirection: "row", gap: 10 },
  milestoneBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneText: { fontSize: 13, fontWeight: FW.black, letterSpacing: 0.2 },

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
  modalBtnText: { fontSize: 13, fontWeight: FW.black, letterSpacing: 0.2 },

  // Enhancement 3: Android input polish
  androidInputFix: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  // -------------------------
  // ANDROID-ONLY PATCH STYLES
  // -------------------------
  noGap: { gap: 0 },

  ml10: { marginLeft: 10 },
  mr10: { marginRight: 10 },

  themeGridAndroid: { justifyContent: "space-between" },

  themeCardAndroid: {
    // Android wrap is more stable with explicit width vs flexBasis
    width: "48%",
    marginBottom: 12,
  },

  swatchRowAndroid: { justifyContent: "space-between" },

  themeHintAndroid: { marginTop: 8 },
});
