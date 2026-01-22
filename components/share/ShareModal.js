// components/share/ShareModal.js

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
import { Ionicons } from "@expo/vector-icons";
import ViewShot from "react-native-view-shot";

const ANDROID = Platform.OS === "android";

function OptionTile({ option, selected, theme, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionTile,
        {
          backgroundColor: selected
            ? pressed
              ? theme.primaryPressed
              : theme.primary
            : pressed
              ? theme.border
              : theme.bg,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}
    >
      {selected && (
        <View
          style={[
            styles.optionCheck,
            { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
        >
          <Ionicons name="checkmark" size={12} color={theme.primaryTextOn} />
        </View>
      )}
      <Ionicons
        name={option.icon}
        size={22}
        color={selected ? theme.primaryTextOn : theme.text}
      />
      <Text
        style={[
          styles.optionLabel,
          { color: selected ? theme.primaryTextOn : theme.text },
        ]}
      >
        {option.label}
      </Text>
      {!!option.description && (
        <Text
          style={[
            styles.optionDesc,
            {
              color: selected ? theme.primaryTextOn : theme.mutedText,
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
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: "#000",
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.text }]}>Share</Text>
          <Text style={[styles.subtext, { color: theme.mutedText }]}>
            Pick a card
          </Text>

          <View style={styles.grid}>
            {options.map((opt) => (
              <OptionTile
                key={opt.id}
                option={opt}
                selected={shareOptionId === opt.id}
                theme={theme}
                onPress={() => onSelectOption(opt.id)}
              />
            ))}
          </View>
          {/* <Text style={[styles.tipText, { color: theme.mutedText }]}>
            Tip: Looks best on a solid background.
          </Text> */}

          {shareOption?.kind === "goal" && (
            <View style={styles.pickSection}>
              <Text style={[styles.pickLabel, { color: theme.mutedText }]}>
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
                              ? pressed
                                ? theme.primaryPressed
                                : theme.primary
                              : pressed
                                ? theme.border
                                : theme.bg,
                            borderColor: selected
                              ? theme.primary
                              : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickText,
                            {
                              color: selected
                                ? theme.primaryTextOn
                                : theme.text,
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
                <Text style={[styles.emptyHint, { color: theme.mutedText }]}>
                  Add a goal to share this card.
                </Text>
              )}
            </View>
          )}

          {shareOption?.kind === "habit" && (
            <View style={styles.pickSection}>
              <Text style={[styles.pickLabel, { color: theme.mutedText }]}>
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
                              ? pressed
                                ? theme.primaryPressed
                                : theme.primary
                              : pressed
                                ? theme.border
                                : theme.bg,
                            borderColor: selected
                              ? theme.primary
                              : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickText,
                            {
                              color: selected
                                ? theme.primaryTextOn
                                : theme.text,
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
                <Text style={[styles.emptyHint, { color: theme.mutedText }]}>
                  Add a habit to share this card.
                </Text>
              )}
            </View>
          )}

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.secondaryBtn,
                {
                  backgroundColor: pressed ? theme.border : theme.bg,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.secondaryText, { color: theme.text }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onShare}
              disabled={shareBusy || shareDisabled}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: pressed
                    ? theme.primaryPressed
                    : theme.primary,
                  borderColor: theme.primary,
                  opacity: shareBusy || shareDisabled ? 0.6 : 1,
                },
              ]}
            >
              <Text
                style={[styles.primaryText, { color: theme.primaryTextOn }]}
              >
                {shareBusy ? "Preparing..." : "Share"}
              </Text>
            </Pressable>
          </View>
        </View>

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
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 18,
    paddingBottom: ANDROID ? 18 : 26,
    marginHorizontal: 10,
    marginBottom: 10,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: ANDROID ? 12 : 0,
  },
  title: { fontSize: 18, fontWeight: "900", letterSpacing: 0.3 },
  subtext: { marginTop: 6, fontSize: 13, lineHeight: 18 },
  grid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionTile: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    position: "relative",
  },
  optionLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 0.2 },
  optionDesc: { fontSize: 10, fontWeight: "700" },
  optionCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pickSection: { marginTop: 14 },
  pickLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 0.2 },
  pickRow: { paddingTop: 8, gap: 8 },
  pickChip: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pickText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.2 },
  emptyHint: { fontSize: 12, marginTop: 6 },
  actions: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  tipText: { marginTop: 10, fontSize: 11 },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: { fontSize: 12, fontWeight: "900", letterSpacing: 0.2 },
  primaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: { fontSize: 12, fontWeight: "900", letterSpacing: 0.2 },
  shareShot: { position: "absolute", left: -9999, top: -9999 },
});
