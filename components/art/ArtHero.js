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
}) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  const id = artworkId || theme?.artwork?.id;
  if (!id) return null;

  const visual = getArtVisual(id);
  const artwork = visual.meta || theme?.artwork || null;
  const asciiOn = theme?.ascii?.enabled !== false;
  const imageOpacity =
    theme?.visual?.imageOpacity ?? theme?.artwork?.imageOpacity ?? 0.34;
  const asciiOpacity = theme?.ascii?.opacity ?? theme?.visual?.asciiOpacity;

  if (!visual.image && !visual.ascii) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.plate}>
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
    marginTop: SPACE.md,
  },
  plate: {
    height: 220,
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
