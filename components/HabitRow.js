// components/HabitRow.js

import React, { useMemo, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

const ANDROID = Platform.OS === "android";

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

export default function HabitRow({
  habit,
  dates,
  theme,
  onToggle,
  onDelete,
  onEdit, // ✅ optional
  onDrag,
  dragging,
  labelWidth = 140,
  squareSize = 34,
  labelGap = 10,
}) {
  const swipeRef = useRef(null);

  const safeDates = Array.isArray(dates) ? dates : [];

  const squaresW = useMemo(
    () => squareSize * safeDates.length,
    [squareSize, safeDates.length]
  );

  function squareBg(val) {
    // 0/off: transparent
    // 1/good: theme.primary
    // 2/bad: theme.danger
    if (!val) return "transparent";
    if (val === 1) return theme.primary;
    return theme.danger;
  }

  const renderRightActions = () => {
    const danger = theme?.danger || "#DC2626";
    const primary = theme?.primary || "#2563EB";

    // subtle “chip” backgrounds behind icons
    const delBg = hexToRgba(danger, 0.14);
    const delBgPressed = hexToRgba(danger, 0.22);
    const delBorder = hexToRgba(danger, 0.18);

    const editBg = hexToRgba(primary, 0.12);
    const editBgPressed = hexToRgba(primary, 0.2);
    const editBorder = hexToRgba(primary, 0.16);

    return (
      <View style={styles.actionsWrap}>
        {!!onEdit && (
          <Pressable
            onPress={() => {
              // close first to avoid weird overlap
              try {
                swipeRef.current?.close?.();
              } catch {}
              requestAnimationFrame(() => onEdit?.(habit));
            }}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: pressed ? editBgPressed : editBg,
                borderColor: editBorder,
                marginRight: 10,
                transform: pressed ? [{ scale: 0.98 }] : undefined,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Edit habit ${habit.title}`}
          >
            <Ionicons name="create-outline" size={22} color={primary} />
          </Pressable>
        )}

        <Pressable
          onPress={() => {
            try {
              swipeRef.current?.close?.();
            } catch {}
            requestAnimationFrame(() => onDelete?.(habit.id));
          }}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              backgroundColor: pressed ? delBgPressed : delBg,
              borderColor: delBorder,
              transform: pressed ? [{ scale: 0.98 }] : undefined,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Delete habit ${habit.title}`}
        >
          <Ionicons name="trash-outline" size={22} color={danger} />
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
    >
      <View style={[styles.row, { opacity: dragging ? 0.9 : 1 }]}>
        {/* Label (long-press to drag) */}
        <Pressable
          onLongPress={() => {
            // close if open before dragging
            try {
              swipeRef.current?.close?.();
            } catch {}
            onDrag?.();
          }}
          delayLongPress={150}
          style={[
            styles.labelBox,
            {
              width: labelWidth,
              paddingRight: labelGap,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Reorder habit ${habit.title}`}
        >
          <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
            {habit.title}
          </Text>
        </Pressable>

        {/* Squares */}
        <View style={[styles.squaresRow, { width: squaresW }]}>
          {safeDates.map((d) => {
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
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  labelBox: {
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "950",
    letterSpacing: 0.2,
  },
  squaresRow: {
    flexDirection: "row",
  },
  square: {
    borderWidth: 1,
    borderRadius: 8,
  },

  // Right actions
  actionsWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  actionBtn: {
    width: 72,
    minHeight: 52,
    height: "100%",
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ANDROID ? 10 : 11,
  },
});
