import React, { useEffect } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SPACE, TYPE_SIZE, TYPE_TRACK, MOTION, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import { hapticSelect, useReducedMotion } from "../../utils/motion";

export default function MilestoneMark({
  complete,
  theme,
  onChange,
}) {
  const fontsLoaded = useFontsLoaded();
  const reduced = useReducedMotion();
  const fill = useSharedValue(complete ? 1 : 0);
  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";

  useEffect(() => {
    fill.value = withTiming(complete ? 1 : 0, {
      duration: reduced ? MOTION.reduced : MOTION.interaction,
    });
  }, [complete, fill, reduced]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.86 + fill.value * 0.14 }],
    opacity: 0.55 + fill.value * 0.45,
  }));

  return (
    <Pressable
      onPress={async () => {
        await hapticSelect();
        onChange?.(!complete);
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!complete }}
      accessibilityLabel={complete ? "Complete" : "Incomplete"}
      style={({ pressed }) => [
        styles.row,
        { borderColor: ink, opacity: pressed ? 0.72 : 1 },
      ]}
    >
      <Animated.View style={[styles.markWrap, markStyle]}>
        <Text
          style={[
            styles.mark,
            {
              color: complete ? ink : muted,
              fontFamily: fontFamily("data", fontsLoaded),
            },
          ]}
        >
          {complete ? "●" : "○"}
        </Text>
      </Animated.View>
      <View style={styles.copy}>
        <Text
          style={[
            styles.kicker,
            { color: muted, fontFamily: fontFamily("data", fontsLoaded) },
          ]}
        >
          Milestone
        </Text>
        <Text
          style={[
            styles.label,
            { color: ink, fontFamily: fontFamily("display", fontsLoaded) },
          ]}
        >
          {complete ? "Complete" : "Incomplete"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.md,
  },
  markWrap: {
    width: 28,
    alignItems: "center",
  },
  mark: {
    fontSize: 22,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontSize: TYPE_SIZE.kicker,
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  label: {
    fontSize: TYPE_SIZE.bodyLg,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
});
