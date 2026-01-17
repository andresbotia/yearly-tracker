import { NativeModules } from "react-native";

const { WidgetBridge } = NativeModules;

export async function updateProgressWidget(title, subtitle) {
  const json = JSON.stringify({
    title,
    subtitle,
    updatedAt: Date.now(),
  });

  await WidgetBridge.saveProgressWidgetJson(json);
  await WidgetBridge.refreshProgressWidget();
}
