import { usePosts } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";
import SectionHeader from "./SectionHeader";
import { ScrollArea } from "@/components/ui/scroll-area";

const LiveDot = () => (
  <span className="relative flex items-center mr-1.5">
    <span className="flex gap-[2px] items-end h-3">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-white"
          style={{
            animation: `liveWave 1s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </span>
    <style>{`
      @keyframes liveWave {
        0%, 100% { height: 4px; }
        50% { height: 12px; }
      }
    `}</style>
  </span>
);

const RecentNews = () => {
  const { data: posts } = usePosts(12);

  if (!posts?.length) return null;

  const featured = posts[0];
  const secondPost = posts[1];
  const bottomPosts = posts.slice(2, 4);
  const sidePosts = posts.slice(0, 8);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left column */}
      <div className="lg:col-span-2">
        <SectionHeader title="সর্বশেষ খবর" linkUrl="/posts" />

        {/* Top row: Box 1 (left=title, right=image) + Box 2 (top=image, bottom=title) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0.5 rounded-md overflow-hidden">
          {/* Box 1: Larger - Horizontal - left title, right image (3/5 width) */}
          <Link
            to={`/post/${featured.slug}`}
            className="group flex bg-muted overflow-hidden md:col-span-3 min-h-[260px]"
          >
            <div className="flex-1 p-4 flex flex-col justify-end bg-gradient-to-r from-black/90 via-black/70 to-transparent relative z-10">
              {featured.categories && (
                <span className="text-[11px] font-bold text-destructive bg-white/90 px-1.5 py-0.5 rounded mb-2 inline-block w-fit">
                  {featured.categories.name}
                </span>
              )}
              <h3 className="text-white text-lg font-bold leading-snug line-clamp-3">
                {featured.title}
              </h3>
              {featured.summary && (
                <p className="text-white/70 text-xs line-clamp-2 mt-1">{featured.summary}</p>
              )}
              <span className="text-white/50 text-[11px] mt-1.5 block">{timeAgo(featured.created_at)}</span>
            </div>
            <div className="w-1/2 shrink-0 relative">
              {featured.image_url ? (
                <img
                  src={featured.image_url}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted min-h-[200px]">
                  <Newspaper className="text-muted-foreground" size={48} />
                </div>
              )}
            </div>
          </Link>

          {/* Box 2: Smaller - Vertical - top image, bottom title (2/5 width) */}
          {secondPost && (
            <Link
              to={`/post/${secondPost.slug}`}
              className="group block relative overflow-hidden bg-muted md:col-span-2"
            >
              <div className="h-3/5 overflow-hidden">
                {secondPost.image_url ? (
                  <img
                    src={secondPost.image_url}
                    alt={secondPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted min-h-[140px]">
                    <Newspaper className="text-muted-foreground" size={36} />
                  </div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-10">
                {secondPost.categories && (
                  <span className="text-[10px] font-bold text-destructive bg-white/90 px-1.5 py-0.5 rounded mb-1 inline-block w-fit">
                    {secondPost.categories.name}
                  </span>
                )}
                <h3 className="text-white text-sm font-bold leading-snug line-clamp-2">{secondPost.title}</h3>
                <span className="text-white/50 text-[10px] mt-0.5 block">{timeAgo(secondPost.created_at)}</span>
              </div>
            </Link>
          )}
        </div>

        {/* Divider */}
        <div className="border-t-2 border-destructive/30 my-3" />

        {/* Bottom: Box 3 & 4 - left image, right title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 rounded-md overflow-hidden">
          {bottomPosts.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              className="group flex gap-0 bg-muted overflow-hidden"
            >
              <div className="w-2/5 shrink-0 aspect-[4/3] overflow-hidden">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Newspaper className="text-muted-foreground" size={28} />
                  </div>
                )}
              </div>
              <div className="flex-1 p-3 flex flex-col justify-center bg-gradient-to-l from-black/80 via-black/60 to-black/40">
                {post.categories && (
                  <span className="text-[10px] font-bold text-destructive bg-white/90 px-1.5 py-0.5 rounded mb-1 inline-block w-fit">
                    {post.categories.name}
                  </span>
                )}
                <h3 className="text-white text-sm font-bold leading-snug line-clamp-2">{post.title}</h3>
                <span className="text-white/50 text-[10px] mt-1 block">{timeAgo(post.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Right sidebar with scroll */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 rounded-t-md">
          <h2 className="flex items-center text-white px-4 py-2.5 text-[15px] font-bold tracking-wide">
            <LiveDot />
            সর্বশেষ নিবন্ধ
          </h2>
          <Link
            to="/posts"
            className="flex items-center gap-0.5 text-[13px] font-bold text-white bg-black/20 hover:bg-black/30 px-3 py-2.5 transition-colors"
          >
            আরও ›
          </Link>
        </div>
        <ScrollArea className="h-[480px] bg-card border border-t-0 border-border rounded-b-md">
          <div className="divide-y divide-border">
            {sidePosts.map((post) => (
              <Link
                key={post.id}
                to={`/post/${post.slug}`}
                className="group flex gap-3 p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-20 h-16 rounded overflow-hidden bg-muted shrink-0">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="text-muted-foreground" size={18} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-muted-foreground">{timeAgo(post.created_at)}</span>
                    {post.categories && (
                      <>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-[11px] font-semibold text-destructive">{post.categories.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default RecentNews;
