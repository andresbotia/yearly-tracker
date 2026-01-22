// components/share/ShareCardFrame.js

import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from "react-native-svg";

export function useScale(width) {
  const scale = width / 750;
  const s = (n) => Math.round(n * scale);
  return { scale, s };
}

export function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== "string") return `rgba(0,0,0,${alpha})`;
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  if ([r, g, b].some((v) => Number.isNaN(v))) return `rgba(0,0,0,${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ShareCardFrame({
  width,
  height,
  theme,
  children,
  contentStyle,
}) {
  const { s } = useScale(width);
  const gradId = `share-bg-${width}-${height}`;
  return (
    <View
      style={[
        styles.frame,
        {
          width,
          height,
          borderRadius: s(48),
          backgroundColor: theme.bg,
        },
      ]}
    >
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={theme.ringBg} stopOpacity="1" />
            <Stop offset="55%" stopColor={theme.primary} stopOpacity="0.92" />
            <Stop
              offset="100%"
              stopColor={theme.primaryPressed || theme.primary}
              stopOpacity="1"
            />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill={`url(#${gradId})`} />
        <Circle
          cx={width * 0.86}
          cy={height * 0.18}
          r={width * 0.32}
          fill={theme.card}
          opacity={0.16}
        />
        <Circle
          cx={width * 0.12}
          cy={height * 0.9}
          r={width * 0.4}
          fill={theme.card}
          opacity={0.12}
        />
      </Svg>

      <View style={[styles.content, { padding: s(56) }, contentStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
  },
  content: {
    flex: 1,
  },
});
