import AppBannerSlider from "./AppBannerSlider";
import AppQuickActions from "./AppQuickActions";
import AppNoticeSection from "./AppNoticeSection";
import AppRecentPosts from "./AppRecentPosts";
import AppPrayerWidget from "./AppPrayerWidget";
import AppLayout from "./AppLayout";
import AppPushSubscribe from "./AppPushSubscribe";
import AppPollWidget from "./AppPollWidget";

const AppHome = () => {
  return (
    <AppLayout>
      <AppBannerSlider />
      <div className="px-4 py-4 space-y-5">
        <AppPushSubscribe />
        <AppQuickActions />
        <AppPollWidget />
        <AppNoticeSection />
        <AppPrayerWidget />
        <AppRecentPosts />
      </div>
    </AppLayout>
  );
};

export default AppHome;
