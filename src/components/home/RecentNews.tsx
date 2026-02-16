import { usePosts } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";
import SectionHeader from "./SectionHeader";

const LiveDot = () => (
  <span className="relative flex items-center gap-1 mr-1">
    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
    <span className="absolute w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
  </span>
);

const RecentNews = () => {
  const { data: posts } = usePosts(9);

  if (!posts?.length) return null;

  const featured = posts[0];
  const topMedium = posts.slice(1, 3);
  const bottomPosts = posts.slice(3, 6);
  const sidePosts = posts.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left column */}
      <div className="lg:col-span-2">
        <SectionHeader title="সর্বশেষ খবর" linkUrl="/posts" />

        {/* Top: 1 big + 2 medium side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 rounded-md overflow-hidden">
          {/* Big featured */}
          <Link
            to={`/post/${featured.slug}`}
            className="group block relative overflow-hidden bg-muted md:row-span-2 aspect-[4/3] md:aspect-auto"
          >
            {featured.image_url ? (
              <img
                src={featured.image_url}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted min-h-[280px]">
                <Newspaper className="text-muted-foreground" size={60} />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-20">
              {featured.categories && (
                <span className="text-[11px] font-bold text-destructive bg-white/90 px-1.5 py-0.5 rounded mb-1.5 inline-block">
                  {featured.categories.name}
                </span>
              )}
              <h3 className="text-white text-lg font-bold leading-snug line-clamp-3">
                {featured.title}
              </h3>
              {(featured as any).summary && (
                <p className="text-white/80 text-xs line-clamp-2 mt-1">{(featured as any).summary}</p>
              )}
              <span className="text-white/60 text-[11px] mt-1 block">{timeAgo(featured.created_at)}</span>
            </div>
          </Link>

          {/* 2 medium posts stacked */}
          {topMedium.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              className="group block relative overflow-hidden bg-muted aspect-[16/10]"
            >
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Newspaper className="text-muted-foreground" size={32} />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-10">
                <h3 className="text-white text-sm font-bold leading-snug line-clamp-2">{post.title}</h3>
                {(post as any).summary && (
                  <p className="text-white/70 text-[11px] line-clamp-1 mt-0.5">{(post as any).summary}</p>
                )}
                <span className="text-white/60 text-[10px] mt-0.5 block">{timeAgo(post.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t-2 border-destructive/30 my-3" />

        {/* Bottom 3 posts */}
        <div className="grid grid-cols-3 gap-0.5 rounded-md overflow-hidden">
          {bottomPosts.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              className="group block relative overflow-hidden bg-muted aspect-[4/3]"
            >
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
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 pt-8">
                <h3 className="text-white text-xs font-bold leading-snug line-clamp-2">{post.title}</h3>
                <span className="text-white/60 text-[10px] mt-0.5 block">{timeAgo(post.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <div>
        <div className="flex items-center justify-between bg-destructive rounded-t-md mb-0">
          <h2 className="flex items-center text-white px-4 py-2 text-[15px] font-bold tracking-wide">
            <LiveDot />
            সর্বশেষ নিবন্ধ
          </h2>
          <Link
            to="/posts"
            className="flex items-center gap-0.5 text-[13px] font-bold text-white bg-black/20 hover:bg-black/30 px-3 py-2 transition-colors"
          >
            আরও ›
          </Link>
        </div>
        <div className="bg-card border border-t-0 border-border rounded-b-md divide-y divide-border">
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
                {(post as any).summary && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{(post as any).summary}</p>
                )}
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
      </div>
    </div>
  );
};

export default RecentNews;
