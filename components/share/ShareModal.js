// components/share/ShareModal.js
// Same options, capture, and native share. Visual language only.

import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import ViewShot from "react-native-view-shot";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import AtelierSheet, { AtelierActions } from "../atelier/AtelierSheet";

const ANDROID = Platform.OS === "android";

function OptionTile({ option, selected, theme, onPress, fontsLoaded }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionTile,
        {
          backgroundColor: selected ? theme.text : "transparent",
          borderColor: selected ? theme.text : theme.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.optionLabel,
          {
            color: selected ? theme.card || "#f6f3ec" : theme.text,
            fontFamily: fontFamily("data", fontsLoaded),
          },
        ]}
      >
        {option.label}
      </Text>
      {!!option.description && (
        <Text
          style={[
            styles.optionDesc,
            {
              color: selected ? theme.card || "#f6f3ec" : theme.mutedText,
              fontFamily: fontFamily("body", fontsLoaded),
            },
          ]}
        >
          {option.description}
        </Text>
      )}
    </Pressable>
  );
}

export default function ShareModal({
  visible,
  theme,
  options,
  shareOption,
  shareOptionId,
  onSelectOption,
  goals,
  habits,
  selectedShareGoal,
  selectedShareHabit,
  onSelectGoal,
  onSelectHabit,
  onClose,
  onShare,
  shareBusy,
  shareDisabled,
  shareShotRef,
  shareSize,
  shareCard,
}) {
  const fontsLoaded = useFontsLoaded();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <AtelierSheet
          theme={theme}
          kicker="[AT]  /  PRINT"
          title="Share"
          style={styles.sheet}
        >
          <Text
            style={[
              styles.subtext,
              {
                color: theme.mutedText,
                fontFamily: fontFamily("body", fontsLoaded),
              },
            ]}
          >
            Pick a card
          </Text>

          <View style={styles.grid}>
            {options.map((opt) => (
              <OptionTile
                key={opt.id}
                option={opt}
                selected={shareOptionId === opt.id}
                theme={theme}
                fontsLoaded={fontsLoaded}
                onPress={() => onSelectOption(opt.id)}
              />
            ))}
          </View>

          {shareOption?.kind === "goal" && (
            <View style={styles.pickSection}>
              <Text
                style={[
                  styles.pickLabel,
                  {
                    color: theme.mutedText,
                    fontFamily: fontFamily("data", fontsLoaded),
                  },
                ]}
              >
                Goal
              </Text>
              {goals.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pickRow}
                >
                  {goals.map((g) => {
                    const selected = g.id === selectedShareGoal?.id;
                    return (
                      <Pressable
                        key={g.id}
                        onPress={() => onSelectGoal(g.id)}
                        style={({ pressed }) => [
                          styles.pickChip,
                          {
                            backgroundColor: selected
                              ? theme.text
                              : "transparent",
                            borderColor: selected
                              ? theme.text
                              : theme.border,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickText,
                            {
                              color: selected
                                ? theme.card || "#f6f3ec"
                                : theme.text,
                              fontFamily: fontFamily("data", fontsLoaded),
                            },
                          ]}
                        >
                          {g.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : (
                <Text
                  style={[
                    styles.emptyHint,
                    {
                      color: theme.mutedText,
                      fontFamily: fontFamily("body", fontsLoaded),
                    },
                  ]}
                >
                  Add a goal to share this card.
                </Text>
              )}
            </View>
          )}

          {shareOption?.kind === "habit" && (
            <View style={styles.pickSection}>
              <Text
                style={[
                  styles.pickLabel,
                  {
                    color: theme.mutedText,
                    fontFamily: fontFamily("data", fontsLoaded),
                  },
                ]}
              >
                Habit
              </Text>
              {habits.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pickRow}
                >
                  {habits.map((h) => {
                    const selected = h.id === selectedShareHabit?.id;
                    return (
                      <Pressable
                        key={h.id}
                        onPress={() => onSelectHabit(h.id)}
                        style={({ pressed }) => [
                          styles.pickChip,
                          {
                            backgroundColor: selected
                              ? theme.text
                              : "transparent",
                            borderColor: selected
                              ? theme.text
                              : theme.border,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickText,
                            {
                              color: selected
                                ? theme.card || "#f6f3ec"
                                : theme.text,
                              fontFamily: fontFamily("data", fontsLoaded),
                            },
                          ]}
                        >
                          {h.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : (
                <Text
                  style={[
                    styles.emptyHint,
                    {
                      color: theme.mutedText,
                      fontFamily: fontFamily("body", fontsLoaded),
                    },
                  ]}
                >
                  Add a habit to share this card.
                </Text>
              )}
            </View>
          )}

          <AtelierActions
            theme={theme}
            cancelLabel="Back"
            confirmLabel={shareBusy ? "Preparing" : "Share"}
            onCancel={onClose}
            onConfirm={onShare}
            confirmDisabled={shareBusy || shareDisabled}
          />
        </AtelierSheet>

        <ViewShot
          ref={shareShotRef}
          options={{
            format: "png",
            quality: 1,
            result: "tmpfile",
            width: shareSize.width,
            height: shareSize.height,
          }}
          style={[
            styles.shareShot,
            { width: shareSize.width, height: shareSize.height },
          ]}
          collapsable={false}
        >
          {shareCard}
        </ViewShot>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(28,25,22,0.35)",
  },
  sheet: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: SPACE.lg,
    paddingBottom: ANDROID ? SPACE.lg : SPACE.xl,
    marginHorizontal: SPACE.sm,
    marginBottom: SPACE.sm,
  },
  title: {
    fontSize: TYPE_SIZE.title,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
    marginTop: SPACE["2xs"],
  },
  subtext: { marginTop: SPACE["2xs"], fontSize: TYPE_SIZE.caption },
  grid: {
    marginTop: SPACE.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE.sm,
  },
  optionTile: {
    width: "48%",
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.sm,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 4,
  },
  optionLabel: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  optionDesc: { fontSize: TYPE_SIZE.kicker, fontWeight: "400" },
  pickSection: { marginTop: SPACE.md },
  pickLabel: {
    fontSize: TYPE_SIZE.kicker,
    fontWeight: "600",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  pickRow: { paddingTop: SPACE.xs, gap: SPACE.xs },
  pickChip: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: SPACE.xs,
    paddingHorizontal: SPACE.sm,
  },
  pickText: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  emptyHint: { fontSize: TYPE_SIZE.caption, marginTop: SPACE["2xs"] },
  actions: {
    marginTop: SPACE.lg,
    flexDirection: "row",
    gap: SPACE.sm,
  },
  shareShot: { position: "absolute", left: -9999, top: -9999 },
});
