import React, {
  forwardRef,
  useEffect,
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
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
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
const SLOT = 46;
const HINT_MS = 520;
let reelHintSeen = false;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function parseDraft(raw, target, fallback) {
  const n = Number(String(raw || "").trim());
  if (!Number.isFinite(n)) return fallback;
  return clamp(Math.floor(n), 0, target);
}

function ReelTick({ n, active, padded, ink, muted, fontsLoaded, floatValue }) {
  const style = useAnimatedStyle(() => {
    const d = n - floatValue.value;
    const abs = Math.abs(d);
    return {
      transform: [
        { translateX: d * SLOT },
        { scale: 1 + Math.max(0, 0.1 - abs * 0.1) },
      ],
      opacity: Math.max(0.18, 1 - abs * 0.34),
    };
  });

  return (
    <Animated.Text
      style={[
        styles.neighbor,
        style,
        {
          color: active ? ink : muted,
          fontFamily: fontFamily("data", fontsLoaded),
        },
      ]}
    >
      {padded(n)}
    </Animated.Text>
  );
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
  const draggingRef = useRef(false);
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

  const floatValue = useSharedValue(safeValue);
  const startValue = useSharedValue(safeValue);
  const lastInt = useSharedValue(safeValue);
  const dragging = useSharedValue(0);
  const hint = useSharedValue(0);
  const pxPerUnitSV = useSharedValue(pxPerUnit);
  const targetSV = useSharedValue(safeTarget);

  useEffect(() => {
    pxPerUnitSV.value = pxPerUnit;
    targetSV.value = safeTarget;
  }, [pxPerUnit, safeTarget, pxPerUnitSV, targetSV]);

  useEffect(() => {
    if (draggingRef.current) return;
    floatValue.value = safeValue;
    lastInt.value = safeValue;
    startValue.value = safeValue;
  }, [safeValue, floatValue, lastInt, startValue]);

  const neighbors = useMemo(() => {
    const out = [];
    for (let i = -2; i <= 2; i++) {
      const n = safeValue + i;
      if (n < 0 || n > safeTarget) continue;
      out.push(n);
    }
    return out;
  }, [safeValue, safeTarget]);

  function commitLive(next) {
    const n = clamp(Math.floor(next), 0, targetRef.current);
    if (n === valueRef.current) return;
    hapticTick();
    onChangeRef.current?.(n);
  }

  function setDragging(on) {
    draggingRef.current = !!on;
  }

  function finishScrub(next) {
    draggingRef.current = false;
    const n = clamp(Math.floor(next), 0, targetRef.current);
    if (n !== valueRef.current) {
      hapticTick();
      onChangeRef.current?.(n);
    }
    return n;
  }

  function step(dir) {
    if (editingRef.current) return;
    const next = clamp(safeValue + dir, 0, safeTarget);
    if (next === safeValue) return;
    hapticTick();
    onChange?.(next);
  }

  const hold = useHoldRepeat(step);

  function openEntry() {
    if (draggingRef.current) return;
    const start = String(valueRef.current);
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

  useEffect(() => {
    if (reduced || reelHintSeen) return;
    reelHintSeen = true;
    hint.value = withSequence(
      withTiming(7, {
        duration: HINT_MS,
        easing: Easing.inOut(Easing.quad),
      }),
      withTiming(-7, {
        duration: HINT_MS,
        easing: Easing.inOut(Easing.quad),
      }),
      withTiming(0, {
        duration: 380,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [hint, reduced]);

  const pan = Gesture.Pan()
    .enabled(!editing && safeTarget > 0)
    .activeOffsetX([-4, 4])
    .failOffsetY([-22, 22])
    .maxPointers(1)
    .onBegin(() => {
      "worklet";
      startValue.value = floatValue.value;
      lastInt.value = Math.round(floatValue.value);
      hint.value = 0;
    })
    .onStart(() => {
      "worklet";
      dragging.value = 1;
      runOnJS(setDragging)(true);
    })
    .onUpdate((e) => {
      "worklet";
      const next = Math.max(
        0,
        Math.min(
          targetSV.value,
          startValue.value + e.translationX / pxPerUnitSV.value,
        ),
      );
      floatValue.value = next;
      const rounded = Math.round(next);
      if (rounded !== lastInt.value) {
        lastInt.value = rounded;
        runOnJS(commitLive)(rounded);
      }
    })
    .onEnd((e) => {
      "worklet";
      const projected =
        startValue.value +
        (e.translationX + e.velocityX * 0.14) / pxPerUnitSV.value;
      const snapped = Math.max(
        0,
        Math.min(targetSV.value, Math.round(projected)),
      );
      floatValue.value = withTiming(snapped, {
        duration: reduced ? 80 : 180,
        easing: Easing.out(Easing.cubic),
      });
      dragging.value = 0;
      lastInt.value = snapped;
      runOnJS(finishScrub)(snapped);
    })
    .onFinalize(() => {
      "worklet";
      dragging.value = 0;
      runOnJS(setDragging)(false);
    });

  const tap = Gesture.Tap()
    .enabled(!editing)
    .maxDuration(280)
    .maxDistance(10)
    .requireExternalGestureToFail(pan)
    .onEnd(() => {
      "worklet";
      runOnJS(openEntry)();
    });

  const hintStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: reduced || dragging.value ? 0 : hint.value },
    ],
  }));

  const heroPulse = useAnimatedStyle(() => {
    const active = dragging.value;
    return {
      transform: [{ scale: active ? 1.04 : 1 }],
    };
  });

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
          collapsable={false}
          style={[
            styles.scrub,
            hintStyle,
            { borderColor: theme?.border || "#d8d0c4" },
          ]}
        >
          <GestureDetector gesture={tap}>
            <Animated.View
              collapsable={false}
              style={[styles.heroHit, heroPulse]}
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
                <Text
                  style={[
                    styles.hero,
                    {
                      color: ink,
                      fontFamily: fontFamily("display", fontsLoaded),
                    },
                  ]}
                >
                  {padded(safeValue)}
                </Text>
              )}
            </Animated.View>
          </GestureDetector>

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
            <View style={styles.track}>
              {neighbors.map((n) => (
                <ReelTick
                  key={n}
                  n={n}
                  active={n === safeValue}
                  padded={padded}
                  ink={ink}
                  muted={muted}
                  fontsLoaded={fontsLoaded}
                  floatValue={floatValue}
                />
              ))}
            </View>
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
  heroHit: {
    minHeight: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  cueMark: {
    fontSize: TYPE_SIZE.body,
    opacity: 0.45,
    width: 16,
    textAlign: "center",
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
    minWidth: 120,
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
    minHeight: 48,
  },
  track: {
    flex: 1,
    height: 48,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  neighbor: {
    position: "absolute",
    fontSize: TYPE_SIZE.body,
    letterSpacing: TYPE_TRACK.data,
    minWidth: 44,
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
