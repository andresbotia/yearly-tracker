import React, { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SPACE, TYPE_SIZE, TYPE_TRACK, MOTION, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import { useReducedMotion } from "../../utils/motion";

export default function CompletionMark({ visible, theme }) {
  const fontsLoaded = useFontsLoaded();
  const reduced = useReducedMotion();
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: reduced ? MOTION.reduced : MOTION.completion / 2,
    });
  }, [visible, opacity, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: reduced ? 0 : (1 - opacity.value) * 6 }],
  }));

  if (!visible && opacity.value === 0) return null;

  return (
    <Animated.View style={[styles.wrap, style]} pointerEvents="none">
      <Text
        style={[
          styles.mark,
          {
            color: theme?.text || "#1c1916",
            fontFamily: fontFamily("data", fontsLoaded),
          },
        ]}
      >
        [AT]  /  GOAL COMPLETE
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: SPACE.md,
    alignItems: "center",
  },
  mark: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
});
