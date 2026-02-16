import { useState, useEffect } from "react";

const APP_MODE_KEY = "ittehad_app_mode";

/**
 * Detects if the app is running as a PWA (standalone) or inside Capacitor WebView.
 * Persists app mode in sessionStorage so navigation doesn't lose context.
 */
export const useIsApp = () => {
  const [isApp, setIsApp] = useState(() => {
    if (typeof window === "undefined") return false;

    // Check standalone display mode (PWA)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      sessionStorage.setItem(APP_MODE_KEY, "1");
      return true;
    }
    // Check Capacitor
    if ((window as any).Capacitor?.isNativePlatform?.()) {
      sessionStorage.setItem(APP_MODE_KEY, "1");
      return true;
    }
    // Check URL param for testing
    if (new URLSearchParams(window.location.search).get("app") === "1") {
      sessionStorage.setItem(APP_MODE_KEY, "1");
      return true;
    }
    // Check persisted session
    if (sessionStorage.getItem(APP_MODE_KEY) === "1") {
      return true;
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const handler = (e: MediaQueryListEvent) => {
      setIsApp(e.matches);
      if (e.matches) {
        sessionStorage.setItem(APP_MODE_KEY, "1");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isApp;
};
