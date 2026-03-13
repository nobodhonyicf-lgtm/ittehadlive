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
import { useSiteSettings } from "@/hooks/useData";

const Index = () => {
  const isApp = useIsApp();
  const { data: settings } = useSiteSettings();

  if (isApp) {
    return <AppHome />;
  }

  const isOn = (key: string) => settings?.[key] !== "false";

  return (
    <Layout fullWidth>
      <SEOHead
        title="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ - প্রাইভেট মাদরাসা সমন্বয় সংগঠন"
        description="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ - প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন। রেজাল্ট, শিক্ষার্থী ডিরেক্টরি, শাখা তথ্য, বুকশপ এবং আরো অনেক কিছু।"
        keywords="ইত্তেহাদ, মাদরাসা, প্রাইভেট মাদরাসা, ইসলামী শিক্ষা, রেজাল্ট, শিক্ষার্থী, বাংলাদেশ"
      />
      {isOn("section_hero") && <HeroSection />}
      {isOn("section_notice_ticker") && <NoticeTicker />}
      
      <div className="max-w-[1200px] mx-auto px-4 pt-14 pb-8">
        {/* Section 1: Services + Teacher + Jobs */}
        <div className="space-y-8 mb-10">
          {isOn("section_teacher_slider") && (
            <div className="animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
              <TeacherSlider />
            </div>
          )}
          {isOn("section_job_postings") && (
            <div className="animate-fade-in" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
              <JobPostingsSlider />
            </div>
          )}
        </div>

        {/* Section 2: Main Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 space-y-8">
            {isOn("section_about") && (
              <div className="animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
                <AboutSection />
              </div>
            )}
            {isOn("section_islamic_nav") && (
              <div className="animate-fade-in" style={{ animationDelay: "0.25s", animationFillMode: "both" }}>
                <IslamicNav />
              </div>
            )}
            {isOn("section_islamic_content") && (
              <div className="animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
                <IslamicContentWidget />
              </div>
            )}
          </div>

          {isOn("section_sidebar") && (
            <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
              <Sidebar />
            </div>
          )}
        </div>

        {/* Section 3: Full Width - Departments, News, Videos */}
        <div className="space-y-10">
          {isOn("section_departments") && (
            <div className="animate-fade-in" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
              <SectionCards />
            </div>
          )}
          {isOn("section_recent_news") && (
            <div className="animate-fade-in" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
              <RecentNews />
            </div>
          )}
          {isOn("section_videos") && (
            <div className="animate-fade-in" style={{ animationDelay: "0.45s", animationFillMode: "both" }}>
              <VideoSection />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
