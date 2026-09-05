import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import MetadataLabel from "../editorial/MetadataLabel";
import PressableInk from "../motion/PressableInk";

export function AtelierActions({
  theme,
  cancelLabel = "Cancel",
  confirmLabel = "Save",
  onCancel,
  onConfirm,
  confirmDisabled = false,
}) {
  const fontsLoaded = useFontsLoaded();
  const ink = theme?.text || "#1c1916";

  return (
    <View style={styles.actions}>
      {onCancel ? (
        <PressableInk
          onPress={onCancel}
          style={[styles.action, { borderColor: ink }]}
          innerStyle={styles.actionInner}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        >
          <Text
            style={[
              styles.actionText,
              { color: ink, fontFamily: fontFamily("data", fontsLoaded) },
            ]}
          >
            {cancelLabel}
          </Text>
        </PressableInk>
      ) : null}
      <PressableInk
        onPress={onConfirm}
        disabled={confirmDisabled}
        haptic="select"
        style={[
          styles.action,
          styles.actionPrimary,
          {
            backgroundColor: theme?.primary || ink,
            borderColor: theme?.primary || ink,
          },
        ]}
        innerStyle={styles.actionInner}
        accessibilityRole="button"
        accessibilityLabel={confirmLabel}
      >
        <Text
          style={[
            styles.actionText,
            {
              color: theme?.primaryTextOn || "#f6f3ec",
              fontFamily: fontFamily("data", fontsLoaded),
            },
          ]}
        >
          {confirmLabel}
        </Text>
      </PressableInk>
    </View>
  );
}

export function AtelierToggle({ theme, value, options, onChange }) {
  const fontsLoaded = useFontsLoaded();
  const ink = theme?.text || "#1c1916";
  const paper = theme?.card || "#fbf8f1";

  return (
    <View style={styles.toggleRow}>
      {(options || []).map((opt) => {
        const on = value === opt.value;
        return (
          <PressableInk
            key={String(opt.value)}
            onPress={() => onChange?.(opt.value)}
            haptic="tick"
            style={[
              styles.toggle,
              {
                borderColor: on ? ink : theme?.border || "#d8d0c4",
                backgroundColor: on ? ink : "transparent",
              },
            ]}
            innerStyle={styles.actionInner}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={opt.label}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color: on ? paper : ink,
                  fontFamily: fontFamily("data", fontsLoaded),
                },
              ]}
            >
              {opt.label}
            </Text>
          </PressableInk>
        );
      })}
    </View>
  );
}

export function AtelierField({ theme, style, ...rest }) {
  const fontsLoaded = useFontsLoaded();
  const ink = theme?.text || "#1c1916";
  return (
    <TextInput
      placeholderTextColor={theme?.mutedText || "#6b645c"}
      style={[
        styles.field,
        {
          borderColor: ink,
          color: ink,
          fontFamily: fontFamily("body", fontsLoaded),
        },
        style,
      ]}
      {...rest}
    />
  );
}

export default function AtelierSheet({
  theme,
  kicker,
  title,
  children,
  style,
}) {
  const fontsLoaded = useFontsLoaded();
  const ink = theme?.text || "#1c1916";
  const paper = theme?.card || "#fbf8f1";
  const wash = theme?.primary || ink;

  return (
    <View
      style={[
        styles.sheet,
        {
          backgroundColor: paper,
          borderColor: ink,
        },
        style,
      ]}
    >
      <View style={[styles.topRule, { backgroundColor: wash }]} />
      <View
        pointerEvents="none"
        style={[styles.tint, { backgroundColor: wash }]}
      />
      {kicker ? (
        <MetadataLabel theme={theme} fontsLoaded={fontsLoaded}>
          {kicker}
        </MetadataLabel>
      ) : null}
      {title ? (
        <Text
          style={[
            styles.title,
            {
              color: ink,
              fontFamily: fontFamily("display", fontsLoaded),
              marginTop: kicker ? SPACE["2xs"] : 0,
            },
          ]}
        >
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: SPACE.lg,
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 0 },
    }),
  },
  topRule: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  tint: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  title: {
    fontSize: TYPE_SIZE.title,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  actions: {
    marginTop: SPACE.md,
    flexDirection: "row",
    gap: SPACE.sm,
  },
  action: {
    flex: 1,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACE.sm,
  },
  actionInner: {
    minHeight: 44,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  actionPrimary: {},
  actionText: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  toggleRow: {
    marginTop: SPACE.sm,
    flexDirection: "row",
    gap: SPACE.sm,
  },
  toggle: {
    flex: 1,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACE.sm,
  },
  toggleText: {
    fontSize: TYPE_SIZE.caption,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.kicker,
    textTransform: "uppercase",
  },
  field: {
    marginTop: SPACE.xs,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: SPACE.sm,
    fontSize: TYPE_SIZE.body,
  },
});
