import { usePosts } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { ChevronRight, Newspaper } from "lucide-react";

const AppRecentPosts = () => {
  const { data: posts } = usePosts(5);

  if (!posts?.length) return null;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-colors duration-300 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 dark:bg-primary/25 flex items-center justify-center">
            <Newspaper size={14} className="text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground">সাম্প্রতিক খবর</h2>
        </div>
        <Link to="/posts" className="text-xs text-primary font-medium flex items-center gap-0.5 hover:gap-1.5 transition-all duration-200 bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-full">
          সব দেখুন <ChevronRight size={14} />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.slug}`}
            className="flex gap-3 px-4 py-3.5 hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 active:scale-[0.98] group"
          >
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-18 h-18 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm"
                style={{ width: '72px', height: '72px' }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">{post.title}</p>
              {post.summary && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.summary}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                {(post as any).categories?.name && (
                  <span className="text-[10px] bg-primary/10 dark:bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-medium">
                    {(post as any).categories.name}
                  </span>
                )}
                <p className="text-[10px] text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString("bn-BD")}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AppRecentPosts;
