// features/share/shareCapture.js

import { Share } from "react-native";

export async function captureAndShare(viewShotRef, { message } = {}) {
  if (!viewShotRef?.current?.capture) return false;
  try {
    const uri = await viewShotRef.current.capture();
    if (!uri) return false;
    await Share.share({ url: uri, message: message || "" });
    return true;
  } catch {
    return false;
  }
}
