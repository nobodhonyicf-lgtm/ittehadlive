import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import AppHeader from "@/components/app/AppHeader";
import AppBottomNav from "@/components/app/AppBottomNav";
import HeaderAd from "@/components/ads/HeaderAd";
import FooterAd from "@/components/ads/FooterAd";
import WebPushPrompt from "@/components/WebPushPrompt";

const Layout = ({ children, fullWidth }: { children: ReactNode; fullWidth?: boolean }) => {
  const isMobile = useIsMobile();

  // Mobile: app-like layout with bottom nav
  if (isMobile) {
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
