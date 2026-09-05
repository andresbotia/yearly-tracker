// Shared press scale + haptic. Presentation only.
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MOTION } from "../../utils/tokens";
import {
  hapticSelect,
  hapticTick,
  useReducedMotion,
} from "../../utils/motion";

export default function PressableInk({
  onPress,
  haptic = "select",
  disabled = false,
  children,
  style,
  innerStyle,
  pressedOpacity = 0.85,
  ...rest
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={async () => {
        if (disabled) return;
        if (haptic === "select") await hapticSelect();
        else if (haptic === "tick") await hapticTick();
        onPress?.();
      }}
      onPressIn={() => {
        if (disabled || reduced) return;
        scale.value = withTiming(MOTION.pressScale, {
          duration: MOTION.micro,
        });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: MOTION.short });
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.outer,
        typeof style === "function" ? style({ pressed }) : style,
        { opacity: disabled ? 0.45 : pressed ? pressedOpacity : 1 },
      ]}
      {...rest}
    >
      <Animated.View style={[styles.inner, innerStyle, animStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    justifyContent: "center",
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
  },
});
