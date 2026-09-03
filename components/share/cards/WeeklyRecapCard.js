// components/share/cards/WeeklyRecapCard.js
// Presentation only. Data comes from getWeeklyRecap.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShareCardFrame, useScale } from "../ShareCardFrame";
import { asciiBar } from "../../editorial/EditorialProgress";
import { fontFamily } from "../../../utils/tokens";
import { useFontsLoaded } from "../../../utils/fonts";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function ShareWeeklyRecapCard({ data, width, height, theme }) {
  const { s } = useScale(width);
  const fontsLoaded = useFontsLoaded();
  const safe = data || {
    rangeLabel: "",
    consistencyPct: 0,
    totalChecks: 0,
    good: 0,
    bad: 0,
    missed: 0,
    topHabits: [],
  };
  const pct = clamp(Math.round(safe.consistencyPct || 0), 0, 100);
  const completed = (safe.good || 0) + (safe.bad || 0);
  const missed = safe.missed || 0;
  const derivedTotal = completed + missed;
  const total =
    safe.totalChecks === derivedTotal ? safe.totalChecks : derivedTotal;
  const habits = (safe.topHabits || []).slice(0, 4);

  return (
    <ShareCardFrame
      width={width}
      height={height}
      theme={theme}
      kicker="Weekly recap"
      contentStyle={{ padding: s(72) }}
    >
      <Text
        style={[
          styles.range,
          {
            fontSize: s(24),
            color: theme.mutedText,
            marginTop: s(18),
            fontFamily: fontFamily("body", fontsLoaded),
          },
        ]}
      >
        {safe.rangeLabel || "This week"}
      </Text>
      <Text
        style={[
          styles.hero,
          {
            fontSize: s(140),
            color: theme.text,
            marginTop: s(12),
            fontFamily: fontFamily("display", fontsLoaded),
          },
        ]}
      >
        {pct}%
      </Text>
      <Text
        style={[
          styles.heroLabel,
          {
            fontSize: s(20),
            color: theme.mutedText,
            fontFamily: fontFamily("data", fontsLoaded),
          },
        ]}
      >
        CONSISTENCY
      </Text>
      <Text
        style={[
          styles.bar,
          {
            fontSize: s(22),
            color: theme.text,
            marginTop: s(10),
            fontFamily: fontFamily("data", fontsLoaded),
          },
        ]}
      >
        {asciiBar(pct, 28, "+", ".")}
      </Text>

      <View style={[styles.stats, { marginTop: s(36), gap: s(10) }]}>
        <Text
          style={[
            styles.stat,
            {
              fontSize: s(22),
              color: theme.text,
              fontFamily: fontFamily("data", fontsLoaded),
            },
          ]}
        >
          {`COMPLETED  ${completed}`}
        </Text>
        <Text
          style={[
            styles.stat,
            {
              fontSize: s(22),
              color: theme.text,
              fontFamily: fontFamily("data", fontsLoaded),
            },
          ]}
        >
          {`MISSED  ${missed}`}
        </Text>
        <Text
          style={[
            styles.stat,
            {
              fontSize: s(22),
              color: theme.text,
              fontFamily: fontFamily("data", fontsLoaded),
            },
          ]}
        >
          {`TOTAL  ${total}`}
        </Text>
      </View>

      <View style={{ marginTop: s(36) }}>
        <Text
          style={[
            styles.section,
            {
              fontSize: s(18),
              color: theme.mutedText,
              fontFamily: fontFamily("data", fontsLoaded),
            },
          ]}
        >
          TOP HABITS
        </Text>
        {habits.length ? (
          habits.map((h, idx) => {
            const count = Number.isFinite(h.completedCount)
              ? h.completedCount
              : h.goodCount || 0;
            return (
              <Text
                key={`${h.title}-${idx}`}
                style={[
                  styles.habit,
                  {
                    fontSize: s(24),
                    color: theme.text,
                    marginTop: s(10),
                    fontFamily: fontFamily("display", fontsLoaded),
                  },
                ]}
                numberOfLines={1}
              >
                {`${String(idx + 1).padStart(2, "0")}   ${h.title}   ${count}`}
              </Text>
            );
          })
        ) : (
          <Text
            style={[
              styles.habit,
              {
                fontSize: s(22),
                color: theme.mutedText,
                marginTop: s(10),
                fontFamily: fontFamily("body", fontsLoaded),
              },
            ]}
          >
            No habits yet
          </Text>
        )}
      </View>
    </ShareCardFrame>
  );
}

const styles = StyleSheet.create({
  range: { fontWeight: "400" },
  hero: { fontWeight: "700", letterSpacing: 0.4, fontStyle: "normal" },
  heroLabel: { fontWeight: "600", letterSpacing: 2, marginTop: 4 },
  bar: { letterSpacing: 2 },
  stats: {},
  stat: { fontWeight: "600", letterSpacing: 1.6 },
  section: { fontWeight: "600", letterSpacing: 2 },
  habit: { fontWeight: "700", letterSpacing: 0.4, fontStyle: "normal" },
});
