import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import MetadataLabel from "./MetadataLabel";

export default function EditorialHeader({
  kicker,
  title,
  meta,
  theme,
  fontsLoaded,
}) {
  const loaded = useFontsLoaded() || !!fontsLoaded;
  const ink = theme?.text || "#1c1916";

  return (
    <View style={styles.wrap}>
      {!!kicker && (
        <MetadataLabel theme={theme} fontsLoaded={loaded}>
          {kicker}
        </MetadataLabel>
      )}
      {!!title && (
        <Text
          style={[
            styles.title,
            { color: ink, fontFamily: fontFamily("display", loaded) },
          ]}
        >
          {title}
        </Text>
      )}
      {!!meta && (
        <Text
          style={[
            styles.meta,
            {
              color: theme?.mutedText || "#6b645c",
              fontFamily: fontFamily("body", loaded),
            },
          ]}
        >
          {meta}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: SPACE["2xs"],
  },
  title: {
    fontSize: TYPE_SIZE.display,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  meta: {
    marginTop: SPACE["3xs"],
    fontSize: TYPE_SIZE.caption,
    fontWeight: "400",
  },
});
