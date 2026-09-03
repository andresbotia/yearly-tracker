// components/HabitRow.js
// Presentation-only redesign. Stored 0/1/2 states, toggle, swipe, drag, and streak stay unchanged.

import React, { useMemo, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SPACE, TYPE_SIZE, TYPE_TRACK, MOTION, fontFamily, LEGIBILITY } from "../utils/tokens";
import { habitStateChar, habitStateLabel } from "../utils/habitAscii";
import { useFontsLoaded } from "../utils/fonts";

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

function HabitCell({ value, size, theme, onPress, fontsLoaded, label }) {
  const scale = useSharedValue(1);
  const flash = useSharedValue(0);
  const prev = React.useRef(value);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  React.useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    flash.value = 1;
    flash.value = withTiming(0, { duration: MOTION.micro });
  }, [value, flash]);

  const char = habitStateChar(value);
  const baseColor =
    value === 1
      ? theme.primary
      : value === 2
        ? theme.danger
        : theme.mutedText;

  const charStyle = useAnimatedStyle(() => ({
    opacity: 1,
    transform: [{ scale: 1 + flash.value * 0.06 }],
  }));

  return (
    <Animated.View style={scaleStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(MOTION.pressScale, { duration: MOTION.micro });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: MOTION.short });
        }}
        style={[styles.cell, { width: size, height: size }]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Cycles empty, good, bad"
      >
        <Animated.View style={charStyle}>
          <Text
            style={[
              styles.cellChar,
              {
                color: baseColor,
                fontFamily: fontFamily("data", fontsLoaded),
              },
            ]}
          >
            {char}
          </Text>
        </Animated.View>
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
  const base = variant === "danger" ? theme.danger : theme.text;
  const bg = hexToRgba(base, 0.08);
  const bgPressed = hexToRgba(base, 0.16);

  return (
    <Pressable
      onPress={() => {
        try {
          swipeableRef.current?.close?.();
        } catch {}
        requestAnimationFrame(() => onPress?.());
      }}
      style={({ pressed }) => [
        styles.actionBtn,
        {
          marginLeft: first ? 0 : SPACE.xs,
          backgroundColor: pressed ? bgPressed : bg,
          borderColor: theme.border,
        },
      ]}
      accessibilityRole="button"
    >
      <Ionicons name={iconName} size={18} color={base} />
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
  onSwipeOpen,
  onSwipeClose,
}) {
  const swipeRef = useRef(null);
  const fontsLoaded = useFontsLoaded();

  const squaresW = useMemo(
    () => squareSize * dates.length,
    [squareSize, dates.length],
  );

  const streak = useMemo(
    () => streakFromChecks(habit?.checks || {}),
    [habit?.checks],
  );

  const renderRightActions = (progress) => {
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
      friction={0.85}
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
            borderBottomColor: theme.border,
            backgroundColor:
              theme?.kind === "art" && theme?.artwork
                ? LEGIBILITY.wash
                : "transparent",
            opacity: dragging ? 0.72 : 1,
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
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
                fontFamily: fontFamily("display", fontsLoaded),
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {habit.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.mutedText,
                fontFamily: fontFamily("data", fontsLoaded),
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {`streak ${streak}`}
          </Text>
        </Pressable>

        <View style={[styles.squaresRow, { width: squaresW }]}>
          {dates.map((d) => {
            const v = (habit.checks || {})[d.key] || 0;
            return (
              <HabitCell
                key={d.key}
                value={v}
                size={squareSize}
                theme={theme}
                fontsLoaded={fontsLoaded}
                label={`${habit.title}, ${d.key}, ${habitStateLabel(v)}`}
                onPress={() => onToggle?.(habit.id, d.key)}
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
    paddingVertical: SPACE.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  labelBox: { justifyContent: "center" },
  label: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  subtitle: {
    marginTop: SPACE["3xs"],
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.data,
    textTransform: "uppercase",
  },
  squaresRow: { flexDirection: "row", alignItems: "center" },
  cell: {
    alignItems: "center",
    justifyContent: "center",
  },
  cellChar: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: 0,
    ...Platform.select({
      android: { includeFontPadding: false },
    }),
  },
  actionsWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingHorizontal: SPACE.xs,
  },
  actionBtn: {
    width: 56,
    minHeight: 44,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: ANDROID ? 10 : 11,
  },
});
