import React from "react";
import { Pressable, Text, StyleSheet, Platform } from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";

export default function EditorialButton({
  label,
  onPress,
  theme,
  variant = "secondary",
  disabled = false,
  style,
  accessibilityLabel,
}) {
  const fontsLoaded = useFontsLoaded();
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.btn,
        isGhost && styles.ghost,
        {
          backgroundColor: isGhost
            ? "transparent"
            : isPrimary
              ? theme.primary
              : theme.bg || theme.card,
          borderColor: isGhost
            ? "transparent"
            : isPrimary
              ? theme.primary
              : theme.text,
          opacity: disabled ? 0.45 : pressed ? 0.65 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: isPrimary ? theme.primaryTextOn : theme.text,
            fontFamily: fontFamily("data", fontsLoaded),
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    ...Platform.select({
      android: { elevation: 0 },
    }),
  },
  ghost: {
    minHeight: 36,
    paddingHorizontal: SPACE.xs,
    paddingVertical: SPACE["2xs"],
  },
  label: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
    fontStyle: "normal",
  },
});
