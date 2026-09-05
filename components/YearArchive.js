// Year Archive — 365-day accession sheet from existing habit checks.
// Presentation only. No new storage.

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SPACE, TYPE_SIZE, TYPE_TRACK, MOTION, fontFamily } from "../utils/tokens";
import { useFontsLoaded } from "../utils/fonts";
import { hapticTick, useReducedMotion } from "../utils/motion";
import { buildYearArchive, dayLedger } from "../utils/yearArchive";
import MetadataLabel from "./editorial/MetadataLabel";
import EditorialEmpty from "./editorial/EditorialEmpty";
import EditorialSurface from "./editorial/EditorialSurface";
import SectionRule from "./editorial/SectionRule";
import AtelierDrawer from "./atelier/AtelierDrawer";
import PressableInk from "./motion/PressableInk";

function formatDayTitle(key) {
  const [y, m, d] = String(key).split("-").map(Number);
  if (!y || !m || !d) return key;
  const dt = new Date(y, m - 1, d);
  const month = dt.toLocaleString(undefined, { month: "long" }).toUpperCase();
  return `${String(d).padStart(2, "0")}  ${month}  ${y}`;
}

export default function YearArchive({
  theme,
  habits,
  year,
  todayDate,
  onBack,
}) {
  const fontsLoaded = useFontsLoaded();
  const reduced = useReducedMotion();
  const archive = useMemo(
    () => buildYearArchive(habits, year, todayDate),
    [habits, year, todayDate],
  );
  const [selectedKey, setSelectedKey] = useState(null);
  const reveal = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    reveal.value = reduced
      ? 1
      : withTiming(1, {
          duration: MOTION.reveal,
          easing: Easing.out(Easing.cubic),
        });
  }, [reduced, reveal, year]);

  const revealStyle = useAnimatedStyle(() => ({
    opacity: 0.28 + 0.72 * reveal.value,
    transform: [{ translateY: reduced ? 0 : (1 - reveal.value) * 10 }],
  }));

  const ink = theme.text;
  const muted = theme.mutedText;
  const selectedLedger = selectedKey ? dayLedger(habits, selectedKey) : [];

  return (
    <View>
      <EditorialSurface theme={theme} style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
              {`${year}  /  ARCHIVE`}
            </MetadataLabel>
            <Text
              style={[
                styles.title,
                { color: ink, fontFamily: fontFamily("display", fontsLoaded) },
              ]}
            >
              Year archive
            </Text>
          </View>
          <PressableInk
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to habit history"
            style={[styles.backBtn, { borderColor: ink }]}
          >
            <Text
              style={[
                styles.backText,
                { color: ink, fontFamily: fontFamily("data", fontsLoaded) },
              ]}
            >
              Back
            </Text>
          </PressableInk>
        </View>
        <Text
          style={[
            styles.sub,
            { color: muted, fontFamily: fontFamily("data", fontsLoaded) },
          ]}
        >
          . empty   + logged good   × more bad than good
        </Text>
      </EditorialSurface>

      <SectionRule theme={theme} />

      {habits.length === 0 || archive.months.length === 0 ? (
        <EditorialEmpty
          theme={theme}
          kicker="Archive"
          title="No year yet"
          body="Add a habit to start this year's accession sheet."
        />
      ) : (
        <Animated.View style={revealStyle}>
          <Text
            style={[
              styles.ruler,
              { color: muted, fontFamily: fontFamily("data", fontsLoaded) },
            ]}
          >
            {"     "}01        10        20        31
          </Text>
          {archive.months.map((month) => (
            <Pressable
              key={month.short}
              onPress={(e) => {
                const x = e.nativeEvent.locationX;
                const labelW = 36;
                const charW = 7.2;
                const idx = Math.floor((x - labelW) / charW);
                if (idx < 0 || idx >= month.days.length) return;
                const day = month.days[idx];
                if (!day || day.future) return;
                hapticTick();
                setSelectedKey(day.key);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${month.label} ${year} archive row`}
              style={styles.monthRow}
            >
              <Text
                style={[
                  styles.monthLabel,
                  {
                    color: muted,
                    fontFamily: fontFamily("data", fontsLoaded),
                  },
                ]}
              >
                {month.short}
              </Text>
              <Text
                style={[
                  styles.monthLine,
                  {
                    color: ink,
                    fontFamily: fontFamily("data", fontsLoaded),
                  },
                ]}
                numberOfLines={1}
              >
                {month.days
                  .map((d) => (d.future ? " " : d.mark))
                  .join("")}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      )}

      <AtelierDrawer
        visible={!!selectedKey}
        onClose={() => setSelectedKey(null)}
        theme={theme}
        kicker="[YT]  /  DAY"
        title={selectedKey ? formatDayTitle(selectedKey) : ""}
      >
        {selectedLedger.length === 0 ? (
          <Text
            style={[
              styles.emptyDay,
              { color: muted, fontFamily: fontFamily("body", fontsLoaded) },
            ]}
          >
            No habits on this date.
          </Text>
        ) : (
          selectedLedger.map((row) => (
            <View key={row.id} style={[styles.ledgerRow, { borderBottomColor: theme.border }]}>
              <Text
                style={[
                  styles.ledgerTitle,
                  {
                    color: ink,
                    fontFamily: fontFamily("display", fontsLoaded),
                  },
                ]}
                numberOfLines={2}
              >
                {String(row.title || "").toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.ledgerMark,
                  {
                    color:
                      row.value === 1
                        ? theme.primary
                        : row.value === 2
                          ? theme.danger
                          : muted,
                    fontFamily: fontFamily("data", fontsLoaded),
                  },
                ]}
              >
                {row.char}
              </Text>
            </View>
          ))
        )}
      </AtelierDrawer>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: SPACE.xs, gap: SPACE["2xs"] },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPACE.sm,
  },
  titleCol: { flex: 1, minWidth: 0, gap: SPACE["3xs"] },
  title: {
    fontSize: TYPE_SIZE.bodyLg,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  sub: {
    marginTop: SPACE["3xs"],
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.data,
    textTransform: "uppercase",
  },
  backBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: SPACE.xs,
    paddingHorizontal: SPACE.sm,
    minHeight: 36,
    justifyContent: "center",
  },
  backText: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  ruler: {
    marginTop: SPACE.sm,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
    gap: SPACE.xs,
  },
  monthLabel: {
    width: 32,
    fontSize: TYPE_SIZE.kicker,
    letterSpacing: TYPE_TRACK.data,
  },
  monthLine: {
    flex: 1,
    fontSize: 11,
    letterSpacing: 0.6,
    ...Platform.select({
      android: { includeFontPadding: false },
    }),
  },
  emptyDay: {
    fontSize: TYPE_SIZE.body,
  },
  ledgerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: SPACE.sm,
  },
  ledgerTitle: {
    flex: 1,
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
  },
  ledgerMark: {
    width: 24,
    textAlign: "right",
    fontSize: TYPE_SIZE.bodyLg,
  },
});
