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

const AppHome = () => {
  return (
    <AppLayout>
      <AppBannerSlider />
      <div className="px-4 py-4 space-y-5">
        <div className="animate-fade-in" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
          <AppQuickActions />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <AppIslamicNav />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
          <AppPollWidget />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          <AppNoticeSection />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.25s", animationFillMode: "both" }}>
          <AppPrayerWidget />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
          <AppIslamicContent />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.32s", animationFillMode: "both" }}>
          <AppTeacherSlider />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.34s", animationFillMode: "both" }}>
          <AppJobPostings />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
          <AppRecentPosts />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
          <AppGallerySection />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: "0.45s", animationFillMode: "both" }}>
          <AppVideoSection />
        </div>
      </div>
    </AppLayout>
  );
};

export default AppHome;
