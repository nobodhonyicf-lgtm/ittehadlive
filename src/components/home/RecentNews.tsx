import { usePosts } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";
import SectionHeader from "./SectionHeader";

const RecentNews = () => {
  const { data: posts } = usePosts(6);

  if (!posts?.length) return null;

  const [featured, ...rest] = posts;

  return (
    <div>
      <SectionHeader title="সর্বশেষ খবর" linkUrl="/posts" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Featured large post */}
        <Link
          to={`/post/${featured.slug}`}
          className="md:col-span-2 md:row-span-2 group block relative overflow-hidden rounded-lg bg-muted"
        >
          <div className="aspect-[16/10] md:aspect-auto md:h-full w-full">
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
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-16">
            {(featured as any).categories && (
              <span className="text-[11px] font-bold text-destructive bg-white/90 px-1.5 py-0.5 rounded mb-1 inline-block">
                {(featured as any).categories.name}
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
          </div>
        </Link>

        {/* Smaller posts grid */}
        {rest.map((post, i) => (
          <Link
            key={post.id}
            to={`/post/${post.slug}`}
            className="group block overflow-hidden rounded-lg bg-card border border-border hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-[16/10] bg-muted">
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Newspaper className="text-muted-foreground" size={32} />
                </div>
              )}
            </div>
            <div className="p-2.5">
              {post.categories && (
                <span className="text-[10px] font-bold text-destructive uppercase block mb-0.5">
                  {post.categories.name}
                </span>
              )}
              <h3 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h3>
              <span className="text-[11px] text-muted-foreground mt-1 block">{timeAgo(post.created_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentNews;
