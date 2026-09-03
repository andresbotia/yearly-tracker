import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { SPACE, TYPE_SIZE, TYPE_TRACK, MOTION, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import {
  hapticTick,
  padCount,
  scrubPixelsPerUnit,
  useHoldRepeat,
  useReducedMotion,
} from "../../utils/motion";
import AnimatedAsciiBar from "../motion/AnimatedAsciiBar";
import AnimatedNumber from "../motion/AnimatedNumber";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function AtelierCounter({
  value,
  target,
  theme,
  onChange,
}) {
  const fontsLoaded = useFontsLoaded();
  const reduced = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const safeTarget = Math.max(0, Math.floor(Number(target) || 0));
  const safeValue = clamp(Math.floor(Number(value) || 0), 0, safeTarget);
  const pct = safeTarget > 0 ? Math.round((safeValue / safeTarget) * 100) : 0;
  const pxPerUnit = scrubPixelsPerUnit(safeTarget);
  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";

  const neighbors = useMemo(() => {
    const out = [];
    for (let i = -2; i <= 2; i++) {
      const n = safeValue + i;
      if (n < 0 || n > safeTarget) continue;
      out.push(n);
    }
    return out;
  }, [safeValue, safeTarget]);

  function commit(next) {
    const n = clamp(Math.floor(next), 0, safeTarget);
    if (n === safeValue) return;
    onChange?.(n);
  }

  function step(dir) {
    const next = clamp(safeValue + dir, 0, safeTarget);
    if (next === safeValue) return;
    hapticTick();
    onChange?.(next);
  }

  const hold = useHoldRepeat(step);

  const startRef = useRef(safeValue);

  function captureStart() {
    startRef.current = safeValue;
  }

  function applyScrub(translationX) {
    const delta = translationX / pxPerUnit;
    const next = clamp(Math.round(startRef.current + delta), 0, safeTarget);
    if (next !== safeValue) {
      hapticTick();
      onChange?.(next);
    }
  }

  const pan = Gesture.Pan()
    .activeOffsetX(10)
    .onBegin(() => {
      runOnJS(captureStart)();
    })
    .onUpdate((e) => {
      runOnJS(applyScrub)(e.translationX);
    });

  function openEntry() {
    setDraft(String(safeValue));
    setEditing(true);
  }

  function submitEntry() {
    const n = Number(draft);
    setEditing(false);
    if (!Number.isFinite(n)) return;
    const next = clamp(Math.floor(n), 0, safeTarget);
    if (next !== safeValue) hapticTick();
    onChange?.(next);
  }

  const padded = (n) => padCount(n, safeTarget);

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`Progress ${safeValue} of ${safeTarget}`}
      accessibilityValue={{ min: 0, max: safeTarget, now: safeValue }}
      accessibilityActions={[
        { name: "increment", label: "Increase" },
        { name: "decrement", label: "Decrease" },
      ]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === "increment") step(1);
        if (e.nativeEvent.actionName === "decrement") step(-1);
      }}
    >
      <Pressable
        onPress={openEntry}
        accessibilityRole="button"
        accessibilityLabel="Enter exact progress"
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        {editing ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onBlur={submitEntry}
            onSubmitEditing={submitEntry}
            keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
            autoFocus
            maxLength={8}
            selectTextOnFocus
            style={[
              styles.hero,
              styles.input,
              {
                color: ink,
                borderColor: ink,
                fontFamily: fontFamily("display", fontsLoaded),
              },
            ]}
          />
        ) : (
          <AnimatedNumber
            value={safeValue}
            theme={theme}
            role="display"
            format={padded}
            style={styles.hero}
          />
        )}
      </Pressable>

      <View style={[styles.rule, { backgroundColor: theme?.border || "#d8d0c4" }]} />

      <GestureDetector gesture={pan}>
        <View style={styles.wheel} accessibilityElementsHidden>
          {neighbors.map((n) => {
            const active = n === safeValue;
            return (
              <Text
                key={n}
                style={[
                  styles.neighbor,
                  {
                    color: active ? ink : muted,
                    opacity: active ? 1 : 0.55,
                    fontFamily: fontFamily("data", fontsLoaded),
                    transform: [{ scale: active && !reduced ? 1.06 : 1 }],
                  },
                ]}
              >
                {padded(n)}
              </Text>
            );
          })}
        </View>
      </GestureDetector>

      <View style={styles.stepRow}>
        <Pressable
          onPress={() => step(-1)}
          onLongPress={() => hold.start(-1, false)}
          delayLongPress={400}
          onPressOut={hold.clear}
          hitSlop={8}
          style={({ pressed }) => [
            styles.step,
            {
              borderColor: ink,
              opacity: pressed ? MOTION.pressScale : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Decrease progress"
        >
          <Text style={[styles.stepLabel, { color: ink }]}>−</Text>
        </Pressable>
        <Pressable
          onPress={() => step(1)}
          onLongPress={() => hold.start(1, false)}
          delayLongPress={400}
          onPressOut={hold.clear}
          hitSlop={8}
          style={({ pressed }) => [
            styles.step,
            {
              borderColor: ink,
              opacity: pressed ? MOTION.pressScale : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Increase progress"
        >
          <Text style={[styles.stepLabel, { color: ink }]}>+</Text>
        </Pressable>
      </View>

      <View style={styles.meta}>
        <AnimatedAsciiBar percent={pct} width={22} theme={theme} />
        <AnimatedNumber
          value={pct}
          theme={theme}
          role="data"
          format={(v) => `${v}%`}
          style={[styles.pct, { color: muted }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    textAlign: "center",
    fontStyle: "normal",
  },
  input: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: SPACE.xs,
    textAlign: "center",
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    marginTop: SPACE.sm,
    marginBottom: SPACE.md,
    alignSelf: "center",
    width: 72,
  },
  wheel: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACE.sm,
    minHeight: 36,
  },
  neighbor: {
    fontSize: TYPE_SIZE.caption,
    letterSpacing: TYPE_TRACK.data,
    minWidth: 36,
    textAlign: "center",
  },
  stepRow: {
    marginTop: SPACE.md,
    flexDirection: "row",
    gap: SPACE.sm,
  },
  step: {
    flex: 1,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    fontSize: TYPE_SIZE.title,
    fontWeight: "400",
  },
  meta: {
    marginTop: SPACE.md,
    gap: SPACE["2xs"],
    alignItems: "flex-start",
  },
  pct: {
    fontSize: TYPE_SIZE.caption,
    letterSpacing: TYPE_TRACK.data,
  },
});
