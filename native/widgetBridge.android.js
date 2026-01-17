// native/widgetBridge.android.js
import { NativeModules, Platform } from "react-native";

const NativeWidgetBridgeAndroid = NativeModules.WidgetBridgeAndroid;

function assertAvailable() {
  if (Platform.OS !== "android") return false;

  if (!NativeWidgetBridgeAndroid) {
    console.log(
      "WidgetBridgeAndroid native module not found. Did you rebuild the dev client?"
    );
    return false;
  }

  if (typeof NativeWidgetBridgeAndroid.pushWidgetPayload !== "function") {
    console.log(
      "WidgetBridgeAndroid.pushWidgetPayload missing. Native method name mismatch."
    );
    return false;
  }

  return true;
}

/**
 * Push ONE payload JSON string to Android shared prefs + refresh all widgets
 */
export async function pushWidgetPayloadAndroid(payloadObj) {
  if (!assertAvailable()) return;

  const json = JSON.stringify(payloadObj);
  return NativeWidgetBridgeAndroid.pushWidgetPayload(json);
}
