import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import MetadataLabel from "../editorial/MetadataLabel";
import SectionRule from "../editorial/SectionRule";
import EditorialButton from "../editorial/EditorialButton";

const OPTIONS = [
  {
    id: "fresh",
    label: "Simulate fresh install",
    note: "Presentation flags only. Goals, habits, history, and theme stay.",
  },
  {
    id: "old",
    label: "Simulate old Yearly Tracker user",
    note: "Rebrand intro, then visual-edition choice.",
  },
  {
    id: "earlier",
    label: "Simulate earlier revamp user",
    note: "Visual-edition choice only.",
  },
  {
    id: "replay",
    label: "Replay onboarding",
    note: "Catalogue tour only. Data and theme stay.",
  },
  {
    id: "theme",
    label: "Reset theme-choice prompt",
    note: "Clears the style-choice flag only.",
  },
];

export default function DevFirstRunQa({
  visible,
  theme,
  onClose,
  onSimulateFresh,
  onSimulateOldUser,
  onSimulateEarlierRevamp,
  onReplayOnboarding,
  onResetThemeChoice,
}) {
  const fontsLoaded = useFontsLoaded();
  const { height: windowHeight } = useWindowDimensions();
  if (!__DEV__) return null;
  if (!visible) return null;

  const ink = theme?.text || "#1c1916";
  const muted = theme?.mutedText || "#6b645c";
  const handlers = {
    fresh: onSimulateFresh,
    old: onSimulateOldUser,
    earlier: onSimulateEarlierRevamp,
    replay: onReplayOnboarding,
    theme: onResetThemeChoice,
  };

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
              borderColor: ink,
              maxHeight: Math.max(280, windowHeight - SPACE.md * 2),
            },
          ]}
        >
          <View style={[styles.accent, { backgroundColor: theme?.primary || ink }]} />
          <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
            [DEV] / FIRST-RUN STATES
          </MetadataLabel>
          <Text
            style={[
              styles.title,
              { color: ink, fontFamily: fontFamily("display", fontsLoaded) },
            ]}
          >
            First-run states
          </Text>
          <SectionRule theme={theme} style={styles.rule} />
          <Text
            style={[
              styles.note,
              { color: muted, fontFamily: fontFamily("body", fontsLoaded) },
            ]}
          >
            Presentation flags only. Goals, habits, history, custom themes, and
            the current theme are not deleted.
          </Text>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          >
            {OPTIONS.map((option, index) => (
              <View key={option.id} style={styles.option}>
                <EditorialButton
                  label={`${index + 1}. ${option.label}`}
                  theme={theme}
                  onPress={() => handlers[option.id]?.()}
                />
                <Text
                  style={[
                    styles.optionNote,
                    {
                      color: muted,
                      fontFamily: fontFamily("data", fontsLoaded),
                    },
                  ]}
                >
                  {option.note}
                </Text>
              </View>
            ))}
          </ScrollView>

          <EditorialButton
            label="6. Close"
            theme={theme}
            variant="primary"
            onPress={onClose}
          />
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
    flexShrink: 1,
    ...Platform.select({
      android: { elevation: 0 },
    }),
  },
  accent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
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
  note: {
    fontSize: TYPE_SIZE.body,
    fontWeight: "400",
    lineHeight: 22,
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  listContent: {
    gap: SPACE.sm,
    paddingBottom: SPACE.xs,
  },
  option: {
    gap: SPACE["2xs"],
  },
  optionNote: {
    fontSize: TYPE_SIZE.kicker,
    letterSpacing: TYPE_TRACK.data,
    textTransform: "uppercase",
  },
});
