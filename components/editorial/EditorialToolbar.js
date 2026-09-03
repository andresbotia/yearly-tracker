import React from "react";
import { View, Pressable, Text, StyleSheet, Platform } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";

export default function EditorialToolbar({ items = [], theme, style }) {
  const fontsLoaded = useFontsLoaded();
  if (!items.length) return null;

  const ink = theme?.text || "#1c1916";
  const danger = theme?.danger || "#9b2c2c";

  return (
    <View style={[styles.row, style]}>
      {items.map((item) => {
        const color = item.danger ? danger : ink;
        return (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            disabled={item.disabled}
            accessibilityRole="button"
            accessibilityLabel={item.accessibilityLabel || item.label}
            style={({ pressed }) => [
              styles.cell,
              {
                borderColor: color,
                opacity: item.disabled ? 0.45 : pressed ? 0.65 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color,
                  fontFamily: fontFamily("data", fontsLoaded),
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: SPACE.xs,
  },
  cell: {
    flex: 1,
    minHeight: 44,
    minWidth: 44,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACE.xs,
    paddingVertical: SPACE.sm,
    ...Platform.select({
      android: { elevation: 0 },
    }),
  },
  label: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
    fontStyle: "normal",
    textAlign: "center",
  },
});
