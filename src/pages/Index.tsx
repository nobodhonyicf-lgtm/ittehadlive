import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import NoticeTicker from "@/components/home/NoticeTicker";
import AboutSection from "@/components/home/AboutSection";
import SectionCards from "@/components/home/SectionCards";
import IslamicContentWidget from "@/components/home/IslamicContentWidget";
import IslamicNav from "@/components/home/IslamicNav";
import RecentNews from "@/components/home/RecentNews";
import VideoSection from "@/components/home/VideoSection";
import Sidebar from "@/components/home/Sidebar";
import TeacherSlider from "@/components/home/TeacherSlider";
import JobPostingsSlider from "@/components/home/JobPostingsSlider";
import { useIsApp } from "@/hooks/useIsApp";
import AppHome from "@/components/app/AppHome";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  const isApp = useIsApp();

  if (isApp) {
    return <AppHome />;
  }

  return (
    <Layout fullWidth>
      <SEOHead
        title="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ - প্রাইভেট মাদরাসা সমন্বয় সংগঠন"
        description="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ - প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন। রেজাল্ট, শিক্ষার্থী ডিরেক্টরি, শাখা তথ্য, বুকশপ এবং আরো অনেক কিছু।"
        keywords="ইত্তেহাদ, মাদরাসা, প্রাইভেট মাদরাসা, ইসলামী শিক্ষা, রেজাল্ট, শিক্ষার্থী, বাংলাদেশ"
      />
      <HeroSection />
      <NoticeTicker />
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">
            {/* 1. পরিচিতি ও স্লাইডার */}
            <div className="animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
              <AboutSection />
            </div>
            {/* 2. ইসলামী পাতা নেভিগেশন */}
            <div className="animate-fade-in" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
              <IslamicNav />
            </div>
            {/* 3. ইসলামী কন্টেন্ট */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
              <IslamicContentWidget />
            </div>
            {/* 4. শিক্ষক স্লাইডার */}
            <div className="animate-fade-in" style={{ animationDelay: "0.25s", animationFillMode: "both" }}>
              <TeacherSlider />
            </div>
            {/* 5. নিয়োগ বিজ্ঞপ্তি */}
            <div className="animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
              <JobPostingsSlider />
            </div>
            {/* 6. বিভাগসমূহ */}
            <div className="animate-fade-in" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
              <SectionCards />
            </div>
          </div>
          <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
            <Sidebar />
          </div>
        </div>
        {/* 7. সর্বশেষ খবর - ফুল উইডথ */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
          <RecentNews />
        </div>
        {/* 8. ভিডিও গ্যালারী */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.45s", animationFillMode: "both" }}>
          <VideoSection />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
