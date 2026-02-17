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
      return false;
    };
    const preventDrag = (e: DragEvent) => e.preventDefault();

    // Long-press timer to block context menu on mobile
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    const onTouchStart = () => {
      longPressTimer = setTimeout(() => {
        // After 500ms, nothing happens — browser default is already blocked by contextmenu listener
      }, 400);
    };
    const onTouchEnd = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCopy);
    document.addEventListener("contextmenu", preventContext);
    document.addEventListener("dragstart", preventDrag);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });

    // CSS-only protection for long-press callouts and image saving
    const style = document.createElement('style');
    style.id = 'app-content-protection';
    style.textContent = `
      * { -webkit-touch-callout: none !important; -webkit-user-select: none !important; user-select: none !important; }
      img {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        user-select: none !important;
        pointer-events: none !important;
      }
      a img, button img, [role="button"] img { pointer-events: none !important; }
    `;
    document.head.appendChild(style);

    // Wrap all images in a protective overlay so touch events don't reach the img element
    const wrapImages = () => {
      const images = document.querySelectorAll('img:not([data-protected])');
      images.forEach((img) => {
        img.setAttribute('data-protected', '1');
        const parent = img.parentElement;
        if (parent && !parent.classList.contains('img-protect-wrap')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'img-protect-wrap';
          wrapper.style.cssText = 'position:relative;display:inline-block;width:100%;';
          parent.insertBefore(wrapper, img);
          wrapper.appendChild(img);
          // Transparent overlay to intercept touch/click on images
          const overlay = document.createElement('div');
          overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;';
          wrapper.appendChild(overlay);
        }
      });
    };

    // Run on mount and observe DOM changes for dynamically loaded images
    wrapImages();
    const observer = new MutationObserver(() => wrapImages());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCopy);
      document.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("dragstart", preventDrag);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
      observer.disconnect();
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
