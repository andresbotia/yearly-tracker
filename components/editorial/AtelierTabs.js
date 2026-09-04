import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SPACE, TYPE_SIZE, TYPE_TRACK, MOTION, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import { hapticSelect, useReducedMotion } from "../../utils/motion";

const TABS = [
  { key: "habits", label: "Habits" },
  { key: "goals", label: "Goals" },
];

export default function AtelierTabs({ theme, active, onChange }) {
  const fontsLoaded = useFontsLoaded();
  const reduced = useReducedMotion();
  const layouts = useRef({});
  const x = useSharedValue(0);
  const w = useSharedValue(48);
  const ink = theme?.text || "#1c1916";

  function moveTo(key) {
    const layout = layouts.current[key];
    if (!layout) return;
    const duration = reduced ? MOTION.reduced : MOTION.tab;
    const easing = reduced ? Easing.linear : Easing.out(Easing.cubic);
    x.value = withTiming(layout.x, { duration, easing });
    w.value = withTiming(layout.width, { duration, easing });
  }

  useEffect(() => {
    moveTo(active);
  }, [active, reduced]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: w.value,
  }));

  return (
    <View
      style={[styles.row, { borderBottomColor: theme?.border || "rgba(28,25,22,0.18)" }]}
      accessibilityRole="tablist"
    >
      {TABS.map((tab) => {
        const selected = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={async () => {
              if (selected) return;
              await hapticSelect();
              onChange?.(tab.key);
            }}
            onLayout={(e) => {
              const { x: left, width } = e.nativeEvent.layout;
              layouts.current[tab.key] = { x: left, width };
              if (tab.key === active) {
                x.value = left;
                w.value = width;
              }
            }}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
          >
            <Text
              style={[
                styles.label,
                {
                  color: selected ? ink : theme?.mutedText,
                  fontFamily: fontFamily("data", fontsLoaded),
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
      <Animated.View
        pointerEvents="none"
        style={[styles.indicator, { backgroundColor: ink }, indicatorStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: SPACE.sm,
    flexDirection: "row",
    gap: SPACE.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: "relative",
  },
  tab: {
    paddingVertical: SPACE.sm,
    minHeight: 44,
    justifyContent: "center",
  },
  label: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  indicator: {
    position: "absolute",
    bottom: -StyleSheet.hairlineWidth,
    left: 0,
    height: 1,
  },
});
