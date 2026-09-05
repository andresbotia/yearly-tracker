import React from "react";
import { Modal, View, Text, StyleSheet, Platform } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import MetadataLabel from "../editorial/MetadataLabel";
import SectionRule from "../editorial/SectionRule";
import EditorialButton from "../editorial/EditorialButton";
import BrandMark from "../brand/BrandMark";

export default function RevampThemeChoiceModal({
  visible,
  theme,
  onTryRandomArt,
  onKeepCurrent,
}) {
  const fontsLoaded = useFontsLoaded();
  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onKeepCurrent}
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
          <BrandMark size={32} />
          <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
            New visual edition
          </MetadataLabel>

          <Text
            style={[
              styles.title,
              { color: ink, fontFamily: fontFamily("display", fontsLoaded) },
            ]}
          >
            Try the new Yearly canvas?
          </Text>

          <SectionRule theme={theme} style={styles.rule} />

          <Text
            style={[
              styles.body,
              { color: muted, fontFamily: fontFamily("body", fontsLoaded) },
            ]}
          >
            Yearly Tracker can now rotate artwork from the collection as the
            background of your yearly journal. You can try it now or keep your
            current theme.
          </Text>

          <View style={styles.actions}>
            <EditorialButton
              label="Try Random Art"
              theme={theme}
              variant="primary"
              onPress={onTryRandomArt}
            />
            <EditorialButton
              label="Keep my current theme"
              theme={theme}
              onPress={onKeepCurrent}
            />
          </View>
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
  actions: {
    marginTop: SPACE.md,
    gap: SPACE.xs,
  },
});
