import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import AnimatedAsciiBar from "../motion/AnimatedAsciiBar";
import AnimatedNumber from "../motion/AnimatedNumber";
import { asciiBar } from "../../utils/asciiBar";

export { asciiBar };

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function EditorialProgress({
  percent = 0,
  theme,
  label,
  width = 24,
  fontsLoaded,
}) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  const pct = clamp(Number(percent) || 0, 0, 100);
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
            { color: muted, fontFamily: fontFamily("data", loaded) },
          ]}
        >
          {label}
        </Text>
      )}
      <AnimatedAsciiBar
        percent={pct}
        width={width}
        theme={theme}
        fontsLoaded={loaded}
        style={styles.bar}
      />
      <AnimatedNumber
        value={Math.round(pct)}
        theme={theme}
        role="display"
        format={(v) => `${v}%`}
        style={styles.pct}
      />
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
