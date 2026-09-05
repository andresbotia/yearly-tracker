// Presentation-only motion and haptics. No persistence.
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";
import * as Haptics from "expo-haptics";
import { MOTION } from "./tokens";

const ReducedMotionContext = createContext(false);

export function ReducedMotionProvider({ children }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => {
        if (mounted) setReduced(!!v);
      })
      .catch(() => {});

    const sub = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      (v) => setReduced(!!v),
    );

    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  return (
    <ReducedMotionContext.Provider value={reduced}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}

export function motionDuration(ms, reduced) {
  if (reduced) return Math.min(ms, MOTION.reduced);
  return ms;
}

let lastTickAt = 0;

export async function hapticTick() {
  const now = Date.now();
  if (now - lastTickAt < 42) return;
  lastTickAt = now;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

export async function hapticSelect() {
  try {
    await Haptics.selectionAsync();
  } catch {}
}

export async function hapticSuccess() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}

export function useHoldRepeat(onStep) {
  const timerRef = useRef(null);
  const delayRef = useRef(280);
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  function clear() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    delayRef.current = 280;
  }

  function start(dir, immediate = true) {
    clear();
    if (immediate) onStepRef.current?.(dir);
    const tick = () => {
      onStepRef.current?.(dir);
      delayRef.current = Math.max(70, delayRef.current * 0.86);
      timerRef.current = setTimeout(tick, delayRef.current);
    };
    timerRef.current = setTimeout(tick, 420);
  }

  useEffect(() => clear, []);

  return { start, clear };
}

export function padCount(n, target) {
  const w = Math.max(String(Math.max(0, Math.floor(Number(target) || 0))).length, 3);
  return String(Math.max(0, Math.floor(Number(n) || 0))).padStart(w, "0");
}

export function scrubPixelsPerUnit(target) {
  const t = Math.max(1, Number(target) || 1);
  if (t <= 25) return 22;
  if (t <= 100) return 14;
  if (t <= 500) return 8;
  if (t <= 2000) return 4;
  return 2.4;
}
