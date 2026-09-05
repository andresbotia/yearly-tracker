import React from "react";
import { Text, StyleSheet, Platform } from "react-native";
import { fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";

export default function AsciiArtwork({
  ascii,
  theme,
  opacity,
  fontsLoaded,
}) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  const plate = typeof ascii === "string" ? ascii : "";
  if (!plate) return null;

  const color = theme?.mutedText || theme?.text || "#6b645c";
  const alpha =
    typeof opacity === "number"
      ? opacity
      : theme?.ascii?.opacity ?? theme?.visual?.asciiOpacity ?? 0.14;

  return (
    <Text
      accessible={false}
      importantForAccessibility="no"
      selectable={false}
      style={[
        styles.plate,
        {
          color,
          opacity: alpha,
          fontFamily: fontFamily("data", loaded),
        },
      ]}
    >
      {plate}
    </Text>
  );
}

const styles = StyleSheet.create({
  plate: {
    fontSize: 5,
    lineHeight: 6,
    letterSpacing: 0.2,
    fontVariant: ["tabular-nums"],
    ...Platform.select({
      android: { includeFontPadding: false },
    }),
  },
});
