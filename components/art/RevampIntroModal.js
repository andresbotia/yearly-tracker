import React from "react";
import { Modal, View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import MetadataLabel from "../editorial/MetadataLabel";
import SectionRule from "../editorial/SectionRule";
import ArtHero from "./ArtHero";

export default function RevampIntroModal({
  visible,
  theme,
  onClose,
}) {
  const fontsLoaded = useFontsLoaded();
  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";
  const previewId = theme?.artwork?.id || "cypresses";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme?.card || "#fbf8f1",
              borderColor: theme?.text || "#1c1916",
            },
          ]}
        >
          <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
            Yearly Tracker
          </MetadataLabel>

          <ArtHero
            theme={theme}
            artworkId={previewId}
            fontsLoaded={fontsLoaded}
            showCredit={false}
            height={96}
          />

          <Text
            style={[
              styles.title,
              { color: ink, fontFamily: fontFamily("display", fontsLoaded) },
            ]}
          >
            Meet the new Yearly Tracker
          </Text>

          <SectionRule theme={theme} style={styles.rule} />

          <Text
            style={[
              styles.body,
              { color: muted, fontFamily: fontFamily("body", fontsLoaded) },
            ]}
          >
            Same private, offline tracker. A new art-led way to see your year.
          </Text>
          <Text
            style={[
              styles.body,
              { color: muted, fontFamily: fontFamily("body", fontsLoaded) },
            ]}
          >
            Public-domain artwork, editorial typography, and subtle ASCII
            details now shape the experience. Your goals, habits, history, and
            data stay right here on your phone.
          </Text>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Explore the new look"
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: pressed
                  ? theme?.primaryPressed || ink
                  : theme?.primary || ink,
                borderColor: theme?.primary || ink,
              },
            ]}
          >
            <Text
              style={[
                styles.ctaLabel,
                {
                  color: theme?.primaryTextOn || "#f6f3ec",
                  fontFamily: fontFamily("data", fontsLoaded),
                },
              ]}
            >
              Explore the new look
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(28,25,22,0.42)",
    padding: SPACE.md,
    justifyContent: "center",
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: SPACE.lg,
    gap: SPACE.sm,
    ...Platform.select({
      android: { elevation: 0 },
    }),
  },
  title: {
    marginTop: SPACE.xs,
    fontSize: TYPE_SIZE.title,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  rule: {
    marginTop: SPACE.xs,
    marginBottom: SPACE.xs,
  },
  body: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "400",
    lineHeight: 22,
  },
  cta: {
    marginTop: SPACE.md,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
  },
  ctaLabel: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
    textAlign: "center",
  },
});
