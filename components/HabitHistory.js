// components/HabitHistory.js
// Presentation-only redesign. Month/year math and stored checks are unchanged.

import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../utils/tokens";
import { habitStateChar, habitStateLabel } from "../utils/habitAscii";
import { useFontsLoaded } from "../utils/fonts";
import MetadataLabel from "./editorial/MetadataLabel";
import EditorialEmpty from "./editorial/EditorialEmpty";
import SectionRule from "./editorial/SectionRule";
import EditorialSurface from "./editorial/EditorialSurface";

const ANDROID = Platform.OS === "android";

const HISTORY_SQUARE = 22;
const HISTORY_LABEL_W = 150;
const HISTORY_LABEL_GAP = 12;
const HISTORY_ROW_HEIGHT = 44;
const HISTORY_ROW_GAP = 4;
const HISTORY_CELL_GAP = 4;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dateKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthDays(year, monthIndex) {
  const out = [];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(year, monthIndex, day);
    out.push({
      key: dateKey(dt),
      num: day,
    });
  }
  return out;
}

export default function HabitHistory({
  theme,
  habits,
  historyYear,
  onBack,
  todayDate,
}) {
  const fontsLoaded = useFontsLoaded();
  const todayYear = todayDate.getFullYear();
  const todayMonth = todayDate.getMonth();
  const currentMonthScrollRef = useRef(null);
  const didScrollRef = useRef(false);

  const months = useMemo(() => {
    if (historyYear > todayYear) return [];
    const maxMonth = historyYear < todayYear ? 11 : todayMonth;
    const out = [];
    for (let m = maxMonth; m >= 0; m -= 1) {
      const days = monthDays(historyYear, m);
      const label = new Date(historyYear, m, 1).toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      });
      out.push({ monthIndex: m, days, label });
    }
    return out;
  }, [historyYear, todayYear, todayMonth]);

  useEffect(() => {
    if (didScrollRef.current) return;
    if (historyYear !== todayYear) return;
    const ref = currentMonthScrollRef.current;
    if (!ref) return;

    const dayStride = HISTORY_SQUARE + HISTORY_CELL_GAP;
    const today = todayDate.getDate();
    const startDay = Math.max(1, today - 3);
    const x = Math.max(0, (startDay - 1) * dayStride);

    requestAnimationFrame(() => {
      ref.scrollTo({ x, y: 0, animated: false });
      didScrollRef.current = true;
    });
  }, [historyYear, todayYear, todayDate]);

  const ink = theme.text;
  const muted = theme.mutedText;

  return (
    <View>
      <EditorialSurface theme={theme} style={styles.historyHeader}>
        <View style={[styles.historyTitleRow, ANDROID && styles.noGap]}>
          <View style={styles.historyTitleCol}>
            <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
              {`ARCHIVE  /  ${historyYear}`}
            </MetadataLabel>
            <Text
              style={[
                styles.historyTitle,
                { color: ink, fontFamily: fontFamily("display", fontsLoaded) },
              ]}
            >
              Habit history
            </Text>
          </View>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.historyBackBtn,
              {
                borderColor: theme.text,
                opacity: pressed ? 0.65 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Back to habits"
          >
            <Text
              style={[
                styles.historyBackText,
                {
                  color: ink,
                  fontFamily: fontFamily("data", fontsLoaded),
                },
              ]}
            >
              Back
            </Text>
          </Pressable>
        </View>
        <Text
          style={[
            styles.historySub,
            { color: muted, fontFamily: fontFamily("data", fontsLoaded) },
          ]}
        >
          . empty   + good   × bad
        </Text>
      </EditorialSurface>

      <SectionRule theme={theme} />

      {habits.length === 0 || months.length === 0 ? (
        <EditorialEmpty
          theme={theme}
          kicker="Ledger"
          title="No habits yet"
          body="Add a habit to start seeing your monthly archive."
        />
      ) : (
        <View style={styles.monthsStack}>
          {months.map((month, monthIdx) => {
            const isCurrentMonth =
              historyYear === todayYear && month.monthIndex === todayMonth;
            const indexLabel = String(months.length - monthIdx).padStart(
              2,
              "0",
            );

            return (
              <View key={month.label} style={styles.monthSection}>
                <View style={styles.monthHeaderRow}>
                  <Text
                    style={[
                      styles.monthIndex,
                      {
                        color: muted,
                        fontFamily: fontFamily("data", fontsLoaded),
                      },
                    ]}
                  >
                    {indexLabel}
                  </Text>
                  <Text
                    style={[
                      styles.monthTitle,
                      {
                        color: ink,
                        fontFamily: fontFamily("display", fontsLoaded),
                      },
                    ]}
                  >
                    {month.label}
                  </Text>
                  <Text
                    style={[
                      styles.monthMeta,
                      {
                        color: muted,
                        fontFamily: fontFamily("data", fontsLoaded),
                      },
                    ]}
                  >
                    {`${month.days.length} DAYS`}
                  </Text>
                </View>

                <View style={styles.historyGrid}>
                  <View
                    style={[
                      styles.historyLabelCol,
                      {
                        width: HISTORY_LABEL_W,
                        paddingRight: HISTORY_LABEL_GAP,
                      },
                    ]}
                  >
                    <View style={styles.historyLabelHeader}>
                      <Text
                        style={[
                          styles.historyLabelHeaderText,
                          {
                            color: muted,
                            fontFamily: fontFamily("data", fontsLoaded),
                          },
                        ]}
                      >
                        Habits
                      </Text>
                    </View>

                    {habits.map((habit, index) => {
                      const doneCount = month.days.reduce((acc, d) => {
                        const v = (habit.checks || {})[d.key] || 0;
                        return v > 0 ? acc + 1 : acc;
                      }, 0);

                      return (
                        <View
                          key={habit.id}
                          style={[
                            styles.historyLabelRow,
                            index < habits.length - 1 && styles.historyRowGap,
                          ]}
                        >
                          <Text
                            style={[
                              styles.historyLabelText,
                              {
                                color: ink,
                                fontFamily: fontFamily(
                                  "display",
                                  fontsLoaded,
                                ),
                              },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {habit.title}
                          </Text>
                          <Text
                            style={[
                              styles.historyCount,
                              {
                                color: muted,
                                fontFamily: fontFamily("data", fontsLoaded),
                              },
                            ]}
                          >
                            {`${doneCount}/${month.days.length}`}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <ScrollView
                    ref={isCurrentMonth ? currentMonthScrollRef : null}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    <View>
                      <View style={styles.historyDaysRow}>
                        {month.days.map((d) => (
                          <View
                            key={d.key}
                            style={[
                              styles.historyDayCell,
                              { width: HISTORY_SQUARE },
                            ]}
                          >
                            <Text
                              style={[
                                styles.historyDayText,
                                {
                                  color: muted,
                                  fontFamily: fontFamily(
                                    "data",
                                    fontsLoaded,
                                  ),
                                },
                              ]}
                            >
                              {String(d.num).padStart(2, "0")}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {habits.map((habit, index) => (
                        <View
                          key={habit.id}
                          style={[
                            styles.historySquaresRow,
                            index < habits.length - 1 && styles.historyRowGap,
                          ]}
                        >
                          {month.days.map((d) => {
                            const v = (habit.checks || {})[d.key] || 0;
                            const isFuture =
                              isCurrentMonth && d.num > todayDate.getDate();
                            const char = habitStateChar(v);
                            const color =
                              v === 1
                                ? theme.primary
                                : v === 2
                                  ? theme.danger
                                  : muted;

                            return (
                              <View
                                key={d.key}
                                style={[
                                  styles.historyCell,
                                  {
                                    width: HISTORY_SQUARE,
                                    height: HISTORY_SQUARE,
                                    opacity: isFuture ? 0.35 : 1,
                                  },
                                ]}
                                accessible
                                accessibilityLabel={`${habit.title} ${d.key} ${habitStateLabel(v)}`}
                              >
                                <Text
                                  style={[
                                    styles.historyChar,
                                    {
                                      color,
                                      fontFamily: fontFamily(
                                        "data",
                                        fontsLoaded,
                                      ),
                                    },
                                  ]}
                                >
                                  {char}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
                <SectionRule theme={theme} />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyHeader: { marginTop: SPACE.xs, gap: SPACE["2xs"] },
  historyTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPACE.sm,
  },
  historyTitleCol: {
    flex: 1,
    minWidth: 0,
    gap: SPACE["3xs"],
  },
  historyTitle: {
    fontSize: TYPE_SIZE.bodyLg,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  historySub: {
    marginTop: SPACE["3xs"],
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.data,
    textTransform: "uppercase",
  },
  historyBackBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: SPACE.xs,
    paddingHorizontal: SPACE.sm,
    minHeight: 36,
    justifyContent: "center",
  },
  historyBackText: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },

  monthsStack: { marginTop: SPACE.xs, gap: SPACE.lg },
  monthSection: { gap: SPACE.sm },
  monthHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACE.sm,
  },
  monthIndex: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.data,
    width: 22,
  },
  monthTitle: {
    flex: 1,
    flexShrink: 1,
    fontSize: TYPE_SIZE.bodyLg,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  monthMeta: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.data,
  },

  historyGrid: { marginTop: SPACE.xs, flexDirection: "row" },
  historyLabelCol: { flexShrink: 0 },
  historyLabelHeader: {
    height: HISTORY_ROW_HEIGHT,
    justifyContent: "center",
  },
  historyLabelHeaderText: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  historyLabelRow: {
    height: HISTORY_ROW_HEIGHT,
    justifyContent: "center",
    gap: 2,
  },
  historyLabelText: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  historyCount: {
    fontSize: TYPE_SIZE.kicker,
    letterSpacing: TYPE_TRACK.data,
  },
  historyDaysRow: {
    flexDirection: "row",
    alignItems: "center",
    height: HISTORY_ROW_HEIGHT,
    gap: HISTORY_CELL_GAP,
  },
  historyDayCell: {
    height: HISTORY_SQUARE,
    alignItems: "center",
    justifyContent: "center",
  },
  historyDayText: { fontSize: 9, fontWeight: "600", letterSpacing: 0.2 },
  historySquaresRow: {
    flexDirection: "row",
    alignItems: "center",
    height: HISTORY_ROW_HEIGHT,
    gap: HISTORY_CELL_GAP,
  },
  historyRowGap: { marginBottom: HISTORY_ROW_GAP },
  historyCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  historyChar: {
    fontSize: 14,
    lineHeight: 16,
    ...Platform.select({
      android: { includeFontPadding: false },
    }),
  },

  noGap: { gap: 0 },
});
