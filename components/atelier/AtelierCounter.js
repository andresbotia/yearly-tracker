import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  InputAccessoryView,
  Keyboard,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
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

const ACCESSORY_ID = "atelier-counter-done";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function parseDraft(raw, target, fallback) {
  const n = Number(String(raw || "").trim());
  if (!Number.isFinite(n)) return fallback;
  return clamp(Math.floor(n), 0, target);
}

const AtelierCounter = forwardRef(function AtelierCounter(
  { value, target, theme, onChange },
  ref,
) {
  const fontsLoaded = useFontsLoaded();
  const reduced = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const draftRef = useRef("");
  const editingRef = useRef(false);
  const valueRef = useRef(0);
  const targetRef = useRef(0);
  const onChangeRef = useRef(onChange);
  const safeTarget = Math.max(0, Math.floor(Number(target) || 0));
  const safeValue = clamp(Math.floor(Number(value) || 0), 0, safeTarget);
  editingRef.current = editing;
  valueRef.current = safeValue;
  targetRef.current = safeTarget;
  onChangeRef.current = onChange;
  const pct = safeTarget > 0 ? Math.round((safeValue / safeTarget) * 100) : 0;
  const pxPerUnit = Math.max(6, scrubPixelsPerUnit(safeTarget) * 0.85);
  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";
  const hint = useSharedValue(0);

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
    onChange?.(n);
    return n;
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
    const next = clamp(
      Math.round(startRef.current + translationX / pxPerUnit),
      0,
      safeTarget,
    );
    if (next !== safeValue) {
      hapticTick();
      onChange?.(next);
    }
  }

  const pan = Gesture.Pan()
    .activeOffsetX(6)
    .failOffsetY([-24, 24])
    .onBegin(() => {
      runOnJS(captureStart)();
    })
    .onUpdate((e) => {
      runOnJS(applyScrub)(e.translationX);
    });

  function openEntry() {
    const start = String(safeValue);
    draftRef.current = start;
    setDraft(start);
    setEditing(true);
  }

  function submitEntry() {
    const current = valueRef.current;
    const next = parseDraft(
      draftRef.current,
      targetRef.current,
      current,
    );
    editingRef.current = false;
    setEditing(false);
    Keyboard.dismiss();
    if (next !== current) hapticTick();
    onChangeRef.current?.(next);
    return next;
  }

  useImperativeHandle(ref, () => ({
    flush() {
      if (!editingRef.current) return valueRef.current;
      return submitEntry();
    },
  }));

  React.useEffect(() => {
    if (reduced) return;
    hint.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 700 }),
        withTiming(-6, { duration: 700 }),
        withTiming(0, { duration: 500 }),
      ),
      1,
      false,
    );
  }, [hint, reduced]);

  const hintStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: reduced ? 0 : hint.value }],
  }));

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
      <Text
        style={[
          styles.cue,
          { color: muted, fontFamily: fontFamily("data", fontsLoaded) },
        ]}
      >
        Drag the reel  ·  tap the number to type
      </Text>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.scrub,
            hintStyle,
            { borderColor: theme?.border || "#d8d0c4" },
          ]}
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
                onChangeText={(t) => {
                  draftRef.current = t;
                  setDraft(t);
                }}
                onBlur={submitEntry}
                onSubmitEditing={submitEntry}
                keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                inputAccessoryViewID={
                  Platform.OS === "ios" ? ACCESSORY_ID : undefined
                }
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

          <View style={styles.wheel} accessibilityElementsHidden>
            <Text
              style={[
                styles.cueMark,
                { color: muted, fontFamily: fontFamily("data", fontsLoaded) },
              ]}
            >
              ‹
            </Text>
            {neighbors.map((n) => {
              const active = n === safeValue;
              return (
                <Text
                  key={n}
                  style={[
                    styles.neighbor,
                    {
                      color: active ? ink : muted,
                      opacity: active ? 1 : 0.5,
                      fontFamily: fontFamily("data", fontsLoaded),
                    },
                  ]}
                >
                  {padded(n)}
                </Text>
              );
            })}
            <Text
              style={[
                styles.cueMark,
                { color: muted, fontFamily: fontFamily("data", fontsLoaded) },
              ]}
            >
              ›
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {Platform.OS === "ios" ? (
        <InputAccessoryView nativeID={ACCESSORY_ID}>
          <View
            style={[
              styles.accessory,
              { backgroundColor: theme?.card || "#fbf8f1", borderColor: ink },
            ]}
          >
            <Pressable
              onPress={submitEntry}
              accessibilityRole="button"
              accessibilityLabel="Done entering number"
              style={styles.accessoryBtn}
            >
              <Text
                style={[
                  styles.accessoryText,
                  { color: ink, fontFamily: fontFamily("data", fontsLoaded) },
                ]}
              >
                Done
              </Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}

      <View style={styles.stepRow}>
        <Pressable
          onPress={() => step(-1)}
          onLongPress={() => hold.start(-1, false)}
          delayLongPress={400}
          onPressOut={hold.clear}
          hitSlop={8}
          style={({ pressed }) => [
            styles.step,
            { borderColor: ink, opacity: pressed ? MOTION.pressScale : 1 },
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
            { borderColor: ink, opacity: pressed ? MOTION.pressScale : 1 },
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
});

export default AtelierCounter;

const styles = StyleSheet.create({
  cue: {
    fontSize: TYPE_SIZE.kicker,
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: SPACE.sm,
  },
  scrub: {
    minHeight: 148,
    paddingVertical: SPACE.md,
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACE.sm,
  },
  cueMark: {
    fontSize: TYPE_SIZE.body,
    opacity: 0.45,
  },
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
    width: 96,
  },
  wheel: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACE.md,
    minHeight: 44,
  },
  neighbor: {
    fontSize: TYPE_SIZE.body,
    letterSpacing: TYPE_TRACK.data,
    minWidth: 40,
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
  accessory: {
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-end",
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
  },
  accessoryBtn: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: SPACE.sm,
  },
  accessoryText: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
});
