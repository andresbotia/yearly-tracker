import React from "react";
import { View, StyleSheet } from "react-native";
import { SPACE, LEGIBILITY } from "../../utils/tokens";

export default function EditorialSurface({
  children,
  theme,
  style,
  padded = true,
}) {
  const wash = theme?.kind === "art" && theme?.artwork ? LEGIBILITY.wash : "transparent";
  const keyline =
    theme?.kind === "art" && theme?.artwork
      ? LEGIBILITY.keyline
      : "transparent";

  return (
    <View
      style={[
        styles.surface,
        padded && styles.padded,
        {
          backgroundColor: wash,
          borderColor: keyline,
          borderWidth: keyline === "transparent" ? 0 : StyleSheet.hairlineWidth,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    alignSelf: "stretch",
  },
  padded: {
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.sm,
  },
});
