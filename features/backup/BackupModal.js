import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SPACE, TYPE_SIZE, fontFamily } from "../../utils/tokens";
import { useFontsLoaded } from "../../utils/fonts";
import AtelierSheet, { AtelierActions } from "../../components/atelier/AtelierSheet";
import { createBackup, parseBackup, backupPreview, restoreBackup } from "../../utils/backup";
import { pickBackupText, shareBackup } from "./backupFiles";

export default function BackupModal({ visible, theme, onClose, onRestored, onRecoveryRequired }) {
  const fontsLoaded = useFontsLoaded();
  const [busy, setBusy] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [message, setMessage] = useState("");

  function close() {
    if (busy) return;
    setCandidate(null);
    setMessage("");
    onClose();
  }

  async function exportBackup() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const json = await createBackup();
      const result = await shareBackup(json, JSON.parse(json).exportedAt);
      setMessage(result === "download" ? "Download started. Check your browser's downloads." :
        "Share sheet closed. Check Files or your chosen destination to confirm the backup was saved.");
    } catch (error) {
      setMessage(`Export failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function importBackup() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const text = await pickBackupText();
      if (text === null) return;
      const backup = parseBackup(text);
      setCandidate({ backup, preview: backupPreview(backup) });
    } catch (error) {
      setMessage(`Import failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function confirmRestore() {
    if (!candidate || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await restoreBackup(candidate.backup);
      setCandidate(null);
      await onRestored();
    } catch (error) {
      if (error.code === "RESTORE_RECOVERY_REQUIRED") {
        await onRecoveryRequired();
        return;
      }
      setMessage(error.message);
      setBusy(false);
    }
  }

  const textStyle = { color: theme.text, fontFamily: fontFamily("body", fontsLoaded) };
  const mutedStyle = { color: theme.mutedText, fontFamily: fontFamily("body", fontsLoaded) };
  const buttonStyle = { borderColor: theme.border, backgroundColor: theme.card };
  return (
    <Modal visible={visible} transparent animationType="fade" presentationStyle="overFullScreen" onRequestClose={close}>
      <View style={styles.backdrop}>
        <AtelierSheet theme={theme} kicker="DATA  /  BACKUP" title="Data & Backup">
          {candidate ? (
            <>
              <Text style={[styles.body, textStyle]}>Replace all current Yearly Tracker data with this backup?</Text>
              <Text style={[styles.detail, mutedStyle]}>Exported {new Date(candidate.preview.exportedAt).toLocaleString()}</Text>
              <Text style={[styles.detail, mutedStyle]}>
                {candidate.preview.goals} goals · {candidate.preview.habits} habits · {candidate.preview.history} past years · {candidate.preview.customThemes} custom themes
              </Text>
              <Text style={[styles.detail, mutedStyle]}>Your current data will be kept locally as a recovery snapshot before replacement.</Text>
              <AtelierActions theme={theme} cancelLabel="Cancel" confirmLabel="Replace data"
                onCancel={() => setCandidate(null)} onConfirm={confirmRestore} confirmDisabled={busy} />
            </>
          ) : (
            <>
              <Text style={[styles.body, mutedStyle]}>Your data stays on this device. Export a file to move it to another device or keep a personal copy.</Text>
              <Pressable accessibilityRole="button" disabled={busy} onPress={exportBackup} style={[styles.button, buttonStyle]}>
                <Text style={[styles.buttonText, textStyle]}>Export Backup</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={busy} onPress={importBackup} style={[styles.button, buttonStyle]}>
                <Text style={[styles.buttonText, textStyle]}>Import Backup</Text>
              </Pressable>
              <AtelierActions theme={theme} onConfirm={close} confirmLabel="Close" confirmDisabled={busy} />
            </>
          )}
          {busy ? <ActivityIndicator style={styles.status} color={theme.text} /> : null}
          {message ? <Text accessibilityRole="alert" style={[styles.status, mutedStyle]}>{message}</Text> : null}
        </AtelierSheet>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", padding: SPACE.md, backgroundColor: "rgba(0,0,0,0.48)" },
  body: { fontSize: TYPE_SIZE.body, lineHeight: 22, marginTop: SPACE.md },
  detail: { fontSize: TYPE_SIZE.body, lineHeight: 21, marginTop: SPACE.sm },
  button: { minHeight: 48, borderWidth: StyleSheet.hairlineWidth, justifyContent: "center", paddingHorizontal: SPACE.md, marginTop: SPACE.sm },
  buttonText: { fontSize: TYPE_SIZE.body },
  status: { marginTop: SPACE.md, fontSize: TYPE_SIZE.body, lineHeight: 20 },
});
