import { NativeModules, Platform } from "react-native";

const MOD = NativeModules?.WidgetBridge;

export async function pushAndroidWidgetPayload(payloadObj) {
  if (Platform.OS !== "android") return;
  if (!MOD?.saveWidgetPayloadJson || !MOD?.refreshAllWidgets) return;

  const json = JSON.stringify(payloadObj);
  await MOD.saveWidgetPayloadJson(json);
  await MOD.refreshAllWidgets();
}
