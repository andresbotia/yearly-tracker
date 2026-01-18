// native/widgetBridge.android.js
import { NativeModules, Platform } from "react-native";

const M = NativeModules.WidgetBridgeAndroid;

function assertAndroid() {
  if (Platform.OS !== "android") return false;
  const M = getM();
  if (!M) {
    console.log(
      "WidgetBridgeAndroid native module not found. Rebuild dev client?"
    );
    return false;
  }
  return true;
}

function getM() {
  return NativeModules.WidgetBridgeAndroid;
}
// ✅ Backwards-compatible wrapper (prevents your current crash)
export function pushWidgetPayloadAndroid(payloadObj) {
  if (!assertAndroid()) return;
  const M = getM();
  const widgetType = payloadObj?.widgetType;
  const json = JSON.stringify(payloadObj);

  switch (widgetType) {
    case "goals_list":
      return M.pushGoalsListWidgetPayload?.(json);
    case "habits":
      return M.pushHabitsWidgetPayload?.(json);
    case "goal_highlight":
      return M.pushGoalHighlightWidgetPayload?.(json);
    case "yearly_progress":
    default:
      return M.pushProgressWidgetPayload?.(json);
  }
}

// Explicit methods (nice to have)
export function pushProgressWidgetPayloadAndroid(payloadObj) {
  if (!assertAndroid()) return;
  return M.pushProgressWidgetPayload?.(JSON.stringify(payloadObj));
}

export function pushGoalsListWidgetPayloadAndroid(payloadObj) {
  if (!assertAndroid()) return;
  return M.pushGoalsListWidgetPayload?.(JSON.stringify(payloadObj));
}

export function pushHabitsWidgetPayloadAndroid(payloadObj) {
  if (!assertAndroid()) return;
  return M.pushHabitsWidgetPayload?.(JSON.stringify(payloadObj));
}

export function pushGoalHighlightWidgetPayloadAndroid(payloadObj) {
  if (!assertAndroid()) return;
  return M.pushGoalHighlightWidgetPayload?.(JSON.stringify(payloadObj));
}
