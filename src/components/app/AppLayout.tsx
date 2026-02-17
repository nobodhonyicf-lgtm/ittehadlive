import { ReactNode } from "react";
import { useEffect, useState } from "react";
import AppBottomNav from "./AppBottomNav";
import AppHeader from "./AppHeader";

const AppLayout = ({ children, hideHeader }: { children: ReactNode; hideHeader?: boolean }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent text copy, image download, and long-press actions in app mode
  useEffect(() => {
    const preventCopy = (e: Event) => e.preventDefault();
    const preventContext = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    const preventDrag = (e: DragEvent) => e.preventDefault();
    const preventTouchCallout = (e: TouchEvent) => {
      // Prevent long-press popup on mobile
      const target = e.target as HTMLElement;
      if (target?.tagName === "IMG" || target?.tagName === "A" || target?.closest("img") || target?.closest("a")) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCopy);
    document.addEventListener("contextmenu", preventContext, { capture: true });
    document.addEventListener("dragstart", preventDrag);
    document.addEventListener("touchstart", preventTouchCallout, { passive: false });

    // Apply CSS to body for extra protection
    document.body.style.cssText += '-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;';

    // Disable image long-press by making all images non-interactive
    const style = document.createElement('style');
    style.id = 'app-content-protection';
    style.textContent = `
      img { pointer-events: none !important; -webkit-touch-callout: none !important; }
      * { -webkit-touch-callout: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCopy);
      document.removeEventListener("contextmenu", preventContext, { capture: true });
      document.removeEventListener("dragstart", preventDrag);
      document.removeEventListener("touchstart", preventTouchCallout);
      const protectionStyle = document.getElementById('app-content-protection');
      if (protectionStyle) protectionStyle.remove();
    };
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col bg-background pb-16 transition-colors duration-300 select-none ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
    >
      {!hideHeader && <AppHeader />}
      <main className="flex-1">{children}</main>
      <AppBottomNav />
    </div>
  );
};

export default AppLayout;
