// Enter / exit / layout motion for catalogue rows. Presentation only.
import React from "react";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { MOTION } from "../../utils/tokens";
import { useReducedMotion } from "../../utils/motion";

export default function AnimatedListItem({
  children,
  style,
  dragging = false,
}) {
  const reduced = useReducedMotion();
  const duration = reduced ? MOTION.reduced : MOTION.interaction;
  const entering = reduced
    ? FadeIn.duration(duration)
    : FadeInDown.duration(duration).easing(Easing.out(Easing.cubic));
  const exiting = FadeOut.duration(reduced ? MOTION.reduced : MOTION.short);
  const layout =
    dragging || reduced
      ? undefined
      : LinearTransition.duration(duration).easing(Easing.out(Easing.cubic));

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      layout={layout}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

export function listEntering(reduced) {
  const duration = reduced ? MOTION.reduced : MOTION.interaction;
  return reduced
    ? FadeIn.duration(duration)
    : FadeInDown.duration(duration).easing(Easing.out(Easing.cubic));
}

export function listExiting(reduced) {
  return FadeOut.duration(reduced ? MOTION.reduced : MOTION.short);
}

export function listLayout(reduced) {
  if (reduced) return undefined;
  return LinearTransition.duration(MOTION.interaction).easing(
    Easing.out(Easing.cubic),
  );
}
