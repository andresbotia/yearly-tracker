// features/share/ShareCards.js

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ShareCardFrame,
  useScale,
  hexToRgba,
} from "../../components/share/ShareCardFrame";
import { ShareWeeklyRecapCard } from "../../components/share/cards/WeeklyRecapCard";

function CardShell({ title, subtitle, width, height, theme, children }) {
  const { s } = useScale(width);
  const surfaceBg = hexToRgba(theme.card, 0.42);

  return (
    <ShareCardFrame
      width={width}
      height={height}
      theme={theme}
      // important: don't stretch children vertically
      contentStyle={{
        padding: s(32),
        justifyContent: "flex-start",
        alignItems: "stretch",
      }}
    >
      <View
        style={[
          styles.surface,
          {
            // important: let the surface hug content
            alignSelf: "stretch",
            borderRadius: s(30),
            padding: s(26),
            backgroundColor: surfaceBg,
            borderColor: hexToRgba(theme.border, 0.6),
          },
        ]}
      >
        <Text style={[styles.title, { fontSize: s(40), color: theme.text }]}>
          {title}
        </Text>

        {!!subtitle && (
          <Text
            style={[
              styles.subtitle,
              { fontSize: s(22), color: theme.mutedText, marginTop: s(10) },
            ]}
          >
            {subtitle}
          </Text>
        )}

        {/* important: do NOT flex:1 */}
        <View style={{ marginTop: s(16) }}>{children}</View>
      </View>
    </ShareCardFrame>
  );
}

function InfoChip({ icon, label, value, width, theme, tint }) {
  const { s } = useScale(width);
  return (
    <View
      style={[
        styles.infoChip,
        {
          borderRadius: s(18),
          paddingVertical: s(10),
          paddingHorizontal: s(14),
          backgroundColor: hexToRgba(theme.card, 0.72),
          borderColor: hexToRgba(theme.border, 0.6),
        },
      ]}
    >
      <Ionicons name={icon} size={s(18)} color={tint || theme.primary} />
      <View style={{ marginLeft: s(8) }}>
        <Text
          style={[styles.infoValue, { fontSize: s(18), color: theme.text }]}
        >
          {value}
        </Text>
        <Text
          style={[
            styles.infoLabel,
            { fontSize: s(14), color: theme.mutedText },
          ]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

export { ShareWeeklyRecapCard };

export function ShareGoalProgressCard({ data, width, height, theme }) {
  const { s } = useScale(width);
  const safe = data || {
    title: "Select a goal",
    pct: 0,
    progress: 0,
    target: 0,
    type: "count",
    isComplete: false,
  };
  const pct = Math.max(0, Math.min(100, Math.round(safe.pct || 0)));
  const progressValue =
    safe.type === "count"
      ? `${safe.progress}/${safe.target}`
      : safe.isComplete
        ? "Done"
        : "Not yet";
  const statusText = safe.isComplete ? "Complete" : "In progress";

  return (
    <CardShell
      title="Goal Progress"
      subtitle={safe.title}
      width={width}
      height={height}
      theme={theme}
    >
      <View style={styles.goalHeroRow}>
        <View>
          <Text
            style={[styles.heroValue, { fontSize: s(92), color: theme.text }]}
          >
            {pct}%
          </Text>
          <Text
            style={[
              styles.heroLabel,
              { fontSize: s(18), color: theme.mutedText },
            ]}
          >
            Goal completion
          </Text>
        </View>
        <View
          style={[
            styles.goalBadge,
            {
              borderRadius: s(16),
              paddingVertical: s(8),
              paddingHorizontal: s(12),
              backgroundColor: hexToRgba(theme.card, 0.86),
              borderColor: hexToRgba(theme.border, 0.6),
              shadowColor: "#000",
              shadowOpacity: 0.16,
              shadowRadius: s(10),
              shadowOffset: { width: 0, height: s(6) },
              elevation: Platform.OS === "android" ? s(4) : 0,
            },
          ]}
        >
          <Ionicons
            name={safe.isComplete ? "trophy" : "trending-up"}
            size={s(18)}
            color={theme.primary}
          />
          <Text
            style={[
              styles.goalBadgeText,
              { fontSize: s(14), color: theme.text, marginLeft: s(6) },
            ]}
          >
            {statusText}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.progressTrack,
          {
            marginTop: s(16),
            height: s(16),
            borderRadius: s(12),
            backgroundColor: hexToRgba(theme.border, 0.85),
            borderColor: hexToRgba(theme.border, 0.6),
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              height: "100%",
              width: `${pct}%`,
              backgroundColor: theme.primary,
              borderRadius: s(12),
            },
          ]}
        >
          <View style={styles.progressHighlight} />
        </View>
      </View>

      <View style={[styles.chipRow, { marginTop: s(16), gap: s(10) }]}>
        <InfoChip
          icon="analytics"
          label="Progress"
          value={progressValue}
          width={width}
          theme={theme}
          tint={theme.primary}
        />
        <InfoChip
          icon={safe.isComplete ? "checkmark-circle" : "time"}
          label="Status"
          value={statusText}
          width={width}
          theme={theme}
          tint={hexToRgba(theme.text, 0.7)}
        />
      </View>
    </CardShell>
  );
}

export function ShareHabitStreakCard({ data, width, height, theme }) {
  const { s } = useScale(width);
  const safe = data || { title: "Select a habit", streak: 0, last14: [] };

  return (
    <CardShell
      title="Habit Streak"
      subtitle={safe.title}
      width={width}
      height={height}
      theme={theme}
    >
      <View
        style={[
          styles.hero,
          {
            borderRadius: s(24),
            backgroundColor: hexToRgba(theme.card, 0.9),
            borderColor: hexToRgba(theme.border, 0.6),
            padding: s(20),
            shadowColor: "#000",
            shadowOpacity: 0.14,
            shadowRadius: s(12),
            shadowOffset: { width: 0, height: s(6) },
            elevation: Platform.OS === "android" ? s(4) : 0,
          },
        ]}
      >
        <Text
          style={[styles.heroValue, { fontSize: s(86), color: theme.text }]}
        >
          {safe.streak}
        </Text>
        <Text
          style={[
            styles.heroLabel,
            { fontSize: s(18), color: theme.mutedText },
          ]}
        >
          Day streak
        </Text>
      </View>

      <Text
        style={[
          styles.sectionTitle,
          { fontSize: s(20), color: theme.text, marginTop: s(16) },
        ]}
      >
        Last 14 days
      </Text>
      <View style={[styles.streakRow, { gap: s(8), marginTop: s(12) }]}>
        {(safe.last14 || []).map((d) => {
          const isComplete = d.state === 1 || d.state === 2;
          const bg = isComplete ? theme.primary : "transparent";
          const border = isComplete
            ? hexToRgba(theme.primary, 0.4)
            : hexToRgba(theme.border, 0.9);
          return (
            <View
              key={d.key}
              style={{
                width: s(34),
                height: s(34),
                borderRadius: s(10),
                borderWidth: 2,
                borderColor: border,
                backgroundColor: bg,
              }}
            />
          );
        })}
      </View>
      <View style={[styles.legendRow, { marginTop: s(10), gap: s(12) }]}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
          />
          <Text style={[styles.legendText, { color: theme.mutedText }]}>
            Completed
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: "transparent", borderColor: theme.border },
            ]}
          />
          <Text style={[styles.legendText, { color: theme.mutedText }]}>
            Missed
          </Text>
        </View>
      </View>
    </CardShell>
  );
}

