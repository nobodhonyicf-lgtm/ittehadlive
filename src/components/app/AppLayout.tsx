import { ReactNode } from "react";
import { useEffect, useState } from "react";
import AppBottomNav from "./AppBottomNav";
import AppHeader from "./AppHeader";

const AppLayout = ({ children, hideHeader }: { children: ReactNode; hideHeader?: boolean }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent text copy and image download in app mode
  useEffect(() => {
    const preventCopy = (e: Event) => e.preventDefault();
    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCopy);
    document.addEventListener("contextmenu", preventCopy);

    // Prevent image drag
    const preventDrag = (e: DragEvent) => {
      if ((e.target as HTMLElement)?.tagName === "IMG") e.preventDefault();
    };
    document.addEventListener("dragstart", preventDrag);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCopy);
      document.removeEventListener("contextmenu", preventCopy);
      document.removeEventListener("dragstart", preventDrag);
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
