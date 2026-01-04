// components/HabitRow.js
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

export default function HabitRow({
  habit,
  dates,
  theme,
  onToggle,
  onDelete,
  labelWidth = 140,
  squareSize = 34,
  labelGap = 10,
}) {
  const renderRightActions = () => {
    return (
      <View style={styles.rightActionsWrap}>
        <Pressable
          onPress={() => onDelete(habit.id)}
          style={[
            styles.deleteBtn,
            {
              height: squareSize,
              backgroundColor: theme.danger,
              borderColor: theme.danger,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Delete habit ${habit.title}`}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    );
  };

  // value meanings:
  // 0/undefined = off
  // 1 = did it (good)
  // 2 = did it (bad)
  function squareBg(val) {
    if (val === 1) return theme.primary;
    if (val === 2) return theme.danger;
    return theme.card;
  }

  function squareLabel(val) {
    if (val === 1) return "did it (good)";
    if (val === 2) return "did it (bad)";
    return "not done";
  }

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <View style={styles.row}>
        <Text
          style={[
            styles.habitName,
            {
              width: labelWidth,
              color: theme.mutedText,
              paddingRight: labelGap,
            },
          ]}
          numberOfLines={1}
        >
          {habit.title}
        </Text>

        <View style={styles.squaresRow}>
          {dates.map((d) => {
            const val = habit.checks?.[d.key]; // 0/1/2
            return (
              <Pressable
                key={d.key}
                onPress={() => onToggle(habit.id, d.key)}
                style={[
                  styles.square,
                  {
                    width: squareSize,
                    height: squareSize,
                    backgroundColor: squareBg(val),
                    borderColor: theme.border,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${habit.title} day ${d.num} ${squareLabel(
                  val
                )}`}
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
  habitName: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  squaresRow: {
    flexDirection: "row",
    alignItems: "center",
    // no gap: squares touch
  },
  square: {
    borderWidth: 1,
    borderRadius: 2,
  },

  rightActionsWrap: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: 12,
  },
  deleteBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  deleteText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "950",
    letterSpacing: 0.2,
  },
});
