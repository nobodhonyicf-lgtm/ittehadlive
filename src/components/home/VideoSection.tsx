import { useVideos } from "@/hooks/useData";
import SectionHeader from "./SectionHeader";

const getYoutubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?]+)/);
  return match?.[1] || "";
};

const VideoSection = () => {
  const { data: videos } = useVideos();

  if (!videos?.length) return null;

  return (
    <div>
      <SectionHeader title="ভিডিও গ্যালারী" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video) => (
          <div key={video.id}>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(video.youtube_url)}`}
                title={video.title}
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <h3 className="mt-2 text-sm font-bold">{video.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoSection;
