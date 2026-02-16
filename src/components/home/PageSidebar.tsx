import { Link } from "react-router-dom";
import { usePosts, useCategories, useAds, useVideos } from "@/hooks/useData";
import { Newspaper, Tag, PlayCircle } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";
import SectionHeader from "./SectionHeader";

const RecentPostsWidget = () => {
  const { data: posts } = usePosts(6);
  if (!posts?.length) return null;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <SectionHeader title="সাম্প্রতিক পোস্ট" linkUrl="/posts" />
      <div className="px-4 pb-4">
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id} className="border-b border-border pb-2 last:border-0">
              <Link to={`/post/${post.slug}`} className="flex gap-3 group hover:text-primary transition-colors">
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="w-16 h-12 object-cover rounded shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{post.title}</p>
                  <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const CategoriesWidget = () => {
  const { data: categories } = useCategories();
  if (!categories?.length) return null;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <SectionHeader title="ক্যাটাগরি" />
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/posts?category=${cat.slug}`}
              className="text-sm bg-muted hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-full transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const VideosWidget = () => {
  const { data: videos } = useVideos();
  if (!videos?.length) return null;

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
    return match?.[1];
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <SectionHeader title="ভিডিও" />
      <div className="px-4 pb-4 space-y-3">
        {videos.slice(0, 3).map((video) => {
          const ytId = getYouTubeId(video.youtube_url);
          return (
            <a key={video.id} href={video.youtube_url} target="_blank" rel="noopener noreferrer" className="block group">
              <div className="relative rounded overflow-hidden">
                {ytId && (
                  <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={video.title} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="text-white" size={32} />
                </div>
              </div>
              <p className="text-sm font-medium mt-1 line-clamp-2 group-hover:text-primary transition-colors">{video.title}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
};

const AdsWidget = () => {
  const { data: ads } = useAds("sidebar");
  if (!ads?.length) return null;

  return (
    <div className="space-y-4">
      {ads.slice(0, 2).map((ad) => (
        <a key={ad.id} href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block">
          <img src={ad.image_url} alt={ad.title} className="w-full rounded-lg border hover:shadow-md transition-shadow" />
        </a>
      ))}
    </div>
  );
};

const PageSidebar = () => {
  return (
    <div className="space-y-4">
      <RecentPostsWidget />
      <CategoriesWidget />
      <VideosWidget />
      <AdsWidget />
    </div>
  );
};

export default PageSidebar;
