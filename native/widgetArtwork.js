// Shares the currently resolved artwork with native widgets.
// Widgets never pick Random Art themselves — the app is the authority.
import { Image, NativeModules, Platform } from "react-native";
import { ART_IMAGES } from "../assets/art/images";

export const WIDGET_ARTWORK_FILENAME = "atelier-widget-background.jpg";

let lastSharedId = null;

function bridge() {
  if (Platform.OS === "ios") return NativeModules?.WidgetBridge ?? null;
  if (Platform.OS === "android") return NativeModules?.WidgetBridgeAndroid ?? null;
  return null;
}

async function callNative(fn, ...args) {
  if (typeof fn !== "function") return;
  const result = fn(...args);
  if (result && typeof result.then === "function") {
    await result;
  }
}

export function resolveArtworkUri(artId) {
  if (!artId) return null;
  const mod = ART_IMAGES[artId];
  if (!mod) return null;
  const src = Image.resolveAssetSource(mod);
  return src?.uri || null;
}

export function widgetArtworkIdFromTheme(theme) {
  const id = theme?.artwork?.id;
  if (!id || theme?.kind !== "art") return "";
  if (!ART_IMAGES[id]) return "";
  return String(id);
}

export async function prepareWidgetArtwork(artId) {
  const native = bridge();
  const id = artId ? String(artId) : "";

  try {
    if (!id) {
      if (lastSharedId !== null) {
        await callNative(native?.clearWidgetArtwork?.bind(native));
      }
      lastSharedId = null;
      return;
    }

    if (id === lastSharedId) return;

    const uri = resolveArtworkUri(id);
    if (!uri || !native?.setWidgetArtwork) {
      await callNative(native?.clearWidgetArtwork?.bind(native));
      lastSharedId = null;
      return;
    }

    await callNative(native.setWidgetArtwork.bind(native), uri, id);
    lastSharedId = id;
  } catch (e) {
    lastSharedId = null;
    console.log("Widget artwork share failed:", e);
  }
}
