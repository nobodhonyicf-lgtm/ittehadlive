import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useIsApp } from "@/hooks/useIsApp";
import AppHeader from "@/components/app/AppHeader";
import AppBottomNav from "@/components/app/AppBottomNav";
import HeaderAd from "@/components/ads/HeaderAd";
import FooterAd from "@/components/ads/FooterAd";
import WebPushPrompt from "@/components/WebPushPrompt";

const Layout = ({ children, fullWidth }: { children: ReactNode; fullWidth?: boolean }) => {
  const isApp = useIsApp();

  // App mode (PWA standalone / Capacitor): app-like layout with bottom nav
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
        <WebPushPrompt />
      </div>
    );
  }

  // Desktop: Fluent-style professional layout
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
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
      <WebPushPrompt />
    </div>
  );
};

export default Layout;
