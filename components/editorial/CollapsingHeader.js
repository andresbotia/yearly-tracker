// Scroll-responsive identity. Uses Reanimated scroll values — no per-frame setState.
import React from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import { useReducedMotion } from "../../utils/motion";
import MetadataLabel from "./MetadataLabel";
import ArtworkCredit from "../art/ArtworkCredit";

export const HEADER_COLLAPSE = 52;

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
  const ink = theme?.text || "#1c1916";

  const fadeStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    if (reduced) {
      const hidden = y > HEADER_COLLAPSE * 0.65;
      return {
        opacity: hidden ? 0 : 1,
        transform: [{ translateY: 0 }],
      };
    }
    const t = interpolate(y, [0, HEADER_COLLAPSE], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: 1 - t,
      transform: [{ translateY: -t * 10 }],
    };
  });

  if (!visible) return null;

  return (
    <Animated.View style={fadeStyle} pointerEvents="none">
      <Text
        style={[
          styles.title,
          { color: ink, fontFamily: fontFamily("display", loaded) },
        ]}
      >
        Atelier Tracker
      </Text>
      {artwork ? (
        <ArtworkCredit
          artwork={artwork}
          theme={theme}
          fontsLoaded={loaded}
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: TYPE_SIZE.display,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
    marginTop: SPACE["2xs"],
  },
});
