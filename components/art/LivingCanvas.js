import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { MOTION } from "../../utils/tokens";
import { useReducedMotion } from "../../utils/motion";

export default function LivingCanvas({
  active = false,
  layer = "art",
  children,
  style,
}) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  const live = useSharedValue(0);
  const enabled = active && !reduced;

  useEffect(() => {
    live.value = enabled ? 1 : 0;
    if (!enabled) {
      t.value = 0;
      return;
    }
    t.value = 0;
    t.value = withRepeat(
      withTiming(1, {
        duration: MOTION.ambient,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [enabled, t, live]);

  const isAscii = layer === "ascii";
  const motionStyle = useAnimatedStyle(() => {
    if (live.value === 0) return { transform: [{ scale: 1 }] };
    if (isAscii) {
      return {
        transform: [
          { translateX: t.value * 1.6 },
          { translateY: (1 - t.value) * 1.2 },
        ],
      };
    }
    return {
      transform: [
        { scale: 1 + t.value * (MOTION.livingScale - 1) },
        { translateX: t.value * MOTION.livingTranslate },
        { translateY: -t.value * (MOTION.livingTranslate * 0.7) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.fill, style, motionStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});
