// components/GoalItem.js
// Presentation-only redesign. Props and callbacks are unchanged.

import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../utils/tokens";
import { asciiBar } from "./editorial/EditorialProgress";
import { useFontsLoaded } from "../utils/fonts";
import EditorialToolbar from "./editorial/EditorialToolbar";

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
  onProgress,
  onEditDetails,
  onDelete,
  onDrag,
  dragging = false,
  index,
}) {
  const fontsLoaded = useFontsLoaded();
  const percent = useMemo(() => goalPercent(goal), [goal]);
  const pct = Math.round(percent);
  const isComplete = pct >= 100;
  const indexLabel =
    typeof index === "number" && index > 0
      ? String(index).padStart(2, "0")
      : null;

  const meta =
    goal.type === "count" && goal.target
      ? `${goal.progress} / ${goal.target}`
      : isComplete
        ? "Complete"
        : "Incomplete";

  async function hapticLight() {
    try {
      await Haptics.selectionAsync();
    } catch {}
  }

  const ink = theme.text;
  const muted = theme.mutedText;
  const rule = theme.border;

  return (
    <Pressable
      onLongPress={onDrag}
      delayLongPress={120}
      disabled={!onDrag}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: rule,
          opacity: pressed || dragging ? 0.72 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Goal: ${goal.title}. Long press to reorder.`}
    >
      <View style={styles.top}>
        {indexLabel ? (
          <Text
            style={[
              styles.index,
              {
                color: muted,
                fontFamily: fontFamily("data", fontsLoaded),
              },
            ]}
          >
            {indexLabel}
          </Text>
        ) : null}

        <View style={styles.body}>
          <Text
            style={[
              styles.title,
              {
                color: ink,
                fontFamily: fontFamily("display", fontsLoaded),
              },
            ]}
            numberOfLines={2}
          >
            {String(goal.title || "").toUpperCase()}
          </Text>

          <Text
            style={[
              styles.meta,
              {
                color: muted,
                fontFamily: fontFamily("data", fontsLoaded),
              },
            ]}
          >
            {meta}
            {isComplete ? "   ·   DONE" : ""}
          </Text>

          <Text
            style={[
              styles.bar,
              {
                color: ink,
                fontFamily: fontFamily("data", fontsLoaded),
              },
            ]}
            accessible
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: pct }}
          >
            {asciiBar(pct, 22, "+", ".")}
          </Text>
        </View>
      </View>

      <EditorialToolbar
        theme={theme}
        style={styles.actions}
        items={[
          {
            label: "Edit",
            accessibilityLabel: `Edit goal details for ${goal.title}`,
            onPress: async () => {
              await hapticLight();
              onEditDetails?.(goal);
            },
          },
          {
            label: isComplete ? "Adjust" : "Update",
            accessibilityLabel: `Update progress for ${goal.title}`,
            onPress: async () => {
              await hapticLight();
              onProgress?.(goal);
            },
          },
          {
            label: "Delete",
            danger: true,
            accessibilityLabel: `Delete ${goal.title}`,
            onPress: async () => {
              await hapticLight();
              onDelete?.(goal.id);
            },
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingTop: SPACE.md,
    paddingBottom: SPACE.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACE.sm,
  },
  index: {
    width: 28,
    marginTop: 4,
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.data,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: SPACE["2xs"],
  },
  title: {
    fontSize: TYPE_SIZE.bodyLg,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  meta: {
    marginTop: SPACE["3xs"],
    fontSize: TYPE_SIZE.caption,
    letterSpacing: TYPE_TRACK.data,
    textTransform: "uppercase",
  },
  bar: {
    marginTop: SPACE.xs,
    fontSize: TYPE_SIZE.caption,
    letterSpacing: 0.8,
  },
  actions: {
    marginTop: SPACE.sm,
    marginLeft: 28 + SPACE.sm,
  },
});
