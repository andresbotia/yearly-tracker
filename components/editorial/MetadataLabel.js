import React from "react";
import { Text, StyleSheet } from "react-native";
import { TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";

export default function MetadataLabel({
  children,
  theme,
  fontsLoaded,
  style,
}) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  return (
    <Text
      style={[
        styles.label,
        {
          color: theme?.mutedText || "#6b645c",
          fontFamily: fontFamily("data", loaded),
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
    fontStyle: "normal",
  },
});
