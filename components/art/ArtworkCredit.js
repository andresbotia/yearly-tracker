import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";

function shortMuseum(name) {
  if (!name) return "";
  if (/metropolitan/i.test(name)) return "The Met";
  if (/art institute of chicago/i.test(name)) return "Art Institute of Chicago";
  if (/national gallery of art/i.test(name)) return "National Gallery of Art";
  return name;
}

export default function ArtworkCredit({
  artwork,
  theme,
  fontsLoaded,
}) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  if (!artwork) return null;

  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";
  const metaLine = [artwork.artist, artwork.year, shortMuseum(artwork.museum)]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <View style={styles.wrap} accessibilityRole="text">
      {!!artwork.title && (
        <Text
          style={[
            styles.title,
            { color: ink, fontFamily: fontFamily("display", loaded) },
          ]}
        >
          {String(artwork.title).toUpperCase()}
        </Text>
      )}
      {!!metaLine && (
        <Text
          style={[
            styles.meta,
            { color: muted, fontFamily: fontFamily("data", loaded) },
          ]}
        >
          {metaLine}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: SPACE["3xs"],
  },
  title: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    fontStyle: "normal",
    lineHeight: 20,
  },
  meta: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.data,
    textTransform: "uppercase",
    lineHeight: 15,
  },
});
