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

const AppHome = () => {
  return (
    <AppLayout>
      <AppBannerSlider />
      <div className="px-4 py-4 space-y-5">
        <AppQuickActions />
        <AppIslamicNav />
        <AppPollWidget />
        <AppNoticeSection />
        <AppPrayerWidget />
        <AppIslamicContent />
        <AppRecentPosts />
        <AppGallerySection />
        <AppVideoSection />
      </div>
    </AppLayout>
  );
};

export default AppHome;
