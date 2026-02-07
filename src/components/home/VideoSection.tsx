import { useVideos } from "@/hooks/useData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";

const getYoutubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?]+)/);
  return match?.[1] || "";
};

const VideoSection = () => {
  const { data: videos } = useVideos();

  if (!videos?.length) return null;

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Video size={20} />
          ভিডিও গ্যালারী
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default VideoSection;
