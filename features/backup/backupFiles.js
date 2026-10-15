import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { MAX_BACKUP_BYTES } from "../../utils/backup";

export async function shareBackup(json, exportedAt) {
  const filename = `yearly-tracker-backup-${exportedAt.slice(0, 10)}.json`;
  if (Platform.OS === "web") {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
    return "download";
  }
  if (!(await Sharing.isAvailableAsync())) throw new Error("The share sheet is unavailable on this device.");
  const file = new File(Paths.cache, filename);
  file.write(json);
  await Sharing.shareAsync(file.uri, { mimeType: "application/json", UTI: "public.json", dialogTitle: "Export Yearly Tracker backup" });
  // Expo does not report whether the user saved the file or canceled sharing.
  return "sheetClosed";
}

export async function pickBackupText() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset) throw new Error("No file was selected.");
  if (asset.size != null && asset.size > MAX_BACKUP_BYTES) throw new Error("Backup exceeds the 10 MB file limit.");
  if (Platform.OS === "web") {
    if (!asset.file) throw new Error("The selected file could not be read.");
    return await asset.file.text();
  }
  const file = new File(asset.uri);
  if (file.size > MAX_BACKUP_BYTES) throw new Error("Backup exceeds the 10 MB file limit.");
  return await file.text();
}
