// App.js

import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableFlatList from "react-native-draggable-flatlist";

import ProgressRing from "./components/ProgressRing";
import GoalItem from "./components/GoalItem";
import { HUE_OPTIONS, makeTheme } from "./utils/theme";
import {
  loadGoalsWithMeta,
  saveGoals,
  loadHue,
  saveHue,
  loadWelcomeSeen,
  setWelcomeSeen,
} from "./utils/storage";

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
    if (isGoalComplete(goal)) {
      completed.push(goal);
    } else {
      inProgress.push(goal);
    }
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

export default function App() {
  const year = new Date().getFullYear();

  const [goals, setGoals] = useState([]);
  const [hue, setHue] = useState(210);

  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  // Add goal form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("count"); // "count" | "boolean"
  const [targetText, setTargetText] = useState("10");

  // Edit progress modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [editValue, setEditValue] = useState("0"); // for count goals

  const theme = useMemo(() => makeTheme(hue), [hue]);

  const yearlyPercent = useMemo(() => {
    if (!goals.length) return 0;
    const sum = goals.reduce((acc, g) => acc + goalPercent(g), 0);
    return sum / goals.length;
  }, [goals]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const [{ goals: storedGoals, hasStoredValue }, storedHue, welcomeSeen] =
        await Promise.all([loadGoalsWithMeta(), loadHue(), loadWelcomeSeen()]);

      if (!mounted) return;

      // First run: seed starter goals
      if (!hasStoredValue) {
        const seeded = makeStarterGoals();
        const ordered = sortGoals(seeded);
        setGoals(ordered);
        await saveGoals(ordered);
      } else {
        setGoals(sortGoals(storedGoals));
      }

      if (typeof storedHue === "number") setHue(storedHue);

      // One-time welcome modal
      if (!welcomeSeen) {
        setWelcomeOpen(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function persistGoals(nextGoals) {
    const ordered = sortGoals(nextGoals);
    setGoals(ordered);
    await saveGoals(ordered);
  }

  async function closeWelcome() {
    setWelcomeOpen(false);
    await setWelcomeSeen();
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
  }

  async function handleDeleteGoal(id) {
    const next = goals.filter((g) => g.id !== id);
    await persistGoals(next);
  }

  function openEdit(goal) {
    setEditGoal(goal);
    if (goal.type === "count") setEditValue(String(goal.progress ?? 0));
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditGoal(null);
    setEditValue("0");
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
    await persistGoals(next);
    closeEdit();
  }

  async function setMilestoneComplete(done) {
    if (!editGoal || editGoal.type !== "boolean") return;

    const next = goals.map((g) =>
      g.id === editGoal.id ? { ...g, progress: done ? 1 : 0 } : g
    );
    await persistGoals(next);
    closeEdit();
  }

  async function handlePickHue(nextHue) {
    setHue(nextHue);
    await saveHue(nextHue);
  }

  const header = (
    <View style={styles.header}>
      <Text style={[styles.appTitle, { color: theme.text }]}>
        Yearly Tracker
      </Text>
      <Text style={[styles.yearText, { color: theme.mutedText }]}>{year}</Text>

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

      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => setAddOpen(true)}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: pressed ? theme.primaryPressed : theme.primary },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add Goal"
        >
          <Text style={[styles.primaryBtnText, { color: theme.primaryTextOn }]}>
            Add Goal
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setCustomizeOpen(true)}
          style={({ pressed }) => [
            styles.secondaryBtn,
            {
              backgroundColor: pressed ? theme.border : theme.card,
              borderColor: theme.border,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Customize Theme"
        >
          <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
            Customize
          </Text>
        </Pressable>
      </View>

      <View style={styles.divider(theme)} />
      <Text style={[styles.sectionTitle, { color: theme.mutedText }]}>
        Goals
      </Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.safe}>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <DraggableFlatList
        activationDistance={12}
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View
            style={[
              styles.emptyBox,
              { borderColor: theme.border, backgroundColor: theme.card },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Start your year strong
            </Text>
            <Text style={[styles.emptySub, { color: theme.mutedText }]}>
              Add a count goal (like “Read 20 books”) or a milestone (like “Run
              a 5K”).
            </Text>
          </View>
        }
        onDragEnd={({ data }) => {
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

      {/* Welcome Modal (one-time) */}
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
              Track your goals for the year—fully offline.
            </Text>

            <View style={{ marginTop: 12 }}>
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

            <View style={styles.modalActions}>
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
                  style={[styles.modalBtnText, { color: theme.primaryTextOn }]}
                >
                  Get Started
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Goal Modal */}
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

            <Text style={[styles.label, { color: theme.mutedText }]}>Type</Text>
            <View style={styles.typeRow}>
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
                  ]}
                  maxLength={6}
                />
              </>
            )}

            <View style={styles.modalActions}>
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
                  {
                    backgroundColor: pressed
                      ? theme.primaryPressed
                      : theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
              >
                <Text
                  style={[styles.modalBtnText, { color: theme.primaryTextOn }]}
                >
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Customize Modal */}
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
              Customize
            </Text>
            <Text style={[styles.modalSub, { color: theme.mutedText }]}>
              Pick a theme color
            </Text>

            <View style={styles.hueGrid}>
              {HUE_OPTIONS.map((h) => {
                const selected = h === hue;
                const swatch = `hsl(${h}, 80%, 45%)`;
                return (
                  <Pressable
                    key={h}
                    onPress={() => handlePickHue(h)}
                    style={styles.swatchWrap}
                    accessibilityRole="button"
                    accessibilityLabel={`Select theme hue ${h}`}
                  >
                    <View
                      style={[
                        styles.swatch,
                        {
                          backgroundColor: swatch,
                          borderColor: selected ? theme.text : "transparent",
                        },
                      ]}
                    />
                    {selected && (
                      <Text
                        style={[styles.selectedText, { color: theme.text }]}
                      >
                        ✓
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActions}>
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
                  style={[styles.modalBtnText, { color: theme.primaryTextOn }]}
                >
                  Done
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Progress Modal */}
      <Modal
        visible={editOpen}
        animationType="slide"
        transparent
        onRequestClose={closeEdit}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
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

                    <Text style={[styles.label, { color: theme.mutedText }]}>
                      Current
                    </Text>
                    <TextInput
                      value={editValue}
                      onChangeText={setEditValue}
                      keyboardType={
                        Platform.OS === "ios" ? "number-pad" : "numeric"
                      }
                      placeholder="0"
                      placeholderTextColor={theme.mutedText}
                      style={[
                        styles.input,
                        {
                          borderColor: theme.border,
                          color: theme.text,
                          backgroundColor: theme.bg,
                        },
                      ]}
                      maxLength={8}
                    />

                    <View style={styles.modalActions}>
                      <Pressable
                        onPress={closeEdit}
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
                        onPress={saveEditCount}
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
                          Save
                        </Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Milestone defaults visually to "Not yet" */}
                    <View style={styles.milestoneRow}>
                      <Pressable
                        onPress={() => setMilestoneComplete(false)}
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
                          style={[styles.milestoneText, { color: theme.text }]}
                        >
                          Not yet
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setMilestoneComplete(true)}
                        style={({ pressed }) => [
                          styles.milestoneBtn,
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

                    <View style={styles.modalActions}>
                      <Pressable
                        onPress={closeEdit}
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
                          Close
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
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
  appTitle: { fontSize: 30, fontWeight: "950", letterSpacing: 0.2 },
  yearText: { marginTop: 4, fontSize: 13, fontWeight: "800" },

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
  bigPct: { fontSize: 22, fontWeight: "950", letterSpacing: 0.2 },
  bigPctSub: { marginTop: 4, fontSize: 12, fontWeight: "700" },

  actionsRow: { marginTop: 14, flexDirection: "row", gap: 10 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 14, fontWeight: "950", letterSpacing: 0.2 },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "950", letterSpacing: 0.2 },

  divider: (theme) => ({
    marginTop: 16,
    height: 1,
    backgroundColor: theme.border,
  }),
  sectionTitle: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  emptyBox: { borderWidth: 1, borderRadius: 20, padding: 16, marginTop: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "950" },
  emptySub: { marginTop: 6, fontSize: 13, fontWeight: "650", lineHeight: 18 },

  bullet: { marginTop: 6, fontSize: 13, fontWeight: "800" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 16,
    justifyContent: "center",
  },
  modalCard: { borderWidth: 1, borderRadius: 22, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "950" },
  modalSub: { marginTop: 6, fontSize: 13, fontWeight: "650" },
  editGoalTitle: { marginTop: 10, fontSize: 16, fontWeight: "950" },

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

  typeRow: { marginTop: 10, flexDirection: "row", gap: 10 },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: { fontSize: 13, fontWeight: "950", letterSpacing: 0.2 },

  inlineInfo: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  inlineInfoText: { fontSize: 12, fontWeight: "750" },

  hueGrid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  swatchWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  swatch: { width: 44, height: 44, borderRadius: 999, borderWidth: 2 },
  selectedText: { position: "absolute", fontSize: 16, fontWeight: "950" },

  milestoneRow: { marginTop: 14, flexDirection: "row", gap: 10 },
  milestoneBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneText: { fontSize: 13, fontWeight: "950", letterSpacing: 0.2 },

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
  modalBtnText: { fontSize: 13, fontWeight: "950", letterSpacing: 0.2 },
});
