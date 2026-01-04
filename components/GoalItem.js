// components/GoalItem.js

import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function goalPercent(goal) {
  if (goal.type === "boolean") return goal.progress === 1 ? 100 : 0;
  if (!goal.target || goal.target <= 0) return 0;
  return clamp((goal.progress / goal.target) * 100, 0, 100);
}

export default function GoalItem({
  goal,
  theme,
  onEdit,
  onDelete,
  onDrag,
  dragging = false,
}) {
  const percent = useMemo(() => goalPercent(goal), [goal]);
  const pct = Math.round(percent);
  const isComplete = pct >= 100;

  const typeLabel = goal.type === "count" ? "Count" : "Milestone";
  const meta =
    goal.type === "count" && goal.target
      ? `${goal.progress}/${goal.target}`
      : goal.progress === 1
      ? "Completed"
      : "Not yet";

  async function hapticLight() {
    try {
      await Haptics.selectionAsync();
    } catch {}
  }

  return (
    <Pressable
      onLongPress={onDrag}
      delayLongPress={120}
      disabled={!onDrag}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        (pressed || dragging) && {
          opacity: 0.95,
          transform: [{ scale: 0.99 }],
        },
      ]}
    >
      <View style={styles.rowTop}>
        <Pressable
          onLongPress={onDrag}
          delayLongPress={120}
          disabled={!onDrag}
          hitSlop={8}
          style={[
            styles.dragHandle,
            { borderColor: theme.border, backgroundColor: theme.bg },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Drag to reorder ${goal.title}`}
        >
          <View
            style={[styles.dragDot, { backgroundColor: theme.mutedText }]}
          />
          <View
            style={[
              styles.dragDot,
              { backgroundColor: theme.mutedText, marginTop: 4 },
            ]}
          />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {goal.title}
          </Text>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.badge,
                { borderColor: theme.border, backgroundColor: theme.bg },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.mutedText }]}>
                {typeLabel}
              </Text>
            </View>

            <Text style={[styles.metaText, { color: theme.mutedText }]}>
              {meta}
            </Text>
          </View>
        </View>

        <View style={styles.rightCol}>
          <Text style={[styles.pctText, { color: theme.text }]}>{pct}%</Text>
          <Text style={[styles.pctSub, { color: theme.mutedText }]}>
            complete
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {isComplete ? (
          <>
            <View
              style={[
                styles.completedPill,
                {
                  backgroundColor: theme.bg,
                  borderColor: theme.primaryPressed,
                },
              ]}
              accessibilityLabel={`${goal.title} completed`}
            >
              <Text
                style={[styles.primaryBtnText, { color: theme.primaryPressed }]}
              >
                ✓ Completed
              </Text>
            </View>

            <Pressable
              onPress={async () => {
                await hapticLight();
                onEdit(goal);
              }}
              style={({ pressed }) => [
                styles.ghostBtn,
                {
                  backgroundColor: pressed ? theme.border : "transparent",
                  borderColor: theme.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Adjust ${goal.title}`}
            >
              <Text style={[styles.ghostBtnText, { color: theme.text }]}>
                Adjust
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={async () => {
              await hapticLight();
              onEdit(goal);
            }}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: pressed ? theme.primaryPressed : theme.primary,
                borderColor: theme.primary,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Edit progress for ${goal.title}`}
          >
            <Text
              style={[styles.primaryBtnText, { color: theme.primaryTextOn }]}
            >
              Edit Progress
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => onDelete(goal.id)}
          style={({ pressed }) => [
            styles.ghostBtn,
            {
              backgroundColor: pressed ? theme.border : "transparent",
              borderColor: theme.border,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${goal.title}`}
        >
          <Text style={[styles.ghostBtnText, { color: theme.danger }]}>
            Delete
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  rowTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  dragHandle: {
    width: 32,
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dragDot: {
    width: 10,
    height: 3,
    borderRadius: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "700",
  },
  rightCol: {
    alignItems: "flex-end",
    minWidth: 72,
  },
  pctText: {
    fontSize: 18,
    fontWeight: "950",
    letterSpacing: 0.2,
  },
  pctSub: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
  },

  actions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  primaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  completedPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  ghostBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});
