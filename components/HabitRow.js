// components/HabitRow.js

import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

export default function HabitRow({
  habit,
  dates,
  theme,
  onToggle,
  onDelete,
  onDrag,
  dragging,
  labelWidth = 140,
  squareSize = 34,
  labelGap = 10,
}) {
  const squaresW = useMemo(
    () => squareSize * dates.length,
    [squareSize, dates.length]
  );

  function squareBg(val) {
    // 0/off: transparent
    // 1/good: theme.primary
    // 2/bad: theme.danger
    if (!val) return "transparent";
    if (val === 1) return theme.primary;
    return theme.danger;
  }

  const renderRightActions = () => (
    <Pressable
      onPress={() => onDelete?.(habit.id)}
      style={({ pressed }) => [
        styles.deleteBtn,
        {
          width: 96,
          backgroundColor: theme.danger,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.deleteText, { color: "#fff" }]}>Delete</Text>
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <View style={[styles.row, { opacity: dragging ? 0.9 : 1 }]}>
        {/* Label (long-press to drag) */}
        <Pressable
          onLongPress={onDrag}
          delayLongPress={150}
          style={[
            styles.labelBox,
            {
              width: labelWidth,
              paddingRight: labelGap,
            },
          ]}
        >
          <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
            {habit.title}
          </Text>
        </Pressable>

        {/* Squares */}
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
  deleteBtn: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 14,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: "950",
    letterSpacing: 0.2,
  },
});
