import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import PressableInk from "../motion/PressableInk";

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
          <View
            key={item.label}
            ref={item.measureRef}
            collapsable={false}
            style={styles.cellWrap}
          >
            <PressableInk
              onPress={item.onPress}
              disabled={item.disabled}
              haptic="select"
              accessibilityRole="button"
              accessibilityLabel={item.accessibilityLabel || item.label}
              style={[
                styles.cell,
                {
                  borderColor: color,
                },
              ]}
              innerStyle={styles.cellInner}
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
            </PressableInk>
          </View>
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
  cellWrap: {
    flex: 1,
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
  cellInner: {
    minHeight: 44,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
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
