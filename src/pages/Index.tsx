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
      
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Teacher Slider */}
            {isOn("section_teacher_slider") && (
              <div className="animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
                <TeacherSlider />
              </div>
            )}
            {/* Job Postings */}
            {isOn("section_job_postings") && (
              <div className="animate-fade-in" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
                <JobPostingsSlider />
              </div>
            )}
            {/* About */}
            {isOn("section_about") && (
              <div className="animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
                <AboutSection />
              </div>
            )}
            {/* Islamic Nav */}
            {isOn("section_islamic_nav") && (
              <div className="animate-fade-in" style={{ animationDelay: "0.25s", animationFillMode: "both" }}>
                <IslamicNav />
              </div>
            )}
            {/* Islamic Content */}
            {isOn("section_islamic_content") && (
              <div className="animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
                <IslamicContentWidget />
              </div>
            )}
          </div>

          {/* Sidebar */}
          {isOn("section_sidebar") && (
            <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
              <Sidebar />
            </div>
          )}
        </div>

        {/* Full Width Sections */}
        <div className="space-y-10 mt-10">
          {/* Departments */}
          {isOn("section_departments") && (
            <div className="animate-fade-in" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
              <SectionCards />
            </div>
          )}
          {/* Recent News */}
          {isOn("section_recent_news") && (
            <div className="animate-fade-in" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
              <RecentNews />
            </div>
          )}
          {/* Videos */}
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
