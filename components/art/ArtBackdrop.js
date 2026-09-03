// Full-canvas artwork environment for ArtThemes.
// One image per screen. Classic / custom / no-artwork themes render nothing.

import React, { memo } from "react";
import { View, Image, StyleSheet } from "react-native";
import { getArtVisual } from "../../assets/art/registry";
import { useFontsLoaded } from "../../utils/fonts";
import AsciiArtwork from "./AsciiArtwork";
import LivingCanvas from "./LivingCanvas";

function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== "string") return `rgba(246,243,236,${alpha})`;
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return `rgba(246,243,236,${alpha})`;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function ArtBackdrop({ theme, fontsLoaded }) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  const id = theme?.artwork?.id;
  if (!id) return null;

  const visual = getArtVisual(id);
  if (!visual.image && !visual.ascii) return null;

  const asciiOn = theme?.ascii?.enabled !== false;
  const veilOpacity =
    typeof theme?.visual?.paperVeilOpacity === "number"
      ? theme.visual.paperVeilOpacity
      : 0.74;
  const asciiOpacity =
    typeof theme?.visual?.asciiOpacity === "number"
      ? theme.visual.asciiOpacity
      : theme?.ascii?.opacity ?? 0.05;
  const paper = theme?.bg || "#f6f3ec";
  const artwork = visual.meta || theme?.artwork || null;

  return (
    <View
      pointerEvents="none"
      style={styles.root}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {visual.image ? (
        <LivingCanvas active layer="art">
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
      ) : null}

      <View
        style={[
          styles.veil,
          { backgroundColor: hexToRgba(paper, veilOpacity) },
        ]}
      />

      {asciiOn && visual.ascii ? (
        <LivingCanvas active layer="ascii" style={styles.asciiLayer}>
          <AsciiArtwork
            ascii={visual.ascii}
            theme={theme}
            opacity={asciiOpacity}
            fontsLoaded={loaded}
          />
        </LivingCanvas>
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
  },
});

export default memo(ArtBackdrop);
