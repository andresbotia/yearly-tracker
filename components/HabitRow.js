// components/HabitRow.js

import React, { useMemo, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const ANDROID = Platform.OS === "android";

function pad2(n) {
  return String(n).padStart(2, "0");
}
function dateKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function streakFromChecks(checks) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 366; i++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    const k = dateKey(dt);
    const v = (checks || {})[k] || 0;
    if (v === 1) streak += 1;
    else break;
  }
  return streak;
}

function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== "string") return `rgba(0,0,0,${alpha})`;
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  if ([r, g, b].some((v) => Number.isNaN(v))) return `rgba(0,0,0,${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function ActionButton({
  iconName,
  variant,
  onPress,
  theme,
  swipeableRef,
  first,
}) {
  const base = variant === "danger" ? theme.danger : theme.primary;
  const bg = hexToRgba(base, 0.12);
  const bgPressed = hexToRgba(base, 0.22);
  const border = hexToRgba(base, 0.18);

  return (
    <Pressable
      onPress={() => {
        // close immediately so the row doesn't “overlap” actions while navigating
        try {
          swipeableRef.current?.close?.();
        } catch {}
        // run after close kick-off
        requestAnimationFrame(() => onPress?.());
      }}
      style={({ pressed }) => [
        styles.actionBtn,
        {
          marginLeft: first ? 0 : 10,
          backgroundColor: pressed ? bgPressed : bg,
          borderColor: border,
        },
      ]}
      accessibilityRole="button"
    >
      <Ionicons name={iconName} size={22} color={base} />
    </Pressable>
  );
}

export default function HabitRow({
  habit,
  dates,
  theme,
  onToggle,
  onDelete,
  onEdit,
  onDrag,
  dragging,
  labelWidth = 140,
  squareSize = 34,
  labelGap = 10,

  // only-one-open-at-a-time coordination (from App.js)
  onSwipeOpen,
  onSwipeClose,
}) {
  const swipeRef = useRef(null);

  const squaresW = useMemo(
    () => squareSize * dates.length,
    [squareSize, dates.length]
  );

  const streak = useMemo(
    () => streakFromChecks(habit?.checks || {}),
    [habit?.checks]
  );

  function squareBg(val) {
    if (!val) return "transparent";
    if (val === 1) return theme.primary;
    return theme.danger;
  }

  // ✅ Right actions with smooth fade/slide in/out.
  // ReanimatedSwipeable passes shared values; this stays stable and avoids the old Swipeable crash.
  const renderRightActions = (progress /* shared value */) => {
    const animatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        progress.value,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP
      );
      const translateX = interpolate(
        progress.value,
        [0, 1],
        [40, 0],
        Extrapolate.CLAMP
      );
      return {
        opacity,
        transform: [{ translateX }],
      };
    });

    return (
      <Animated.View style={[styles.actionsWrap, animatedStyle]}>
        <ActionButton
          first
          iconName="create-outline"
          variant="primary"
          theme={theme}
          swipeableRef={swipeRef}
          onPress={() => onEdit?.(habit)}
        />
        <ActionButton
          iconName="trash-outline"
          variant="danger"
          theme={theme}
          swipeableRef={swipeRef}
          onPress={() => onDelete?.(habit.id)}
        />
      </Animated.View>
    );
  };

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={36}
      friction={0.85} // ✅ snappier open/close (lower = less “slow rubber band”)
      onSwipeableWillOpen={() => {
        onSwipeOpen?.(habit.id, swipeRef.current);
      }}
      onSwipeableClose={() => {
        onSwipeClose?.(habit.id);
      }}
    >
      <View style={[styles.row, { opacity: dragging ? 0.9 : 1 }]}>
        <Pressable
          onLongPress={() => {
            try {
              swipeRef.current?.close?.();
            } catch {}
            onDrag?.();
          }}
          delayLongPress={150}
          style={[
            styles.labelBox,
            { width: labelWidth, paddingRight: labelGap },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Habit ${habit.title}. Long press to reorder.`}
        >
          <View style={styles.labelRow}>
            <Text
              style={[styles.label, { color: theme.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {habit.title}
            </Text>

            {streak > 0 && (
              <View style={styles.streakInline}>
                <Ionicons
                  name="flame-outline"
                  size={14}
                  color={theme.mutedText}
                />
                <Text style={[styles.streakText, { color: theme.mutedText }]}>
                  {streak}d
                </Text>
              </View>
            )}
          </View>
        </Pressable>

        <View style={[styles.squaresRow, { width: squaresW }]}>
          {dates.map((d) => {
            const v = (habit.checks || {})[d.key] || 0;
            return (
              <Pressable
                key={d.key}
                onPress={() => onToggle?.(habit.id, d.key)}
                style={[
                  styles.square,
                  {
                    width: squareSize,
                    height: squareSize,
                    borderColor: theme.border,
                    backgroundColor: squareBg(v),
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  labelBox: { justifyContent: "center" },
  labelRow: { flexDirection: "row", alignItems: "center" },
  label: {
    flex: 1, // ✅ takes remaining space
    fontSize: 15,
    fontWeight: "950",
    letterSpacing: 0.2,
    marginRight: 8, // ✅ breathing room before streak
  },
  streak: { fontSize: 13, fontWeight: "900", letterSpacing: 0.2 },
  squaresRow: { flexDirection: "row" },
  square: { borderWidth: 1, borderRadius: 8 },
  streakInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0, // ✅ never squishes into title
  },
  streakText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  actionsWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingHorizontal: 10,
  },
  actionBtn: {
    width: 72,
    minHeight: 52,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: ANDROID ? 10 : 11,
  },
  streakChip: {
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  streakChipText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});
