import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import MetadataLabel from "./MetadataLabel";

export default function EditorialEmpty({
  kicker,
  title,
  body,
  theme,
  children,
}) {
  const fontsLoaded = useFontsLoaded();
  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";

  return (
    <View style={styles.wrap}>
      {!!kicker && (
        <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
          {kicker}
        </MetadataLabel>
      )}
      {!!title && (
        <Text
          style={[
            styles.title,
            { color: ink, fontFamily: fontFamily("display", fontsLoaded) },
          ]}
        >
          {title}
        </Text>
      )}
      {!!body && (
        <Text
          style={[
            styles.body,
            { color: muted, fontFamily: fontFamily("body", fontsLoaded) },
          ]}
        >
          {body}
        </Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: SPACE["2xl"],
    paddingHorizontal: SPACE.md,
    alignItems: "flex-start",
    gap: SPACE.xs,
  },
  title: {
    fontSize: TYPE_SIZE.title,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  body: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "400",
    lineHeight: 22,
    maxWidth: 280,
  },
});
