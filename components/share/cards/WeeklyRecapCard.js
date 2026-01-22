// components/share/cards/WeeklyRecapCard.js

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { ShareCardFrame, useScale, hexToRgba } from "../weeklyRecapFrame";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function ProgressRing({ size, strokeWidth, pct, theme }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = clamp(pct, 0, 100);
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={hexToRgba(theme.text, 0.2)}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={theme.primary}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        fill="none"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

function StatChip({ icon, label, value, width, theme, tint }) {
  const { s } = useScale(width);
  return (
    <View
      style={[
        styles.statChip,
        {
          paddingVertical: s(10),
          paddingHorizontal: s(14),
          borderRadius: s(18),
          backgroundColor: hexToRgba(theme.card, 0.72),
          borderColor: hexToRgba(theme.border, 0.6),
        },
      ]}
    >
      <Ionicons name={icon} size={s(18)} color={tint} />
      <Text
        style={[
          styles.statValue,
          { fontSize: s(22), color: theme.text, marginLeft: s(8) },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          { fontSize: s(16), color: theme.mutedText, marginLeft: s(6) },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function ShareWeeklyRecapCard({ data, width, height, theme }) {
  const { s } = useScale(width);
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
  const ringSize = s(300);
  const ringStroke = s(18);
  const habits = (safe.topHabits || []).slice(0, 4);

  return (
    <ShareCardFrame
      width={width}
      height={height}
      theme={theme}
      contentStyle={{ padding: s(42) }}
    >
      <View
        style={[
          styles.content,
          {
            borderRadius: s(36),
            padding: s(28),
            backgroundColor: hexToRgba(theme.card, 0.78),
            borderColor: hexToRgba(theme.border, 0.5),
            shadowColor: "#000",
            shadowOpacity: 0.16,
            shadowRadius: s(16),
            shadowOffset: { width: 0, height: s(8) },
            elevation: Platform.OS === "android" ? s(4) : 0,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { fontSize: s(36), color: theme.text }]}>
            Weekly Recap
          </Text>
          <Text
            style={[
              styles.subtitle,
              { fontSize: s(20), color: theme.mutedText, marginTop: s(6) },
            ]}
          >
            {safe.rangeLabel || "This week"}
          </Text>
        </View>

        <View style={[styles.heroWrap, { marginTop: s(14) }]}>
          <View
            style={[
              styles.heroCard,
              {
                width: ringSize + s(28),
                height: ringSize + s(28),
                borderRadius: s(32),
                backgroundColor: hexToRgba(theme.card, 0.9),
                shadowColor: "#000",
                shadowOpacity: 0.18,
                shadowRadius: s(16),
                shadowOffset: { width: 0, height: s(8) },
                elevation: Platform.OS === "android" ? s(5) : 0,
              },
            ]}
          >
            <ProgressRing
              size={ringSize}
              strokeWidth={ringStroke}
              pct={pct}
              theme={theme}
            />
            <View
              style={[styles.heroCenter, { width: ringSize, height: ringSize }]}
            >
              <Text
                style={[
                  styles.heroValue,
                  { fontSize: s(82), color: theme.text },
                ]}
              >
                {pct}%
              </Text>
              <Text
                style={[
                  styles.heroLabel,
                  { fontSize: s(18), color: theme.mutedText, marginTop: s(6) },
                ]}
              >
                Consistency
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.statsRow, { marginTop: s(18), gap: s(10) }]}>
          <StatChip
            icon="checkmark-circle"
            label="Completed"
            value={completed}
            width={width}
            theme={theme}
            tint={theme.primary}
          />
          <StatChip
            icon="remove-circle"
            label="Missed"
            value={missed}
            width={width}
            theme={theme}
            tint={hexToRgba(theme.text, 0.7)}
          />
          <StatChip
            icon="analytics"
            label="Total"
            value={total}
            width={width}
            theme={theme}
            tint={hexToRgba(theme.text, 0.8)}
          />
        </View>

        <View style={{ marginTop: s(18) }}>
          <Text
            style={[
              styles.sectionTitle,
              { fontSize: s(20), color: theme.text },
            ]}
          >
            Top habits
          </Text>
          <View style={[styles.habitRow, { gap: s(10), marginTop: s(12) }]}>
            {habits.length ? (
              habits.map((h, idx) => {
                const count = Number.isFinite(h.completedCount)
                  ? h.completedCount
                  : h.goodCount || 0;
                return (
                  <View
                    key={`${h.title}-${idx}`}
                    style={[
                      styles.habitChip,
                      {
                        borderRadius: s(18),
                        paddingVertical: s(8),
                        paddingHorizontal: s(12),
                        backgroundColor: hexToRgba(theme.card, 0.82),
                        borderColor: hexToRgba(theme.border, 0.55),
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.habitDot,
                        {
                          width: s(8),
                          height: s(8),
                          borderRadius: s(4),
                          backgroundColor: theme.primary,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.habitText,
                        {
                          fontSize: s(18),
                          color: theme.text,
                          marginLeft: s(8),
                          maxWidth: s(260),
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {h.title}
                    </Text>
                    <View
                      style={[
                        styles.habitCount,
                        {
                          marginLeft: s(8),
                          paddingHorizontal: s(8),
                          paddingVertical: s(4),
                          borderRadius: s(12),
                          backgroundColor: hexToRgba(theme.primary, 0.12),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.habitCountText,
                          { fontSize: s(14), color: theme.text },
                        ]}
                      >
                        {count} done
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View
                style={[
                  styles.emptyChip,
                  {
                    borderRadius: s(18),
                    paddingVertical: s(8),
                    paddingHorizontal: s(12),
                    backgroundColor: hexToRgba(theme.card, 0.82),
                    borderColor: hexToRgba(theme.border, 0.55),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emptyText,
                    { fontSize: s(18), color: theme.mutedText },
                  ]}
                >
                  No habits yet
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ShareCardFrame>
  );
}

const styles = StyleSheet.create({
  content: { borderWidth: 1 },
  headerRow: {
    alignItems: "flex-start",
  },
  title: { fontWeight: "900", letterSpacing: 0.4 },
  subtitle: { fontWeight: "700" },
  heroWrap: { alignItems: "center" },
  heroCard: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  heroValue: { fontWeight: "900", letterSpacing: 0.6 },
  heroLabel: { fontWeight: "700" },
  statsRow: { flexDirection: "row", flexWrap: "wrap" },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: { fontWeight: "800" },
  statLabel: { fontWeight: "700" },
  sectionTitle: { fontWeight: "900", letterSpacing: 0.2 },
  habitRow: { flexDirection: "row", flexWrap: "wrap" },
  habitChip: { flexDirection: "row", alignItems: "center", borderWidth: 1 },
  habitDot: { marginRight: 0 },
  habitText: { fontWeight: "700" },
  habitCount: {},
  habitCountText: { fontWeight: "700" },
  emptyChip: { borderWidth: 1 },
  emptyText: { fontWeight: "700" },
});
