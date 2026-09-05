// Scroll-responsive identity. Uses Reanimated scroll values — no per-frame setState.
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SPACE } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import { useReducedMotion } from "../../utils/motion";
import MetadataLabel from "./MetadataLabel";
import ArtworkCredit from "../art/ArtworkCredit";
import BrandMark from "../brand/BrandMark";

export const HEADER_COLLAPSE = 40;
// Header animation only needs the useful top range. Bottom rubber-band
// offsets must not keep driving this value or the sticky chrome will
// relayout on every overscroll frame.
export const HEADER_ANIM_RANGE = 200;

export function CollapsingKicker({ theme, year, fontsLoaded, onMarkLongPress }) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  const mark = <BrandMark size={24} />;
  const markNode =
    __DEV__ && onMarkLongPress ? (
      <Pressable
        onLongPress={onMarkLongPress}
        delayLongPress={450}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Developer first-run states"
      >
        {mark}
      </Pressable>
    ) : (
      mark
    );
  return (
    <View style={styles.kickerRow}>
      {markNode}
      <MetadataLabel theme={theme} fontsLoaded={loaded}>
        {`/  ${year}`}
      </MetadataLabel>
    </View>
  );
}

export function CollapsingIdentity({
  theme,
  scrollY,
  artwork,
  fontsLoaded,
  visible = true,
}) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  const reduced = useReducedMotion();
  const measured = useSharedValue(0);

  const collapseStyle = useAnimatedStyle(() => {
    const y = Math.max(0, scrollY.value);
    const h = measured.value;
    if (h <= 0) {
      return { opacity: 1 };
    }
    if (reduced) {
      const hide = y > h * 0.65;
      return {
        opacity: hide ? 0 : 1,
        height: hide ? 0 : h,
        overflow: "hidden",
      };
    }
    if (y >= h) {
      return {
        opacity: 0,
        height: 0,
        overflow: "hidden",
      };
    }
    const t = interpolate(y, [0, h], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: 1 - t,
      height: h * (1 - t),
      overflow: "hidden",
    };
  });

  if (!visible || !artwork) return null;

  return (
    <Animated.View style={[styles.identity, collapseStyle]} pointerEvents="none">
      <View
        onLayout={(e) => {
          const next = Math.ceil(e.nativeEvent.layout.height);
          if (next > 1) measured.value = next;
        }}
      >
        <ArtworkCredit
          artwork={artwork}
          theme={theme}
          fontsLoaded={loaded}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 24,
  },
  identity: {
    marginTop: SPACE["2xs"],
  },
});
