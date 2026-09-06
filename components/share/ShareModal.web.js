import React from "react";
import { Modal, Text } from "react-native";
import AtelierSheet, { AtelierActions } from "../atelier/AtelierSheet";

// View capture and native image sharing are intentionally native-only.
export default function ShareModal({ visible, theme, onClose }) {
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <div style={{ height: "100%", display: "grid", alignItems: "end", background: "#0006", padding: 16 }}>
        <AtelierSheet theme={theme} title="Share">
          <Text style={{ color: theme.text, marginVertical: 16 }}>
            Image sharing is available in the iOS and Android app.
          </Text>
          <AtelierActions theme={theme} confirmLabel="Close" onConfirm={onClose} />
        </AtelierSheet>
      </div>
    </Modal>
  );
}