export function ShareYearSoFarCard({ data, width, height, theme }) {
  const { s } = useScale(width);
  const safe = data || {
    year: new Date().getFullYear(),
    goalsComplete: 0,
    avgProgress: 0,
    good: 0,
    bad: 0,
    missed: 0,
  };
  const completed = (safe.good || 0) + (safe.bad || 0);
  const missed = safe.missed || 0;
  const total = completed + missed;
  const showTotal = total > 0;

  return (
    <CardShell
      title="Year So Far"
      subtitle={String(safe.year)}
      width={width}
      height={height}
      theme={theme}
    >
      <View
        style={[
          styles.hero,
          {
            borderRadius: s(24),
            backgroundColor: hexToRgba(theme.card, 0.9),
            borderColor: hexToRgba(theme.border, 0.6),
            padding: s(20),
            shadowColor: "#000",
            shadowOpacity: 0.14,
            shadowRadius: s(12),
            shadowOffset: { width: 0, height: s(6) },
            elevation: Platform.OS === "android" ? s(4) : 0,
          },
        ]}
      >
        <Text
          style={[styles.heroValue, { fontSize: s(86), color: theme.text }]}
        >
          {safe.avgProgress}%
        </Text>
        <Text
          style={[
            styles.heroLabel,
            { fontSize: s(18), color: theme.mutedText },
          ]}
        >
          Avg progress
        </Text>
      </View>

      <View style={[styles.chipRow, { marginTop: s(16), gap: s(10) }]}>
        <InfoChip
          icon="trophy"
          label="Goals done"
          value={safe.goalsComplete}
          width={width}
          theme={theme}
          tint={theme.primary}
        />
        <InfoChip
          icon="checkmark-circle"
          label="Completed"
          value={completed}
          width={width}
          theme={theme}
          tint={hexToRgba(theme.text, 0.7)}
        />
        <InfoChip
          icon="remove-circle"
          label="Missed"
          value={missed}
          width={width}
          theme={theme}
          tint={hexToRgba(theme.text, 0.7)}
        />
        {showTotal && (
          <InfoChip
            icon="analytics"
            label="Total"
            value={total}
            width={width}
            theme={theme}
            tint={hexToRgba(theme.text, 0.7)}
          />
        )}
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  surface: { borderWidth: 1, alignSelf: "stretch" },
  title: { fontWeight: "900", letterSpacing: 0.4 },
  subtitle: { fontWeight: "700" },
  hero: { borderWidth: 1 },
  heroValue: { fontWeight: "900", letterSpacing: 0.6 },
  heroLabel: { fontWeight: "700" },
  sectionTitle: { fontWeight: "900", letterSpacing: 0.2 },
  progressTrack: { overflow: "hidden", borderWidth: 1 },
  progressFill: { justifyContent: "center" },
  progressHighlight: {
    height: 2,
    marginHorizontal: 6,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  streakRow: { flexDirection: "row", flexWrap: "wrap" },
  legendRow: { flexDirection: "row", alignItems: "center" },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 6,
  },
  legendText: { fontSize: 12, fontWeight: "700" },
  goalHeroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  goalBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  goalBadgeText: { fontWeight: "800", letterSpacing: 0.2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  infoValue: { fontWeight: "800" },
  infoLabel: { fontWeight: "700" },
});
