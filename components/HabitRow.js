// components/HabitRow.js

import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
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
    if (v > 0) streak += 1;
    else break;
  }
  return streak;
}

function lastStateFromChecks(checks) {
  const keys = Object.keys(checks || {});
  if (!keys.length) return 0;
  let latest = keys[0];
  for (let i = 1; i < keys.length; i++) {
    if (keys[i] > latest) latest = keys[i];
  }
  const v = (checks || {})[latest] || 0;
  return v === 1 ? 1 : v === 2 ? 2 : 0;
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

function HabitSquare({ value, size, theme, onPress }) {
  const scale = useSharedValue(1);
  const ring = useSharedValue(0);
  const pulse = useSharedValue(0);
  const prevVal = useRef(value);

  useEffect(() => {
    if (value === 1 && prevVal.current !== 1) {
      pulse.value = 0;
      pulse.value = withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 220 }),
      );
    }
    prevVal.current = value;
  }, [value, pulse]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.22,
    transform: [{ scale: 1 + pulse.value * 0.6 }],
  }));

  const bg =
    value === 1 ? theme.primary : value === 2 ? theme.danger : "transparent";

  return (
    <Animated.View style={scaleStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.96, { duration: 90 });
          ring.value = withTiming(1, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 140 });
          ring.value = withTiming(0, { duration: 160 });
        }}
        style={[
          styles.square,
          {
            width: size,
            height: size,
            borderColor: theme.border,
            backgroundColor: bg,
          },
        ]}
        accessibilityRole="button"
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.squareRing, ringStyle, { borderColor: theme.primary }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.squarePulse,
            pulseStyle,
            { backgroundColor: theme.ringBg || theme.primary },
          ]}
        />
      </Pressable>
    </Animated.View>
  );
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
    [squareSize, dates.length],
  );
  const innerSquare = useMemo(() => Math.max(22, squareSize - 6), [squareSize]);

  const streak = useMemo(
    () => streakFromChecks(habit?.checks || {}),
    [habit?.checks],
  );

  const lastState = useMemo(
    () => lastStateFromChecks(habit?.checks || {}),
    [habit?.checks],
  );
  const lastLabel = lastState === 1 ? "good" : lastState === 2 ? "bad" : "off";
  const lastColor =
    lastState === 1
      ? theme.primary
      : lastState === 2
        ? theme.danger
        : theme.mutedText;

  // ✅ Right actions with smooth fade/slide in/out.
  // ReanimatedSwipeable passes shared values; this stays stable and avoids the old Swipeable crash.
  const renderRightActions = (progress /* shared value */) => {
    const animatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        progress.value,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP,
      );
      const translateX = interpolate(
        progress.value,
        [0, 1],
        [40, 0],
        Extrapolate.CLAMP,
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
      <View
        style={[
          styles.row,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            opacity: dragging ? 0.92 : 1,
          },
        ]}
      >
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
          <View style={styles.labelBlock}>
            <Text
              style={[styles.label, { color: theme.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {habit.title}
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.mutedText }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              streak {streak}
              {/* • last:{" "} */}
              {/* <Text style={[styles.lastStateText, { color: lastColor }]}>
                {lastLabel}
              </Text> */}
            </Text>
          </View>
        </Pressable>

        <View style={[styles.squaresRow, { width: squaresW }]}>
          {dates.map((d) => {
            const v = (habit.checks || {})[d.key] || 0;
            return (
              <View
                key={d.key}
                style={[
                  styles.squareCell,
                  { width: squareSize, height: squareSize },
                ]}
              >
                <HabitSquare
                  value={v}
                  size={innerSquare}
                  theme={theme}
                  onPress={() => onToggle?.(habit.id, d.key)}
                />
              </View>
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
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 1,
      },
    }),
  },
  labelBox: { justifyContent: "center" },
  labelBlock: { flexShrink: 1 },
  label: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  squaresRow: { flexDirection: "row", alignItems: "center" },
  square: {
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "visible",
  },
  squareCell: { alignItems: "center", justifyContent: "center" },
  squareRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    borderWidth: 2,
  },
  squarePulse: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  lastStateText: { fontWeight: "900" },
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
