import { usePosts } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";
import SectionHeader from "./SectionHeader";

const RecentNews = () => {
  const { data: posts } = usePosts(7);

  if (!posts?.length) return null;

  const featured1 = posts[0];
  const featured2 = posts[1];
  const bottomPosts = posts.slice(2, 5);
  const sidePosts = posts.slice(5, 7);

  return (
    <div>
      <SectionHeader title="সর্বশেষ খবর" linkUrl="/posts" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0.5 bg-border rounded-b-md overflow-hidden">
        {/* Left column: 2 featured large posts stacked */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-0.5">
          {/* Top 2 large posts */}
          {[featured1, featured2].map((post) => post && (
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
                  <Newspaper className="text-muted-foreground" size={48} />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 pt-12">
                <h3 className="text-white text-base md:text-lg font-bold leading-snug line-clamp-3">
                  {post.title}
                </h3>
                {(post as any).summary && (
                  <p className="text-white/75 text-xs line-clamp-2 mt-1">
                    {(post as any).summary}
                  </p>
                )}
                <span className="text-white/60 text-[11px] mt-1 block">{timeAgo(post.created_at)}</span>
              </div>
            </Link>
          ))}

          {/* Bottom 3 smaller posts */}
          {bottomPosts.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              className="group block relative overflow-hidden bg-muted aspect-[4/3] md:first:col-span-1"
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
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-10">
                <h3 className="text-white text-sm font-bold leading-snug line-clamp-2">
                  {post.title}
                </h3>
                <span className="text-white/60 text-[10px] mt-0.5 block">{timeAgo(post.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Right sidebar list */}
        <div className="bg-card flex flex-col divide-y divide-border">
          {posts.slice(0, 5).map((post) => (
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
