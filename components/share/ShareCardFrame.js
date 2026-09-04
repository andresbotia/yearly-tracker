// Museum-poster frame for share captures.
// Dimensions and capture contract stay with the caller.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import BrandMark from "../brand/BrandMark";

export function useScale(width) {
  const scale = width / 1080;
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
  kicker = "Atelier Tracker",
  credit,
}) {
  const { s } = useScale(width);
  const fontsLoaded = useFontsLoaded();
  const inset = s(48);
  const art = theme?.artwork;

  return (
    <View
      style={[
        styles.frame,
        {
          width,
          height,
          backgroundColor: theme.bg,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.rule,
          {
            top: inset,
            left: inset,
            right: inset,
            bottom: inset,
            borderColor: theme.text,
            borderWidth: Math.max(1, s(2)),
          },
        ]}
      />

      <View
        style={[
          styles.content,
          { padding: s(72) },
          contentStyle,
        ]}
      >
        <View style={[styles.brandRow, { marginBottom: s(10) }]}>
          <BrandMark size={Math.max(24, s(32))} />
          {kicker && String(kicker).toLowerCase() !== "atelier tracker" ? (
            <Text
              style={[
                styles.kicker,
                {
                  color: theme.mutedText,
                  fontFamily: fontFamily("data", fontsLoaded),
                  fontSize: s(18),
                  letterSpacing: s(4),
                  marginLeft: s(16),
                },
              ]}
            >
              {String(kicker).toUpperCase()}
            </Text>
          ) : null}
        </View>
        {children}
        <View style={{ flex: 1 }} />
        <Text
          style={[
            styles.credit,
            {
              color: theme.mutedText,
              fontFamily: fontFamily("data", fontsLoaded),
              fontSize: s(16),
              letterSpacing: s(2),
            },
          ]}
        >
          {credit ||
            (art
              ? `${art.title}  ·  ${art.artist}  ·  ${art.year}`
              : "Private ledger")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
  },
  rule: {
    position: "absolute",
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  kicker: {
    fontWeight: "600",
    textTransform: "uppercase",
    fontStyle: "normal",
  },
  credit: {
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
