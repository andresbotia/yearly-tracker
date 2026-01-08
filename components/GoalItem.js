// components/GoalItem.js

import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function goalPercent(goal) {
  if (goal.type === "boolean") return goal.progress === 1 ? 100 : 0;
  if (!goal.target || goal.target <= 0) return 0;
  return clamp((goal.progress / goal.target) * 100, 0, 100);
}

// Convert "#RRGGBB" to rgba(r,g,b,a). (Works with your theme hex colors.)
function hexToRgba(hex, alpha = 1) {
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

export default function GoalItem({
  goal,
  theme,
  onProgress,
  onEditDetails,
  onDelete,
  onDrag,
  dragging = false,
}) {
  const percent = useMemo(() => goalPercent(goal), [goal]);
  const pct = Math.round(percent);
  const isComplete = pct >= 100;

  const typeLabel = goal.type === "count" ? "Count" : "Milestone";
  const meta =
    goal.type === "count" && goal.target
      ? `${goal.progress}/${goal.target}`
      : goal.progress === 1
      ? "Completed"
      : "Not yet";

  async function hapticLight() {
    try {
      await Haptics.selectionAsync();
    } catch {}
  }

  const IconBtn = ({ name, label, variant = "neutral", onPress }) => {
    const baseColor =
      variant === "danger"
        ? theme.danger
        : variant === "primary"
        ? theme.primary
        : theme.text;

    const bg = hexToRgba(baseColor, 0.1);
    const bgPressed = hexToRgba(baseColor, 0.18);
    const border = hexToRgba(baseColor, 0.18);

    return (
      <Pressable
        onPress={onPress}
        hitSlop={10}
        style={({ pressed }) => [
          styles.iconBtn,
          {
            backgroundColor: pressed ? bgPressed : bg,
            borderColor: border,
          },
          pressed && { transform: [{ scale: 0.96 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons name={name} size={20} color={baseColor} />
      </Pressable>
    );
  };

  const cardBg = isComplete ? hexToRgba(theme.primary, 0.06) : theme.card;
  const cardBorder = isComplete ? hexToRgba(theme.primary, 0.45) : theme.border;

  return (
    <Pressable
      onLongPress={onDrag}
      delayLongPress={120}
      disabled={!onDrag}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          ...(Platform.OS === "android"
            ? { elevation: dragging ? 6 : 2 }
            : null),
        },
        (pressed || dragging) && {
          opacity: 0.97,
          transform: [{ scale: 0.99 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Goal: ${goal.title}. Long press to reorder.`}
    >
      <View style={styles.rowTop}>
        {/* Invisible drag hotspot (still keeps reordering), no circle/icon */}
        <Pressable
          onLongPress={onDrag}
          delayLongPress={120}
          disabled={!onDrag}
          hitSlop={12}
          style={styles.dragHotspot}
          accessibilityRole="button"
          accessibilityLabel={`Drag to reorder ${goal.title}`}
        />

        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {goal.title}
          </Text>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.badge,
                { borderColor: theme.border, backgroundColor: theme.bg },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.mutedText }]}>
                {typeLabel}
              </Text>
            </View>

            <Text style={[styles.metaText, { color: theme.mutedText }]}>
              {meta}
            </Text>
          </View>

          {/* Premium: slim progress bar */}
          <View
            style={[styles.progressTrack, { backgroundColor: theme.border }]}
            accessible
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: pct }}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${pct}%`, backgroundColor: theme.primary },
              ]}
            />
          </View>
        </View>

        <View style={styles.rightCol}>
          <View style={styles.pctRow}>
            <Text style={[styles.pctText, { color: theme.text }]}>{pct}%</Text>

            {isComplete ? (
              <View
                style={[
                  styles.completeChip,
                  {
                    borderColor: hexToRgba(theme.primary, 0.35),
                    backgroundColor: hexToRgba(theme.primary, 0.12),
                  },
                ]}
              >
                <Ionicons name="checkmark" size={14} color={theme.primary} />
                <Text style={[styles.completeText, { color: theme.primary }]}>
                  Done
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={[styles.pctSub, { color: theme.mutedText }]}>
            complete
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <IconBtn
          name="create-outline"
          variant="primary"
          label={`Edit goal details for ${goal.title}`}
          onPress={async () => {
            await hapticLight();
            onEditDetails?.(goal);
          }}
        />

        <Pressable
          onPress={async () => {
            await hapticLight();
            onProgress?.(goal);
          }}
          android_ripple={
            Platform.OS === "android"
              ? { color: hexToRgba(theme.primaryTextOn, 0.18) }
              : undefined
          }
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: pressed ? theme.primaryPressed : theme.primary,
              borderColor: hexToRgba(theme.primary, 0.35),
              opacity: pressed ? 0.95 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Update progress for ${goal.title}`}
        >
          <View style={styles.primaryBtnInner}>
            <Ionicons
              name={isComplete ? "create-outline" : "add-circle-outline"}
              size={18}
              color={theme.primaryTextOn}
            />
            <Text
              style={[styles.primaryBtnText, { color: theme.primaryTextOn }]}
            >
              {isComplete ? "Adjust" : "Update"}
            </Text>
          </View>
        </Pressable>

        <IconBtn
          name="trash-outline"
          variant="danger"
          label={`Delete ${goal.title}`}
          onPress={async () => {
            await hapticLight();
            onDelete?.(goal.id);
          }}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
    }),
  },

  rowTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  // Invisible but stable drag hit area (no visuals)
  dragHotspot: {
    width: 10,
    height: 52,
    borderRadius: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "700",
  },

  progressTrack: {
    marginTop: 10,
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  rightCol: {
    alignItems: "flex-end",
    minWidth: 96,
  },
  pctRow: {
    alignItems: "flex-end",
    gap: 8,
  },
  pctText: {
    fontSize: 18,
    fontWeight: "950",
    letterSpacing: 0.2,
  },
  completeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  completeText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginTop: -1,
  },
  pctSub: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
  },

  actions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});
