// Scroll-responsive identity. Uses Reanimated scroll values — no per-frame setState.
import React from "react";
import { View, StyleSheet } from "react-native";
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

export const HEADER_COLLAPSE = 40;

export function CollapsingKicker({ theme, year, fontsLoaded }) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  return (
    <MetadataLabel theme={theme} fontsLoaded={loaded}>
      {`[AT]  ATELIER TRACKER  /  ${year}`}
    </MetadataLabel>
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
    const y = scrollY.value;
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
  identity: {
    marginTop: SPACE["2xs"],
  },
});
