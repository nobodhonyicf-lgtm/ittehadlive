import { ReactNode } from "react";
import { useEffect, useState } from "react";
import AppBottomNav from "./AppBottomNav";
import AppHeader from "./AppHeader";

const AppLayout = ({ children, hideHeader }: { children: ReactNode; hideHeader?: boolean }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col bg-background pb-16 transition-colors duration-300 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
      {!hideHeader && <AppHeader />}
      <main className="flex-1">{children}</main>
      <AppBottomNav />
    </div>
  );
};

export default AppLayout;
