// Compact artwork plate for gallery previews, intro crops, and share cards.
// Primary screens use ArtBackdrop instead of this plate.

import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { SPACE } from "../../utils/tokens";
import { getArtVisual } from "../../assets/art/registry";
import { useFontsLoaded } from "../../utils/fonts";
import AsciiArtwork from "./AsciiArtwork";
import ArtworkCredit from "./ArtworkCredit";

export default function ArtHero({
  theme,
  artworkId,
  fontsLoaded,
  showCredit = true,
  height = 120,
}) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  const id = artworkId || theme?.artwork?.id;
  if (!id) return null;

  const visual = getArtVisual(id);
  const artwork = visual.meta || theme?.artwork || null;
  const asciiOn = theme?.ascii?.enabled !== false;
  const imageOpacity =
    theme?.visual?.imageOpacity > 0
      ? Math.min(theme.visual.imageOpacity, 0.88)
      : 0.72;
  const asciiOpacity =
    theme?.visual?.previewAsciiOpacity ??
    theme?.visual?.asciiOpacity ??
    theme?.ascii?.opacity ??
    0.12;

  if (!visual.image && !visual.ascii) return null;

  return (
    <View style={styles.wrap}>
      <View style={[styles.plate, { height }]}>
        {visual.image ? (
          <Image
            source={visual.image}
            style={[styles.image, { opacity: imageOpacity }]}
            resizeMode="cover"
            accessible
            accessibilityLabel={
              artwork
                ? `${artwork.title} by ${artwork.artist}, ${artwork.year}`
                : "Artwork"
            }
          />
        ) : null}

        {asciiOn && visual.ascii ? (
          <View pointerEvents="none" style={styles.asciiLayer}>
            <AsciiArtwork
              ascii={visual.ascii}
              theme={theme}
              opacity={asciiOpacity}
              fontsLoaded={loaded}
            />
          </View>
        ) : null}
      </View>

      {showCredit ? (
        <ArtworkCredit
          artwork={artwork}
          theme={theme}
          fontsLoaded={loaded}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: SPACE.sm,
  },
  plate: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  asciiLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    overflow: "hidden",
  },
});
