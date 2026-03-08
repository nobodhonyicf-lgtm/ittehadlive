import AppBannerSlider from "./AppBannerSlider";
import AppQuickActions from "./AppQuickActions";
import AppNoticeSection from "./AppNoticeSection";
import AppRecentPosts from "./AppRecentPosts";
import AppPrayerWidget from "./AppPrayerWidget";
import AppLayout from "./AppLayout";
import AppPollWidget from "./AppPollWidget";
import AppGallerySection from "./AppGallerySection";
import AppVideoSection from "./AppVideoSection";
import AppIslamicContent from "./AppIslamicContent";
import AppIslamicNav from "./AppIslamicNav";
import AppTeacherSlider from "./AppTeacherSlider";
import AppJobPostings from "./AppJobPostings";
import AppBannerAd from "./AppBannerAd";

const AppHome = () => {
  return (
    <AppLayout>
      <AppBannerSlider />
      <div className="px-4 py-4 space-y-4">
        <div className="animate-fade-in" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
          <AppQuickActions />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.08s", animationFillMode: "both" }}>
          <AppTeacherSlider />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <AppJobPostings />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.12s", animationFillMode: "both" }}>
          <AppNoticeSection />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.14s", animationFillMode: "both" }}>
          <AppIslamicNav />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.16s", animationFillMode: "both" }}>
          <AppPrayerWidget />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.18s", animationFillMode: "both" }}>
          <AppIslamicContent />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          <AppPollWidget />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.22s", animationFillMode: "both" }}>
          <AppRecentPosts />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.24s", animationFillMode: "both" }}>
          <AppGallerySection />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.26s", animationFillMode: "both" }}>
          <AppVideoSection />
        </div>
      </div>
    </AppLayout>
  );
};

export default AppHome;
