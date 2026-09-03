// features/share/ShareCards.js
// Presentation only. Share data calculations live in shareData.js.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  ShareCardFrame,
  useScale,
} from "../../components/share/ShareCardFrame";
import { ShareWeeklyRecapCard } from "../../components/share/cards/WeeklyRecapCard";
import { asciiBar } from "../../components/editorial/EditorialProgress";
import { habitStateChar } from "../../utils/habitAscii";
import { fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";

function PosterShell({
  title,
  subtitle,
  width,
  height,
  theme,
  kicker,
  children,
}) {
  const { s } = useScale(width);
  const fontsLoaded = useFontsLoaded();

  return (
    <ShareCardFrame
      width={width}
      height={height}
      theme={theme}
      kicker={kicker || "Atelier Tracker"}
      contentStyle={{
        padding: s(72),
        justifyContent: "flex-start",
        alignItems: "stretch",
      }}
    >
      <Text
        style={[
          styles.title,
          {
            fontSize: s(56),
            color: theme.text,
            fontFamily: fontFamily("display", fontsLoaded),
            marginTop: s(18),
          },
        ]}
      >
        {String(title || "").toUpperCase()}
      </Text>
      {!!subtitle && (
        <Text
          style={[
            styles.subtitle,
            {
              fontSize: s(24),
              color: theme.mutedText,
              marginTop: s(10),
              fontFamily: fontFamily("body", fontsLoaded),
            },
          ]}
        >
          {subtitle}
        </Text>
      )}
      <View style={{ marginTop: s(28) }}>{children}</View>
    </ShareCardFrame>
  );
}

function MetaLine({ label, value, width, theme }) {
  const { s } = useScale(width);
  const fontsLoaded = useFontsLoaded();
  return (
    <View style={[styles.metaRow, { borderBottomColor: theme.border }]}>
      <Text
        style={[
          styles.metaLabel,
          {
            fontSize: s(18),
            color: theme.mutedText,
            fontFamily: fontFamily("data", fontsLoaded),
          },
        ]}
      >
        {String(label).toUpperCase()}
      </Text>
      <Text
        style={[
          styles.metaValue,
          {
            fontSize: s(22),
            color: theme.text,
            fontFamily: fontFamily("display", fontsLoaded),
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export { ShareWeeklyRecapCard };

export function ShareGoalProgressCard({ data, width, height, theme }) {
  const { s } = useScale(width);
  const fontsLoaded = useFontsLoaded();
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
      ? `${safe.progress} / ${safe.target}`
      : safe.isComplete
        ? "Complete"
        : "Incomplete";

  return (
    <PosterShell
      title={safe.title}
      subtitle="Goal progress"
      width={width}
      height={height}
      theme={theme}
      kicker="Catalogue"
    >
      <Text
        style={[
          styles.hero,
          {
            fontSize: s(140),
            color: theme.text,
            fontFamily: fontFamily("display", fontsLoaded),
          },
        ]}
      >
        {pct}%
      </Text>
      <Text
        style={[
          styles.bar,
          {
            fontSize: s(22),
            color: theme.text,
            fontFamily: fontFamily("data", fontsLoaded),
            marginTop: s(8),
          },
        ]}
      >
        {asciiBar(pct, 28, "+", ".")}
      </Text>
      <View style={{ marginTop: s(28), gap: s(12) }}>
        <MetaLine
          label="Progress"
          value={progressValue}
          width={width}
          theme={theme}
        />
        <MetaLine
          label="Status"
          value={safe.isComplete ? "Complete" : "In progress"}
          width={width}
          theme={theme}
        />
      </View>
    </PosterShell>
  );
}

export function ShareHabitStreakCard({ data, width, height, theme }) {
  const { s } = useScale(width);
  const fontsLoaded = useFontsLoaded();
  const safe = data || { title: "Select a habit", streak: 0, last14: [] };
  const ledger = (safe.last14 || [])
    .map((d) => habitStateChar(d.state))
    .join(" ");

  return (
    <PosterShell
      title={safe.title}
      subtitle="Habit streak"
      width={width}
      height={height}
      theme={theme}
      kicker="Ledger"
    >
      <Text
        style={[
          styles.hero,
          {
            fontSize: s(140),
            color: theme.text,
            fontFamily: fontFamily("display", fontsLoaded),
          },
        ]}
      >
        {safe.streak}
      </Text>
      <Text
        style={[
          styles.heroLabel,
          {
            fontSize: s(22),
            color: theme.mutedText,
            fontFamily: fontFamily("data", fontsLoaded),
          },
        ]}
      >
        DAY STREAK
      </Text>
      <Text
        style={[
          styles.section,
          {
            fontSize: s(18),
            color: theme.mutedText,
            marginTop: s(36),
            fontFamily: fontFamily("data", fontsLoaded),
          },
        ]}
      >
        LAST 14 DAYS
      </Text>
      <Text
        style={[
          styles.ledger,
          {
            fontSize: s(28),
            color: theme.text,
            marginTop: s(12),
            fontFamily: fontFamily("data", fontsLoaded),
          },
        ]}
      >
        {ledger || ". . . . . . . . . . . . . ."}
      </Text>
      <Text
        style={[
          styles.legend,
          {
            fontSize: s(16),
            color: theme.mutedText,
            marginTop: s(16),
            fontFamily: fontFamily("data", fontsLoaded),
          },
        ]}
      >
        . empty    + good    × bad
      </Text>
    </PosterShell>
  );
}

export function ShareYearSoFarCard({ data, width, height, theme }) {
  const { s } = useScale(width);
  const fontsLoaded = useFontsLoaded();
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
  const pct = Math.max(0, Math.min(100, Math.round(safe.avgProgress || 0)));

  return (
    <PosterShell
      title={String(safe.year)}
      subtitle="Year so far"
      width={width}
      height={height}
      theme={theme}
      kicker="Annual"
    >
      <Text
        style={[
          styles.hero,
          {
            fontSize: s(140),
            color: theme.text,
            fontFamily: fontFamily("display", fontsLoaded),
          },
        ]}
      >
        {pct}%
      </Text>
      <Text
        style={[
          styles.bar,
          {
            fontSize: s(22),
            color: theme.text,
            fontFamily: fontFamily("data", fontsLoaded),
            marginTop: s(8),
          },
        ]}
      >
        {asciiBar(pct, 28, "+", ".")}
      </Text>
      <View style={{ marginTop: s(32), gap: s(12) }}>
        <MetaLine
          label="Goals done"
          value={safe.goalsComplete}
          width={width}
          theme={theme}
        />
        <MetaLine
          label="Checks"
          value={completed}
          width={width}
          theme={theme}
        />
        <MetaLine label="Missed" value={missed} width={width} theme={theme} />
      </View>
    </PosterShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "700",
    letterSpacing: 0.4,
    fontStyle: "normal",
  },
  subtitle: { fontWeight: "400" },
  hero: { fontWeight: "700", letterSpacing: 0.4, fontStyle: "normal" },
  heroLabel: { fontWeight: "600", letterSpacing: 2, marginTop: 4 },
  bar: { letterSpacing: 2 },
  section: { fontWeight: "600", letterSpacing: 2 },
  ledger: { letterSpacing: 4 },
  legend: { letterSpacing: 1.4 },
  metaRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(28,25,22,0.18)",
    paddingBottom: 8,
  },
  metaLabel: { fontWeight: "600", letterSpacing: 1.6 },
  metaValue: { fontWeight: "700", fontStyle: "normal" },
});
