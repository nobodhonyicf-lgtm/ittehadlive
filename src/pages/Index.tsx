import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import NoticeTicker from "@/components/home/NoticeTicker";
import AboutSection from "@/components/home/AboutSection";
import SectionCards from "@/components/home/SectionCards";
import RecentNews from "@/components/home/RecentNews";
import VideoSection from "@/components/home/VideoSection";
import Sidebar from "@/components/home/Sidebar";

const Index = () => {
  return (
    <Layout fullWidth>
      <HeroSection />
      <NoticeTicker />
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AboutSection />
            <SectionCards />
            <RecentNews />
            <VideoSection />
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
