import React, { useEffect, useRef } from "react";
import { Text, View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MOTION, fontFamily } from "../../utils/tokens";
import { useReducedMotion } from "../../utils/motion";
import { useFontsLoaded } from "../../utils/fonts";

export default function AnimatedNumber({
  value,
  theme,
  role = "data",
  style,
  format = (v) => String(v),
}) {
  const reduced = useReducedMotion();
  const loaded = useFontsLoaded();
  const display = format(value);
  const prevRef = useRef(display);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (prevRef.current === display) return;
    if (reduced) {
      prevRef.current = display;
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, { duration: MOTION.interaction });
    prevRef.current = display;
  }, [display, reduced, progress]);

  const incoming = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 8 }],
  }));

  const ink = theme?.text || "#1c1916";

  return (
    <View style={styles.clip}>
      <Animated.View style={incoming}>
        <Text
          style={[
            { color: ink, fontFamily: fontFamily(role, loaded) },
            style,
          ]}
        >
          {display}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
});
