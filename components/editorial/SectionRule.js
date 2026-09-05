import React from "react";
import { View, StyleSheet } from "react-native";
import { SPACE } from "../../utils/tokens";

export default function SectionRule({ theme, style }) {
  return (
    <View
      style={[
        styles.rule,
        { backgroundColor: theme?.border || "#d8d0c4" },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  rule: {
    height: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    marginTop: SPACE.md,
    marginBottom: SPACE.md,
  },
});
