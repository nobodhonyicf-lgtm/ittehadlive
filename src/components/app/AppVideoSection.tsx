import { useVideos } from "@/hooks/useData";
import { Play, ChevronRight } from "lucide-react";

const extractYoutubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match?.[1] || null;
};

const AppVideoSection = () => {
  const { data: videos } = useVideos();

  if (!videos?.length) return null;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-colors duration-300 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-500/10 to-red-500/5 dark:from-red-500/15 dark:to-red-500/5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 dark:bg-red-500/25 flex items-center justify-center">
            <Play size={14} className="text-red-500" fill="currentColor" />
          </div>
          <h2 className="text-sm font-bold text-foreground">ভিডিও</h2>
        </div>
      </div>
      <div className="p-3 space-y-3">
        {videos.slice(0, 3).map((video) => {
          const ytId = extractYoutubeId(video.youtube_url);
          return (
            <a
              key={video.id}
              href={video.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 group"
            >
              <div className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                {ytId ? (
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Play size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-red-500/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Play size={14} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">{video.title}</p>
                {video.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{video.description}</p>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default AppVideoSection;
