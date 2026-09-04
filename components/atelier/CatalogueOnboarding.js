import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SPACE, TYPE_SIZE, TYPE_TRACK, MOTION, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import { useReducedMotion } from "../../utils/motion";
import MetadataLabel from "../editorial/MetadataLabel";
import EditorialButton from "../editorial/EditorialButton";

export const ONBOARDING_STEPS = [
  {
    id: "ledger",
    kicker: "Daily ledger",
    body: "Tap a mark to record today.\n. empty   + good   × bad",
  },
  {
    id: "tabs",
    kicker: "Habits + Goals",
    body: "Habits tracks daily rhythm. Goals tracks longer-term progress.",
  },
  {
    id: "theme",
    kicker: "Your canvas",
    body: "Theme changes the artwork and atmosphere. Random Art rotates the collection.",
  },
  {
    id: "add",
    kicker: "Make it yours",
    body: "Add Habit and Add Goal grow the journal with your year.",
  },
];

export function measureNode(ref) {
  return new Promise((resolve) => {
    const node = ref?.current;
    if (!node || typeof node.measureInWindow !== "function") {
      resolve(null);
      return;
    }
    node.measureInWindow((x, y, width, height) => {
      if (
        typeof x === "number" &&
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        Number.isFinite(width) &&
        Number.isFinite(height) &&
        width > 1 &&
        height > 1
      ) {
        resolve({ x, y, width, height });
      } else {
        resolve(null);
      }
    });
  });
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function placeCard(anchor, cardH, windowWidth, windowHeight) {
  const cardWidth = Math.min(windowWidth - SPACE.md * 2, 343);
  const gap = SPACE.sm;
  const cardLeft = clamp(
    anchor.x + anchor.width / 2 - cardWidth / 2,
    SPACE.md,
    windowWidth - SPACE.md - cardWidth,
  );
  const minTop = SPACE.md;
  const maxTop = windowHeight - SPACE.md - cardH;
  const belowTop = anchor.y + anchor.height + gap;
  const aboveTop = anchor.y - cardH - gap;

  let placeBelow;
  let cardTop;
  if (maxTop < minTop) {
    placeBelow = belowTop <= anchor.y;
    cardTop = minTop;
  } else if (belowTop <= maxTop) {
    placeBelow = true;
    cardTop = belowTop;
  } else if (aboveTop >= minTop) {
    placeBelow = false;
    cardTop = aboveTop;
  } else {
    const spaceBelow = windowHeight - (anchor.y + anchor.height) - SPACE.md;
    const spaceAbove = anchor.y - SPACE.md;
    placeBelow = spaceBelow >= spaceAbove;
    cardTop = clamp(placeBelow ? belowTop : aboveTop, minTop, maxTop);
  }

  return { cardWidth, cardLeft, cardTop, placeBelow };
}

export default function CatalogueOnboarding({
  visible,
  theme,
  stepIndex = 0,
  anchor,
  onSkip,
  onNext,
  onTargetPress,
}) {
  const fontsLoaded = useFontsLoaded();
  const reduced = useReducedMotion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const step = ONBOARDING_STEPS[stepIndex] || ONBOARDING_STEPS[0];
  const last = stepIndex >= ONBOARDING_STEPS.length - 1;
  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";
  const paper = theme?.card || "#fbf8f1";
  const indexLabel = `[${String(stepIndex + 1).padStart(2, "0")} / ${String(
    ONBOARDING_STEPS.length,
  ).padStart(2, "0")}]`;
  const [cardH, setCardH] = useState(0);
  const positioned = cardH > 1;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(reduced ? 0 : 8);

  useEffect(() => {
    setCardH(0);
  }, [stepIndex, visible, windowWidth, windowHeight]);

  useEffect(() => {
    if (!visible || !anchor || !positioned) {
      opacity.value = 0;
      translateY.value = reduced ? 0 : 8;
      return;
    }
    const duration = reduced ? MOTION.reduced : MOTION.interaction;
    const easing = reduced ? Easing.linear : Easing.out(Easing.cubic);
    opacity.value = 0;
    translateY.value = reduced ? 0 : 8;
    opacity.value = withTiming(1, { duration, easing });
    if (!reduced) {
      translateY.value = withTiming(0, { duration, easing });
    }
  }, [visible, stepIndex, anchor, positioned, reduced, opacity, translateY]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;
  if (!anchor) {
    return (
      <View style={styles.overlay} pointerEvents="auto" accessibilityViewIsModal>
        <View
          pointerEvents="none"
          style={[styles.veil, { backgroundColor: "rgba(246,243,236,0.18)" }]}
        />
      </View>
    );
  }

  const placement = placeCard(
    anchor,
    positioned ? cardH : 48,
    windowWidth,
    windowHeight,
  );
  const { cardWidth, cardLeft, cardTop, placeBelow } = placement;

  const ruleX = clamp(
    anchor.x + anchor.width / 2,
    SPACE.md,
    windowWidth - SPACE.md,
  );
  const ruleTop = placeBelow
    ? anchor.y + anchor.height
    : positioned
      ? cardTop + cardH
      : cardTop;
  const ruleHeight = placeBelow
    ? Math.max(0, cardTop - (anchor.y + anchor.height))
    : Math.max(0, anchor.y - ruleTop);

  return (
    <View style={styles.overlay} pointerEvents="auto" accessibilityViewIsModal>
      <View
        pointerEvents="none"
        style={[
          styles.veil,
          { backgroundColor: "rgba(246,243,236,0.18)" },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.target,
          {
            left: anchor.x,
            top: anchor.y,
            width: anchor.width,
            height: anchor.height,
            borderColor: ink,
          },
        ]}
      />

      {onTargetPress ? (
        <Pressable
          onPress={onTargetPress}
          accessibilityRole="button"
          accessibilityLabel="Record today"
          accessibilityHint="Cycles empty, good, bad"
          style={[
            styles.hit,
            {
              left: anchor.x,
              top: anchor.y,
              width: anchor.width,
              height: anchor.height,
            },
          ]}
        />
      ) : null}

      {positioned && ruleHeight > 2 ? (
        <View
          pointerEvents="none"
          style={[
            styles.rule,
            {
              left: ruleX,
              top: ruleTop,
              height: ruleHeight,
              backgroundColor: ink,
            },
          ]}
        />
      ) : null}

      <Animated.View
        collapsable={false}
        pointerEvents={positioned ? "auto" : "none"}
        onLayout={(e) => {
          const next = Math.ceil(e.nativeEvent.layout.height);
          if (next > 1 && next !== cardH) setCardH(next);
        }}
        style={[
          styles.card,
          {
            left: cardLeft,
            top: cardTop,
            width: cardWidth,
            backgroundColor: paper,
            borderColor: ink,
            zIndex: 2,
          },
          cardStyle,
        ]}
      >
        <View style={[styles.accent, { backgroundColor: theme?.primary || ink }]} />
        <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
          {indexLabel}
        </MetadataLabel>
        <Text
          style={[
            styles.kicker,
            {
              color: ink,
              fontFamily: fontFamily("data", fontsLoaded),
            },
          ]}
        >
          {step.kicker}
        </Text>
        <Text
          style={[
            styles.body,
            {
              color: muted,
              fontFamily: fontFamily("body", fontsLoaded),
            },
          ]}
        >
          {step.body}
        </Text>
        <View style={styles.actions}>
          <EditorialButton
            label="Skip"
            theme={theme}
            onPress={onSkip}
            style={styles.action}
          />
          <EditorialButton
            label={last ? "Got it" : "Next"}
            theme={theme}
            variant="primary"
            onPress={onNext}
            style={styles.action}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
  },
  target: {
    position: "absolute",
    borderWidth: StyleSheet.hairlineWidth,
  },
  hit: {
    position: "absolute",
    zIndex: 1,
  },
  rule: {
    position: "absolute",
    width: StyleSheet.hairlineWidth,
  },
  card: {
    position: "absolute",
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: SPACE.sm,
    paddingHorizontal: SPACE.md,
    paddingBottom: SPACE.sm,
    gap: SPACE.xs,
  },
  accent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  kicker: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  body: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "400",
    lineHeight: 22,
  },
  actions: {
    marginTop: SPACE.xs,
    flexDirection: "row",
    gap: SPACE.xs,
  },
  action: {
    flex: 1,
  },
});
