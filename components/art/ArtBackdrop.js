// Full-canvas artwork environment for ArtThemes.
// Crossfades plates. Classic / custom / no-artwork themes render nothing.

import React, { memo, useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { getArtVisual } from "../../assets/art/registry";
import { useFontsLoaded } from "../../utils/fonts";
import { MOTION } from "../../utils/tokens";
import { hexToRgba } from "../../utils/color";
import { useReducedMotion } from "../../utils/motion";
import AsciiArtwork from "./AsciiArtwork";
import LivingCanvas from "./LivingCanvas";

function ArtImage({ visual, theme, opacity, scale, paused }) {
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const artwork = visual.meta || theme?.artwork || null;
  if (!visual.image) return null;
  return (
    <Animated.View style={[styles.imageWrap, style]}>
      <LivingCanvas active={!paused} layer="art">
        <Image
          source={visual.image}
          style={styles.image}
          resizeMode="cover"
          accessible={false}
          accessibilityElementsHidden
          accessibilityLabel={
            artwork
              ? `${artwork.title} by ${artwork.artist}, ${artwork.year}`
              : undefined
          }
        />
      </LivingCanvas>
    </Animated.View>
  );
}

function ArtAscii({ visual, theme, opacity, paused, fontsLoaded }) {
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  const asciiOn = theme?.ascii?.enabled !== false;
  const asciiOpacity =
    typeof theme?.visual?.asciiOpacity === "number"
      ? theme.visual.asciiOpacity
      : theme?.ascii?.opacity ?? 0.05;
  if (!asciiOn || !visual.ascii) return null;
  return (
    <Animated.View style={[styles.asciiLayer, style]}>
      <LivingCanvas active={!paused} layer="ascii" style={styles.fill}>
        <AsciiArtwork
          ascii={visual.ascii}
          theme={theme}
          opacity={asciiOpacity}
          fontsLoaded={fontsLoaded}
        />
      </LivingCanvas>
    </Animated.View>
  );
}

function resolvePlate(theme) {
  const id = theme?.artwork?.id || null;
  if (!id) return null;
  const visual = getArtVisual(id);
  if (!visual.image && !visual.ascii) return null;
  return { id, visual, theme };
}

function ArtBackdrop({
  theme,
  fontsLoaded,
  paused = false,
  reveal = false,
  expand = false,
}) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  const reduced = useReducedMotion();
  const plate = resolvePlate(theme);

  const [incoming, setIncoming] = useState(plate);
  const [outgoing, setOutgoing] = useState(null);
  const incomingOp = useSharedValue(reveal && !reduced ? 0 : 1);
  const incomingScale = useSharedValue(expand && !reduced ? 1.07 : 1);
  const incomingAscii = useSharedValue(reveal && !reduced ? 0 : 1);
  const outgoingOp = useSharedValue(0);
  const outgoingScale = useSharedValue(1);
  const outgoingAscii = useSharedValue(0);
  const lastId = useRef(plate?.id ?? null);
  const incomingRef = useRef(incoming);
  incomingRef.current = incoming;
  const firstPaint = useRef(true);

  useEffect(() => {
    const nextId = plate?.id ?? null;
    const fadeMs = reduced
      ? MOTION.reduced
      : reveal || expand
        ? MOTION.reveal
        : MOTION.crossfade;
    const easing = reduced ? Easing.linear : Easing.out(Easing.cubic);

    if (firstPaint.current) {
      firstPaint.current = false;
      lastId.current = nextId;
      incomingRef.current = plate;
      setIncoming(plate);
      if (plate && reveal && !reduced) {
        incomingOp.value = 0;
        incomingScale.value = 1.025;
        incomingAscii.value = 0;
        incomingOp.value = withTiming(1, { duration: fadeMs, easing });
        incomingScale.value = withTiming(1, { duration: fadeMs, easing });
        incomingAscii.value = withDelay(
          Math.floor(fadeMs * 0.28),
          withTiming(1, { duration: Math.floor(fadeMs * 0.72), easing }),
        );
      } else {
        incomingOp.value = plate ? 1 : 0;
        incomingScale.value = 1;
        incomingAscii.value = plate ? 1 : 0;
      }
      return;
    }

    if (nextId === lastId.current) {
      if (plate) {
        incomingRef.current = plate;
        setIncoming(plate);
      }
      return;
    }

    lastId.current = nextId;
    const prev = incomingRef.current;
    if (prev) setOutgoing(prev);
    outgoingOp.value = incomingOp.value || (prev ? 1 : 0);
    outgoingScale.value = 1;
    outgoingAscii.value = incomingAscii.value || (prev ? 1 : 0);
    outgoingOp.value = withTiming(0, { duration: fadeMs, easing }, (done) => {
      if (done) runOnJS(setOutgoing)(null);
    });
    outgoingAscii.value = withTiming(0, {
      duration: Math.max(MOTION.reduced, Math.floor(fadeMs * 0.65)),
      easing,
    });

    incomingRef.current = plate;
    setIncoming(plate);
    if (plate) {
      incomingOp.value = 0;
      incomingScale.value = expand && !reduced ? 1.07 : 1;
      incomingAscii.value = 0;
      incomingOp.value = withTiming(1, { duration: fadeMs, easing });
      incomingScale.value = withTiming(1, { duration: fadeMs, easing });
      incomingAscii.value = withDelay(
        reduced ? 0 : 90,
        withTiming(1, { duration: fadeMs, easing }),
      );
    } else {
      incomingOp.value = 0;
      incomingAscii.value = 0;
      incomingScale.value = 1;
    }
  }, [plate?.id, reveal, expand, reduced]);

  const veilOpacity =
    typeof theme?.visual?.paperVeilOpacity === "number"
      ? theme.visual.paperVeilOpacity
      : 0.74;
  const paper = theme?.bg || "#f6f3ec";
  const showVeil = !!(incoming || outgoing);
  const livePaused = paused || !!outgoing || reveal;

  if (!incoming && !outgoing) return null;

  return (
    <View
      pointerEvents="none"
      style={styles.root}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {outgoing ? (
        <ArtImage
          visual={outgoing.visual}
          theme={outgoing.theme}
          opacity={outgoingOp}
          scale={outgoingScale}
          paused
        />
      ) : null}
      {incoming ? (
        <ArtImage
          visual={incoming.visual}
          theme={incoming.theme}
          opacity={incomingOp}
          scale={incomingScale}
          paused={livePaused}
        />
      ) : null}
      {showVeil ? (
        <View
          style={[
            styles.veil,
            { backgroundColor: hexToRgba(paper, veilOpacity) },
          ]}
        />
      ) : null}
      {outgoing ? (
        <ArtAscii
          visual={outgoing.visual}
          theme={outgoing.theme}
          opacity={outgoingAscii}
          paused
          fontsLoaded={loaded}
        />
      ) : null}
      {incoming ? (
        <ArtAscii
          visual={incoming.visual}
          theme={incoming.theme}
          opacity={incomingAscii}
          paused={livePaused}
          fontsLoaded={loaded}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 0,
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
  },
  asciiLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 1,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default memo(ArtBackdrop);
