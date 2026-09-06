import { useEffect } from "react";

// Explicit opt-in; no storage access, seeding, or parent-controlled mutations.
export function useDemoBridge(ready) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parent = params.get("portfolioOrigin");
    if (!ready || !parent || window.parent === window) return;
    let origin;
    try {
      const target = new URL(parent);
      if (!["http:", "https:"].includes(target.protocol)) return;
      origin = target.origin;
    } catch { return; }
    const send = (type) => window.parent.postMessage({ type }, origin);
    const message = (event) => {
      if (event.source === window.parent && event.origin === origin &&
          event.data?.type === "yearly-tracker:ping") send("yearly-tracker:ready");
    };
    const key = (event) => {
      // React Native Web gives its active Modal this semantic role. Let its
      // own Escape handler dismiss the inner sheet before closing the demo.
      if (event.key === "Escape" &&
          !document.querySelector('[role="dialog"][aria-modal="true"]')) {
        event.preventDefault();
        send("yearly-tracker:close");
      }
    };
    window.addEventListener("message", message);
    window.addEventListener("keydown", key, true);
    send("yearly-tracker:ready");
    return () => {
      window.removeEventListener("message", message);
      window.removeEventListener("keydown", key, true);
    };
  }, [ready]);
}
