import AppHeader from "./AppHeader";
import AppBannerSlider from "./AppBannerSlider";
import AppQuickActions from "./AppQuickActions";
import AppNoticeSection from "./AppNoticeSection";
import AppRecentPosts from "./AppRecentPosts";
import AppPrayerWidget from "./AppPrayerWidget";
import AppLayout from "./AppLayout";

const AppHome = () => {
  return (
    <AppLayout>
      <AppHeader />
      <AppBannerSlider />
      <div className="px-4 py-4 space-y-5">
        <AppQuickActions />
        <AppNoticeSection />
        <AppPrayerWidget />
        <AppRecentPosts />
      </div>
    </AppLayout>
  );
};

export default AppHome;
