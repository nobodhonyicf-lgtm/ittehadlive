import Layout from "@/components/layout/Layout";
import NoticeTicker from "@/components/home/NoticeTicker";
import UpdateTicker from "@/components/home/UpdateTicker";
import AboutSection from "@/components/home/AboutSection";
import SectionCards from "@/components/home/SectionCards";
import RecentNews from "@/components/home/RecentNews";
import VideoSection from "@/components/home/VideoSection";
import Sidebar from "@/components/home/Sidebar";

const Index = () => {
  return (
    <Layout>
      <NoticeTicker />
      <UpdateTicker />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <AboutSection />
            <SectionCards />
            <RecentNews />
            <VideoSection />
          </div>
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
