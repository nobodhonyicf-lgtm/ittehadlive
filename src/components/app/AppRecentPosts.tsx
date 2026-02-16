import { usePosts } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { ChevronRight, Newspaper } from "lucide-react";

const AppRecentPosts = () => {
  const { data: posts } = usePosts(5);

  if (!posts?.length) return null;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-colors duration-300 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-primary/5 dark:bg-primary/10">
        <div className="flex items-center gap-2">
          <Newspaper size={16} className="text-primary" />
          <h2 className="text-sm font-bold text-foreground">সাম্প্রতিক খবর</h2>
        </div>
        <Link to="/posts" className="text-xs text-primary font-medium flex items-center gap-0.5 hover:gap-1.5 transition-all duration-200">
          সব দেখুন <ChevronRight size={14} />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.slug}`}
            className="flex gap-3 px-4 py-3 hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-200 active:scale-[0.98]"
          >
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-16 h-16 rounded-lg object-cover shrink-0 transition-transform duration-200 group-hover:scale-105"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium line-clamp-2 text-foreground">{post.title}</p>
              {post.summary && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{post.summary}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(post.created_at).toLocaleDateString("bn-BD")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AppRecentPosts;
