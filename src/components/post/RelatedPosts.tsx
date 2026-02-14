import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";

interface RelatedPostsProps {
  currentPostId: string;
  categoryId?: string | null;
}

const RelatedPosts = ({ currentPostId, categoryId }: RelatedPostsProps) => {
  const { data: posts } = useQuery({
    queryKey: ["related_posts", currentPostId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("id, title, slug, image_url, created_at, categories(name)")
        .eq("is_published", true)
        .neq("id", currentPostId)
        .order("created_at", { ascending: false })
        .limit(4);
      if (categoryId) query = query.eq("category_id", categoryId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!currentPostId,
  });

  if (!posts?.length) return null;

  return (
    <div className="border-t border-border pt-6 mt-6">
      <h3 className="text-lg font-bold mb-4 text-foreground">আরও পড়ুন</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.slug}`}
            className="flex gap-3 group"
          >
            <div className="w-20 h-16 bg-muted rounded shrink-0 overflow-hidden flex items-center justify-center">
              {post.image_url ? (
                <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <Newspaper className="text-muted-foreground" size={20} />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h4>
              <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
