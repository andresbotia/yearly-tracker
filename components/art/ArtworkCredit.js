import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";

export default function ArtworkCredit({
  artwork,
  theme,
  fontsLoaded = false,
}) {
  if (!artwork) return null;

  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";

  return (
    <View style={styles.wrap} accessibilityRole="text">
      {!!artwork.title && (
        <Text
          style={[
            styles.title,
            { color: ink, fontFamily: fontFamily("display", fontsLoaded) },
          ]}
        >
          {String(artwork.title).toUpperCase()}
        </Text>
      )}
      {!!artwork.artist && (
        <Text
          style={[
            styles.artist,
            { color: muted, fontFamily: fontFamily("body", fontsLoaded) },
          ]}
        >
          {artwork.artist}
        </Text>
      )}
      <Text style={[styles.meta, { color: muted }]}>
        {[artwork.year, artwork.museum].filter(Boolean).join("  ·  ")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: SPACE.sm,
    gap: SPACE["2xs"],
  },
  title: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    fontStyle: "normal",
  },
  artist: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "400",
  },
  meta: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.data,
    textTransform: "uppercase",
  },
});
