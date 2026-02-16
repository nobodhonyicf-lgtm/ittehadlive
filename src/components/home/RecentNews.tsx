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

const PostImage = ({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) => (
  src ? (
    <img src={src} alt={alt} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${className}`} loading="lazy" />
  ) : (
    <div className={`w-full h-full flex items-center justify-center bg-muted ${className}`}>
      <Newspaper className="text-muted-foreground" size={36} />
    </div>
  )
);

const CategoryBadge = ({ name }: { name?: string }) => (
  name ? (
    <span className="text-[10px] font-bold bg-destructive text-white px-2 py-0.5 rounded-sm inline-block w-fit">
      {name}
    </span>
  ) : null
);

const RecentNews = () => {
  const { data: posts } = usePosts(12);

  if (!posts?.length) return null;

  const featured = posts[0];
  const secondPost = posts[1];
  const thirdPost = posts[2];
  const bottomPosts = posts.slice(3, 5);
  const sidePosts = posts.slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left column - News grid */}
      <div className="lg:col-span-2">
        <SectionHeader title="সর্বশেষ খবর" linkUrl="/posts" />

        {/* Top row: 3-column grid like bd-pratidin */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[3px] rounded-md overflow-hidden">
          {/* Box 1: Main featured - full image background with overlay text at bottom */}
          <Link
            to={`/post/${featured.slug}`}
            className="group relative overflow-hidden md:col-span-5 min-h-[280px]"
          >
            <PostImage src={featured.image_url} alt={featured.title} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <CategoryBadge name={featured.categories?.name} />
              <h3 className="text-white text-lg font-bold leading-snug line-clamp-3 mt-1.5">
                {featured.title}
              </h3>
              {featured.summary && (
                <p className="text-white/70 text-xs line-clamp-2 mt-1">{featured.summary}</p>
              )}
              <span className="text-white/50 text-[11px] mt-1.5 block">{timeAgo(featured.created_at)}</span>
            </div>
          </Link>

          {/* Box 2: Middle - full image with overlay (slightly smaller) */}
          {secondPost && (
            <Link
              to={`/post/${secondPost.slug}`}
              className="group relative overflow-hidden md:col-span-3 min-h-[280px]"
            >
              <PostImage src={secondPost.image_url} alt={secondPost.title} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <CategoryBadge name={secondPost.categories?.name} />
                <h3 className="text-white text-sm font-bold leading-snug line-clamp-2 mt-1">
                  {secondPost.title}
                </h3>
                <span className="text-white/50 text-[10px] mt-1 block">{timeAgo(secondPost.created_at)}</span>
              </div>
            </Link>
          )}

          {/* Box 3: Right - full image with overlay */}
          {thirdPost && (
            <Link
              to={`/post/${thirdPost.slug}`}
              className="group relative overflow-hidden md:col-span-4 min-h-[280px]"
            >
              <PostImage src={thirdPost.image_url} alt={thirdPost.title} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <CategoryBadge name={thirdPost.categories?.name} />
                <h3 className="text-white text-sm font-bold leading-snug line-clamp-2 mt-1">
                  {thirdPost.title}
                </h3>
                <span className="text-white/50 text-[10px] mt-1 block">{timeAgo(thirdPost.created_at)}</span>
              </div>
            </Link>
          )}
        </div>

        {/* Bottom: Box 4 & 5 - image with overlay, side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px] mt-[3px] rounded-md overflow-hidden">
          {bottomPosts.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              className="group flex overflow-hidden bg-card min-h-[120px]"
            >
              <div className="w-2/5 shrink-0 relative overflow-hidden">
                <PostImage src={post.image_url} alt={post.title} />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-center">
                <CategoryBadge name={post.categories?.name} />
                <h3 className="text-foreground text-sm font-bold leading-snug line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <span className="text-muted-foreground text-[10px] mt-1.5 block">{timeAgo(post.created_at)}</span>
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
