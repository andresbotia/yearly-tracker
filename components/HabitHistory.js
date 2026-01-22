// components/HabitHistory.js

import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";

const ANDROID = Platform.OS === "android";

const HISTORY_SQUARE = 22;
const HISTORY_LABEL_W = 150;
const HISTORY_LABEL_GAP = 12;
const HISTORY_ROW_HEIGHT = 52;
const HISTORY_ROW_GAP = 10;
const HISTORY_CELL_GAP = 6;

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

  return (
    <View>
      <View style={styles.historyHeader}>
        <View style={[styles.historyTitleRow, ANDROID && styles.noGap]}>
          <Text style={[styles.historyTitle, { color: theme.text }]}>
            Habit History
          </Text>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.historyBackBtn,
              {
                borderColor: theme.border,
                backgroundColor: pressed ? theme.border : theme.card,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Back to habits"
          >
            <Text style={[styles.historyBackText, { color: theme.text }]}>
              Back
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.historySub, { color: theme.mutedText }]}>
          Scroll through the months you have completed so far.
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {habits.length === 0 || months.length === 0 ? (
        <View style={styles.historyEmptyWrap}>
          <Text style={[styles.historyEmptyTitle, { color: theme.text }]}>
            No habits yet
          </Text>
          <Text style={[styles.historyEmptySub, { color: theme.mutedText }]}>
            Add a habit to start seeing your monthly history.
          </Text>
        </View>
      ) : (
        <View style={styles.monthsStack}>
          {months.map((month) => {
            const isCurrentMonth =
              historyYear === todayYear &&
              month.monthIndex === todayMonth;

            return (
              <View key={month.label} style={styles.monthSection}>
                <View style={styles.monthHeaderRow}>
                  <Text style={[styles.monthTitle, { color: theme.text }]}>
                    {month.label}
                  </Text>
                  <Text style={[styles.monthMeta, { color: theme.mutedText }]}>
                    {month.days.length} days
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
                          { color: theme.mutedText },
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
                              { color: theme.text },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {habit.title}
                          </Text>
                          <View
                            style={[
                              styles.historyBadge,
                              {
                                borderColor: theme.border,
                                backgroundColor: theme.card,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.historyBadgeText,
                                { color: theme.text },
                              ]}
                            >
                              {doneCount}/{month.days.length}
                            </Text>
                          </View>
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
                                { color: theme.mutedText },
                              ]}
                            >
                              {d.num}
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
                            const bg =
                              v === 1
                                ? theme.primary
                                : v === 2
                                  ? theme.danger
                                  : "transparent";

                            return (
                              <View
                                key={d.key}
                                style={[
                                  styles.historySquare,
                                  {
                                    width: HISTORY_SQUARE,
                                    height: HISTORY_SQUARE,
                                    borderColor: theme.border,
                                    backgroundColor: bg,
                                    opacity: isFuture ? 0.35 : 1,
                                  },
                                ]}
                              />
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyHeader: { marginTop: 12 },
  historyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  historyTitle: { fontSize: 22, fontWeight: "950", letterSpacing: 0.2 },
  historySub: { marginTop: 6, fontSize: 12, fontWeight: "700" },
  historyBackBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  historyBackText: { fontSize: 12, fontWeight: "900", letterSpacing: 0.2 },

  divider: { marginTop: 16, height: 1 },

  monthsStack: { marginTop: 12, gap: 22 },
  monthSection: { gap: 10 },
  monthHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 10,
  },
  monthTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 0.2 },
  monthMeta: { fontSize: 12, fontWeight: "800" },

  historyGrid: { marginTop: 10, flexDirection: "row" },
  historyLabelCol: { flexShrink: 0 },
  historyLabelHeader: {
    height: HISTORY_ROW_HEIGHT,
    justifyContent: "center",
  },
  historyLabelHeaderText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  historyLabelRow: {
    height: HISTORY_ROW_HEIGHT,
    justifyContent: "center",
    gap: 6,
  },
  historyLabelText: { fontSize: 14, fontWeight: "900", letterSpacing: 0.2 },
  historyBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  historyBadgeText: { fontSize: 11, fontWeight: "900", letterSpacing: 0.2 },
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
  historyDayText: { fontSize: 11, fontWeight: "900" },
  historySquaresRow: {
    flexDirection: "row",
    alignItems: "center",
    height: HISTORY_ROW_HEIGHT,
    gap: HISTORY_CELL_GAP,
  },
  historyRowGap: { marginBottom: HISTORY_ROW_GAP },
  historySquare: { borderWidth: 1, borderRadius: 7 },
  historyEmptyWrap: { paddingVertical: 32, alignItems: "center" },
  historyEmptyTitle: { fontSize: 16, fontWeight: "900" },
  historyEmptySub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    maxWidth: 240,
  },

  noGap: { gap: 0 },
});
