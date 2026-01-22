// features/share/ShareCards.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";

function useScale(width) {
  const scale = width / 1080;
  const s = (n) => Math.round(n * scale);
  return { scale, s };
}

function CardShell({ title, subtitle, width, height, theme, watermarkOn, children }) {
  const { s } = useScale(width);
  return (
    <View
      style={[
        styles.card,
        {
          width,
          height,
          padding: s(48),
          backgroundColor: theme.bg,
          borderColor: theme.border,
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

      <View style={{ marginTop: s(24), flex: 1 }}>{children}</View>

      {watermarkOn && (
        <Text
          style={[
            styles.watermark,
            {
              fontSize: s(18),
              color: theme.mutedText,
              bottom: s(24),
              right: s(32),
            },
          ]}
        >
          Made with Yearly Tracker
        </Text>
      )}
    </View>
  );
}

function StatBox({ label, value, width, theme }) {
  const { s } = useScale(width);
  return (
    <View
      style={[
        styles.statBox,
        {
          paddingVertical: s(12),
          paddingHorizontal: s(14),
          borderRadius: s(18),
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <Text style={[styles.statValue, { fontSize: s(28), color: theme.text }]}>
        {value}
      </Text>
      <Text
        style={[styles.statLabel, { fontSize: s(18), color: theme.mutedText }]}
      >
        {label}
      </Text>
    </View>
  );
}

export function ShareWeeklyRecapCard({ data, width, height, theme, watermarkOn }) {
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

  return (
    <CardShell
      title="Weekly Recap"
      subtitle={safe.rangeLabel}
      width={width}
      height={height}
      theme={theme}
      watermarkOn={watermarkOn}
    >
      <View
        style={[
          styles.hero,
          {
            borderRadius: s(28),
            backgroundColor: theme.card,
            borderColor: theme.border,
            padding: s(24),
          },
        ]}
      >
        <Text style={[styles.heroValue, { fontSize: s(92), color: theme.text }]}>
          {safe.consistencyPct}%
        </Text>
        <Text
          style={[styles.heroLabel, { fontSize: s(22), color: theme.mutedText }]}
        >
          Consistency
        </Text>
      </View>

      <View style={[styles.statsRow, { marginTop: s(26), gap: s(12) }]}>
        <StatBox label="Total" value={safe.totalChecks} width={width} theme={theme} />
        <StatBox label="Good" value={safe.good} width={width} theme={theme} />
        <StatBox label="Bad" value={safe.bad} width={width} theme={theme} />
        <StatBox label="Missed" value={safe.missed} width={width} theme={theme} />
      </View>

      <View style={{ marginTop: s(26) }}>
        <Text
          style={[
            styles.sectionTitle,
            { fontSize: s(22), color: theme.text },
          ]}
        >
          Top habits
        </Text>
        {safe.topHabits.length ? (
          safe.topHabits.map((h, idx) => (
            <Text
              key={`${h.title}-${idx}`}
              style={[
                styles.listItem,
                { fontSize: s(20), color: theme.mutedText, marginTop: s(8) },
              ]}
            >
              {idx + 1}. {h.title} - {h.goodCount} good
            </Text>
          ))
        ) : (
          <Text
            style={[
              styles.listItem,
              { fontSize: s(20), color: theme.mutedText, marginTop: s(8) },
            ]}
          >
            No habits yet
          </Text>
        )}
      </View>
    </CardShell>
  );
}

export function ShareGoalProgressCard({
  data,
  width,
  height,
  theme,
  watermarkOn,
}) {
  const { s } = useScale(width);
  const safe = data || {
    title: "Select a goal",
    pct: 0,
    progress: 0,
    target: 0,
    type: "count",
    isComplete: false,
  };
  const progressLabel =
    safe.type === "count"
      ? `Progress: ${safe.progress}/${safe.target}`
      : safe.isComplete
        ? "Complete"
        : "In progress";

  return (
    <CardShell
      title="Goal Progress"
      subtitle={safe.title}
      width={width}
      height={height}
      theme={theme}
      watermarkOn={watermarkOn}
    >
      <View
        style={[
          styles.hero,
          {
            borderRadius: s(28),
            backgroundColor: theme.card,
            borderColor: theme.border,
            padding: s(24),
          },
        ]}
      >
        <Text style={[styles.heroValue, { fontSize: s(92), color: theme.text }]}>
          {safe.pct}%
        </Text>
        <Text
          style={[styles.heroLabel, { fontSize: s(22), color: theme.mutedText }]}
        >
          {progressLabel}
        </Text>
      </View>

      <View
        style={[
          styles.progressTrack,
          {
            marginTop: s(26),
            height: s(18),
            borderRadius: s(12),
            backgroundColor: theme.border,
          },
        ]}
      >
        <View
          style={{
            height: "100%",
            width: `${safe.pct}%`,
            backgroundColor: theme.primary,
            borderRadius: s(12),
          }}
        />
      </View>
    </CardShell>
  );
}

export function ShareHabitStreakCard({
  data,
  width,
  height,
  theme,
  watermarkOn,
}) {
  const { s } = useScale(width);
  const safe = data || { title: "Select a habit", streak: 0, last14: [] };

  return (
    <CardShell
      title="Habit Streak"
      subtitle={safe.title}
      width={width}
      height={height}
      theme={theme}
      watermarkOn={watermarkOn}
    >
      <View
        style={[
          styles.hero,
          {
            borderRadius: s(28),
            backgroundColor: theme.card,
            borderColor: theme.border,
            padding: s(24),
          },
        ]}
      >
        <Text style={[styles.heroValue, { fontSize: s(92), color: theme.text }]}>
          {safe.streak}
        </Text>
        <Text
          style={[styles.heroLabel, { fontSize: s(22), color: theme.mutedText }]}
        >
          Day streak
        </Text>
      </View>

      <Text
        style={[
          styles.sectionTitle,
          { fontSize: s(22), color: theme.text, marginTop: s(26) },
        ]}
      >
        Last 14 days
      </Text>
      <View style={[styles.streakRow, { gap: s(10), marginTop: s(14) }]}>
        {(safe.last14 || []).map((d) => {
          const bg =
            d.state === 1
              ? theme.primary
              : d.state === 2
                ? theme.danger
                : "transparent";
          return (
            <View
              key={d.key}
              style={{
                width: s(40),
                height: s(40),
                borderRadius: s(10),
                borderWidth: 2,
                borderColor: theme.border,
                backgroundColor: bg,
              }}
            />
          );
        })}
      </View>
    </CardShell>
  );
}

export function ShareYearSoFarCard({
  data,
  width,
  height,
  theme,
  watermarkOn,
}) {
  const { s } = useScale(width);
  const safe = data || {
    year: new Date().getFullYear(),
    goalsComplete: 0,
    avgProgress: 0,
    good: 0,
    bad: 0,
    missed: 0,
  };

  return (
    <CardShell
      title="Year So Far"
      subtitle={String(safe.year)}
      width={width}
      height={height}
      theme={theme}
      watermarkOn={watermarkOn}
    >
      <View style={[styles.statsRow, { gap: s(12) }]}>
        <StatBox label="Goals done" value={safe.goalsComplete} width={width} theme={theme} />
        <StatBox label="Avg progress" value={`${safe.avgProgress}%`} width={width} theme={theme} />
      </View>

      <View style={[styles.statsRow, { marginTop: s(24), gap: s(12) }]}>
        <StatBox label="Good" value={safe.good} width={width} theme={theme} />
        <StatBox label="Bad" value={safe.bad} width={width} theme={theme} />
        <StatBox label="Missed" value={safe.missed} width={width} theme={theme} />
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 40,
    overflow: "hidden",
  },
  title: { fontWeight: "900", letterSpacing: 0.4 },
  subtitle: { fontWeight: "700" },
  watermark: { position: "absolute", bottom: 24, right: 32, fontWeight: "700" },
  hero: { borderWidth: 1 },
  heroValue: { fontWeight: "900", letterSpacing: 0.6 },
  heroLabel: { fontWeight: "700" },
  statsRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  statBox: { borderWidth: 1, minWidth: 150 },
  statValue: { fontWeight: "900" },
  statLabel: { fontWeight: "700" },
  sectionTitle: { fontWeight: "900", letterSpacing: 0.2 },
  listItem: { fontWeight: "700" },
  progressTrack: { overflow: "hidden" },
  streakRow: { flexDirection: "row", flexWrap: "wrap" },
});
