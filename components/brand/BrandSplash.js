// RN continuation of the native Museum Paper splash. No extra delay.
import React, { useEffect } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BRAND, MOTION } from "../../utils/tokens";
import { useReducedMotion } from "../../utils/motion";

const SPLASH = require("../../assets/brand/splash/atelier-splash-mark-paper.png");

export default function BrandSplash() {
  const { width, height } = useWindowDimensions();
  const shorter = Math.min(width, height);
  const reduced = useReducedMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  const motionScale = reduced ? 0 : 1;

  useEffect(() => {
    t.value = withTiming(1, {
      duration: reduced ? MOTION.reduced : MOTION.interaction,
    });
  }, [reduced, t]);

  const motionStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [
      { scale: motionScale === 0 ? 1 : 0.986 + 0.014 * t.value },
    ],
  }));

  return (
    <View style={[styles.fill, { backgroundColor: BRAND.paper }]}>
      <Animated.Image
        source={SPLASH}
        style={[{ width: shorter, height: shorter }, motionStyle]}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Atelier Tracker"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
