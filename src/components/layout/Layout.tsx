import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import WindowTitleBar from "./WindowTitleBar";
import { useIsApp } from "@/hooks/useIsApp";
import AppHeader from "@/components/app/AppHeader";
import AppBottomNav from "@/components/app/AppBottomNav";
import HeaderAd from "@/components/ads/HeaderAd";
import FooterAd from "@/components/ads/FooterAd";

const Layout = ({ children, fullWidth }: { children: ReactNode; fullWidth?: boolean }) => {
  const isApp = useIsApp();

  if (isApp) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16">
        <AppHeader />
        <main className="flex-1 min-h-[60vh]">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
        <AppBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Windows 11 Title Bar */}
      <WindowTitleBar />
      <Header />
      <HeaderAd />
      <main className="flex-1 min-h-[60vh]">
        {fullWidth ? children : (
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        )}
      </main>
      <FooterAd />
      <Footer />
      {/* Windows 11 Taskbar */}
      <div className="w-full h-10 bg-card/80 backdrop-blur-xl border-t border-border/50 flex items-center justify-center gap-6 shrink-0 select-none z-[60] sticky bottom-0">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-muted/60 transition-colors cursor-default">
          <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-sm bg-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground">স্টার্ট</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 border-b-2 border-primary cursor-default">
          <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-sm bg-primary" />
          </div>
          <span className="text-[10px] text-foreground font-medium">ittehad.bd</span>
        </div>
      </div>
    </div>
  );
};

export default Layout;
