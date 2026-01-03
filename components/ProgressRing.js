// components/ProgressRing.js

import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function ProgressRing({
  size = 160,
  strokeWidth = 14,
  percent = 0, // 0..100
  theme,
  label = "",
}) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));

  const r = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const cx = size / 2;
  const cy = size / 2;

  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={theme.ringBg}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={theme.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          originX={cx}
          originY={cy}
        />
      </Svg>

      <View style={styles.center}>
        <Text style={[styles.percent, { color: theme.text }]}>
          {Math.round(clamped)}%
        </Text>
        {!!label && (
          <Text style={[styles.label, { color: theme.mutedText }]}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percent: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
});
