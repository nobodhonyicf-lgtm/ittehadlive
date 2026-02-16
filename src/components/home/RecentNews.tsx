import { usePosts } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";
import SectionHeader from "./SectionHeader";

const RecentNews = () => {
  const { data: posts } = usePosts(9);

  if (!posts?.length) return null;

  const featured = posts[0];
  const middlePosts = posts.slice(1, 4);
  const sidePosts = posts.slice(4, 9);

  return (
    <div>
      <SectionHeader title="সর্বশেষ খবর" linkUrl="/posts" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0.5 bg-border rounded-b-md overflow-hidden">
        {/* Left: 1 big + 3 medium */}
        <div className="lg:col-span-2 flex flex-col gap-0.5">
          {/* Featured large post */}
          <Link
            to={`/post/${featured.slug}`}
            className="group block relative overflow-hidden bg-muted aspect-[16/9]"
          >
            {featured.image_url ? (
              <img
                src={featured.image_url}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Newspaper className="text-muted-foreground" size={60} />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16">
              {featured.categories && (
                <span className="text-[11px] font-bold text-destructive bg-white/90 px-1.5 py-0.5 rounded mb-1.5 inline-block">
                  {featured.categories.name}
                </span>
              )}
              <h3 className="text-white text-lg md:text-xl font-bold leading-snug line-clamp-3">
                {featured.title}
              </h3>
              {(featured as any).summary && (
                <p className="text-white/80 text-sm line-clamp-2 mt-1">
                  {(featured as any).summary}
                </p>
              )}
              <span className="text-white/60 text-[11px] mt-1.5 block">{timeAgo(featured.created_at)}</span>
            </div>
          </Link>

          {/* 3 medium posts */}
          <div className="grid grid-cols-3 gap-0.5">
            {middlePosts.map((post) => (
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
                  <h3 className="text-white text-xs font-bold leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <span className="text-white/60 text-[10px] mt-0.5 block">{timeAgo(post.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right sidebar: 4-5 posts as list */}
        <div className="bg-card flex flex-col divide-y divide-border">
          {sidePosts.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              className="group flex gap-3 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="w-20 h-16 rounded overflow-hidden bg-muted shrink-0">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
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
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {(post as any).summary}
                  </p>
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
