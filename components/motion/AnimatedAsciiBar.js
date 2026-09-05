import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { TYPE_SIZE, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import { asciiBar } from "../../utils/asciiBar";
import { useReducedMotion } from "../../utils/motion";

export default function AnimatedAsciiBar({
  percent = 0,
  width = 22,
  theme,
  fontsLoaded,
  style,
}) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  const reduced = useReducedMotion();
  const bar = asciiBar(percent, width);
  const filled = bar.replace(/\./g, "").length;
  const prevFilled = useRef(filled);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (reduced) {
      prevFilled.current = filled;
      setFlash(false);
      return;
    }
    if (filled > prevFilled.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 240);
      prevFilled.current = filled;
      return () => clearTimeout(t);
    }
    prevFilled.current = filled;
  }, [filled, reduced]);

  const ink = theme?.text || "#1c1916";
  const accent = theme?.primary || ink;

  if (!flash || filled <= 0) {
    return (
      <Text
        style={[
          styles.bar,
          { color: ink, fontFamily: fontFamily("data", loaded) },
          style,
        ]}
        numberOfLines={1}
      >
        {bar}
      </Text>
    );
  }

  return (
    <Text
      style={[
        styles.bar,
        { color: ink, fontFamily: fontFamily("data", loaded) },
        style,
      ]}
      numberOfLines={1}
    >
      {bar.slice(0, filled - 1)}
      <Text style={{ color: accent }}>+</Text>
      {bar.slice(filled)}
    </Text>
  );
}

const styles = StyleSheet.create({
  bar: {
    fontSize: TYPE_SIZE.caption,
    letterSpacing: 0.8,
  },
});
