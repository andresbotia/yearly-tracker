import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SPACE, TYPE_SIZE, TYPE_TRACK, MOTION, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import { useReducedMotion } from "../../utils/motion";
import MetadataLabel from "../editorial/MetadataLabel";

export default function AtelierDrawer({
  visible,
  onClose,
  theme,
  kicker,
  title,
  children,
  footer,
}) {
  const fontsLoaded = useFontsLoaded();
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);
  const ink = theme?.text || "#1c1916";

  useEffect(() => {
    if (visible) setShown(true);
    progress.value = withTiming(
      visible ? 1 : 0,
      {
        duration: reduced ? MOTION.reduced : MOTION.interaction,
        easing: reduced ? Easing.linear : Easing.out(Easing.cubic),
      },
      (done) => {
        if (done && !visible) runOnJS(setShown)(false);
      },
    );
  }, [visible, reduced, progress]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: reduced ? 0 : (1 - progress.value) * 28,
      },
    ],
    opacity: progress.value,
  }));

  const dimStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.36,
  }));

  return (
    <Modal
      visible={shown}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            pointerEvents="none"
            style={[styles.dim, dimStyle]}
          />
        </Pressable>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme?.card || "#fbf8f1",
              borderColor: ink,
            },
            sheetStyle,
          ]}
        >
          <SafeAreaView>
            <View style={[styles.handle, { backgroundColor: theme?.border }]} />
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
                {String(title).toUpperCase()}
              </Text>
            )}
            <View style={styles.body}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28,25,22,1)",
  },
  sheet: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACE.md,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.lg,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: StyleSheet.hairlineWidth,
    marginBottom: SPACE.sm,
  },
  title: {
    marginTop: SPACE["2xs"],
    fontSize: TYPE_SIZE.bodyLg,
    fontWeight: "700",
    letterSpacing: TYPE_TRACK.display,
    fontStyle: "normal",
  },
  body: {
    marginTop: SPACE.md,
  },
  footer: {
    marginTop: SPACE.md,
  },
});
