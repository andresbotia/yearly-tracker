import React, { useState } from "react";
import { Modal, View, Text, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import AtelierSheet, { AtelierActions } from "../../components/atelier/AtelierSheet";
import { useFontsLoaded } from "../../utils/fonts";
import { SPACE, TYPE_SIZE, TYPE_TRACK, fontFamily } from "../../utils/tokens";

const STEPS = [
  ["01", "Export your data", "Tap Data in Habits or Goals, then choose Export Backup. Save the file to Files or share it with your new phone."],
  ["02", "Restore on your new phone", "Open Data → Import Backup, select your saved file, and confirm the restore."],
];

export default function BackupAnnouncementModal({ visible, theme, onDismiss }) {
  const fontsLoaded = useFontsLoaded();
  const { height } = useWindowDimensions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function dismiss() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await onDismiss();
    } catch {
      setError("Could not save your choice. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const body = { color: theme.text, fontFamily: fontFamily("body", fontsLoaded) };
  const muted = { color: theme.mutedText, fontFamily: fontFamily("body", fontsLoaded) };
  const data = { color: theme.mutedText, fontFamily: fontFamily("data", fontsLoaded) };

  return (
    <Modal visible={visible} transparent animationType="fade" presentationStyle="overFullScreen" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <ScrollView style={{ maxHeight: height - SPACE.md * 2 }} contentContainerStyle={styles.scrollContent} bounces={false}>
          <AtelierSheet theme={theme} kicker="NEW IN VERSION 2.1" title="Your Progress, Your Backup.">
            <Text style={[styles.description, body]}>
              Moving to a new phone? You can now export and restore your Yearly Tracker data without creating an account.
            </Text>
            {STEPS.map(([number, title, description]) => (
              <View key={number} style={[styles.step, { borderTopColor: theme.border }]}>
                <Text style={[styles.stepNumber, data]}>{number}</Text>
                <View style={styles.stepCopy}>
                  <Text style={[styles.stepTitle, body]}>{title}</Text>
                  <Text style={[styles.stepDescription, muted]}>{description}</Text>
                </View>
              </View>
            ))}
            <Text style={[styles.footer, muted]}>Your data stays local. No accounts or servers required.</Text>
            {error ? <Text accessibilityRole="alert" style={[styles.error, body]}>{error}</Text> : null}
            <AtelierActions theme={theme} confirmLabel="Got it" onConfirm={dismiss} confirmDisabled={busy} />
          </AtelierSheet>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", padding: SPACE.md, backgroundColor: "rgba(0,0,0,0.48)" },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  description: { marginTop: SPACE.md, fontSize: TYPE_SIZE.body, lineHeight: 22 },
  step: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, marginTop: SPACE.md, paddingTop: SPACE.sm },
  stepNumber: { width: SPACE.xl, fontSize: TYPE_SIZE.kicker, letterSpacing: TYPE_TRACK.kicker, paddingTop: SPACE["2xs"] },
  stepCopy: { flex: 1 },
  stepTitle: { fontSize: TYPE_SIZE.body, fontWeight: "700" },
  stepDescription: { marginTop: SPACE["2xs"], fontSize: TYPE_SIZE.body, lineHeight: 21 },
  footer: { marginTop: SPACE.md, fontSize: TYPE_SIZE.body, lineHeight: 21 },
  error: { marginTop: SPACE.sm, fontSize: TYPE_SIZE.body },
});
