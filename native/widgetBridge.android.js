import { NativeModules, Platform } from "react-native";

const MOD = NativeModules?.WidgetBridge;

export async function pushProgressWidgetPayload(payload) {
  if (Platform.OS !== "android") return;
  if (!MOD?.saveProgressWidgetJson || !MOD?.refreshProgressWidget) return;

  const json = typeof payload === "string" ? payload : JSON.stringify(payload);

  await MOD.saveProgressWidgetJson(json);
  await MOD.refreshProgressWidget();
}
