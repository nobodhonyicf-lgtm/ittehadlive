import { useState, useEffect } from "react";

/**
 * Detects if the app is running as a PWA (standalone) or inside Capacitor WebView.
 * Returns true for mobile app mode, false for regular browser.
 */
export const useIsApp = () => {
  const [isApp, setIsApp] = useState(() => {
    // Check standalone display mode (PWA)
    if (typeof window !== "undefined") {
      if (window.matchMedia("(display-mode: standalone)").matches) return true;
      // Check Capacitor
      if ((window as any).Capacitor?.isNativePlatform?.()) return true;
      // Check URL param for testing
      if (new URLSearchParams(window.location.search).get("app") === "1") return true;
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const handler = (e: MediaQueryListEvent) => setIsApp(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isApp;
};
