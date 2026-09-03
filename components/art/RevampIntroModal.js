import React from "react";
import { Modal, View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import MetadataLabel from "../editorial/MetadataLabel";
import SectionRule from "../editorial/SectionRule";
import ArtHero from "./ArtHero";

const EXISTING = {
  kicker: "[AT]  /  New edition",
  title: "Yearly Tracker is now Atelier Tracker",
  body: [
    "Your goals, habits, and history are exactly where you left them.",
    "We’ve reimagined the experience around art, typography, and the idea of your year as a personal archive.",
    "Your data remains private and stored on your device.",
  ],
};

const FRESH = {
  kicker: "[AT]  /  Private yearly journal",
  title: "Welcome to Atelier Tracker",
  body: [
    "Track your habits, goals, and year through a quiet, art-led interface.",
    "No account. No tracking. Your data stays on your device.",
  ],
};

export default function RevampIntroModal({
  visible,
  theme,
  onClose,
  existingUser = false,
}) {
  const fontsLoaded = useFontsLoaded();
  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";
  const previewId = theme?.artwork?.id || "cypresses";
  const copy = existingUser ? EXISTING : FRESH;

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
            {copy.kicker}
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
            {copy.title}
          </Text>

          <SectionRule theme={theme} style={styles.rule} />

          {copy.body.map((paragraph) => (
            <Text
              key={paragraph}
              style={[
                styles.body,
                { color: muted, fontFamily: fontFamily("body", fontsLoaded) },
              ]}
            >
              {paragraph}
            </Text>
          ))}

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Enter Atelier"
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
              Enter Atelier
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
