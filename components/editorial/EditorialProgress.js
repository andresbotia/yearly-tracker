import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function asciiBar(percent, width = 24, fill = "█", empty = "░") {
  const pct = clamp(Number(percent) || 0, 0, 100);
  const filled = Math.round((pct / 100) * width);
  return `${fill.repeat(filled)}${empty.repeat(Math.max(0, width - filled))}`;
}

export default function EditorialProgress({
  percent = 0,
  theme,
  label,
  width = 24,
  fontsLoaded = false,
}) {
  const pct = clamp(Number(percent) || 0, 0, 100);
  const bar = asciiBar(pct, width);
  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={styles.wrap}
    >
      {!!label && (
        <Text
          style={[
            styles.label,
            { color: muted, fontFamily: fontFamily("data", fontsLoaded) },
          ]}
        >
          {label}
        </Text>
      )}
      <Text
        style={[
          styles.bar,
          { color: ink, fontFamily: fontFamily("data", fontsLoaded) },
        ]}
        numberOfLines={1}
      >
        {bar}
      </Text>
      <Text
        style={[
          styles.pct,
          { color: ink, fontFamily: fontFamily("display", fontsLoaded) },
        ]}
      >
        {Math.round(pct)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: SPACE["2xs"],
  },
  label: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
    fontStyle: "normal",
  },
  bar: {
    fontSize: TYPE_SIZE.caption,
    letterSpacing: 0.6,
  },
  pct: {
    fontSize: TYPE_SIZE.title,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
});
