// components/GoalItem.js
// Presentation-only redesign. Props and callbacks are unchanged.

import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../utils/tokens";
import { useFontsLoaded } from "../utils/fonts";
import EditorialSurface from "./editorial/EditorialSurface";
import AnimatedAsciiBar from "./motion/AnimatedAsciiBar";
import AnimatedNumber from "./motion/AnimatedNumber";
import { hapticSelect } from "../utils/motion";

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

          <View style={styles.metaRow}>
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
            <AnimatedNumber
              value={pct}
              theme={theme}
              role="data"
              format={(v) => `${v}%`}
              style={[styles.pct, { color: muted }]}
            />
          </View>

          <AnimatedAsciiBar
            percent={pct}
            width={22}
            theme={theme}
            fontsLoaded={fontsLoaded}
            style={styles.bar}
          />
        </View>
      </View>

      <EditorialSurface theme={theme} padded={false} style={styles.actions}>
        <View style={styles.rail}>
          <Pressable
            onPress={async () => {
              await hapticSelect();
              onProgress?.(goal);
            }}
            style={({ pressed }) => [
              styles.railPrimary,
              { borderColor: ink, opacity: pressed ? 0.65 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Update progress for ${goal.title}`}
          >
            <Text
              style={[
                styles.railPrimaryText,
                { color: ink, fontFamily: fontFamily("data", fontsLoaded) },
              ]}
            >
              {isComplete ? "Adjust" : "Progress"}
            </Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              await hapticSelect();
              onEditDetails?.(goal);
            }}
            hitSlop={6}
            style={({ pressed }) => [
              styles.railGhost,
              { opacity: pressed ? 0.55 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Edit goal details for ${goal.title}`}
          >
            <Text
              style={[
                styles.railGhostText,
                { color: ink, fontFamily: fontFamily("data", fontsLoaded) },
              ]}
            >
              Edit
            </Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              await hapticSelect();
              onDelete?.(goal.id);
            }}
            hitSlop={6}
            style={({ pressed }) => [
              styles.railGhost,
              { opacity: pressed ? 0.55 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${goal.title}`}
          >
            <Text
              style={[
                styles.railGhostText,
                {
                  color: theme.danger || "#9b2c2c",
                  fontFamily: fontFamily("data", fontsLoaded),
                },
              ]}
            >
              Delete
            </Text>
          </Pressable>
        </View>
      </EditorialSurface>
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
  metaRow: {
    marginTop: SPACE["3xs"],
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACE.sm,
  },
  meta: {
    fontSize: TYPE_SIZE.caption,
    letterSpacing: TYPE_TRACK.data,
    textTransform: "uppercase",
    flex: 1,
  },
  pct: {
    fontSize: TYPE_SIZE.caption,
    letterSpacing: TYPE_TRACK.data,
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
  rail: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.xs,
  },
  railPrimary: {
    flex: 1,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACE.sm,
  },
  railPrimaryText: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  railGhost: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: SPACE.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  railGhostText: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
});
