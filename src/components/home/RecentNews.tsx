import { usePosts } from "@/hooks/useData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";

const RecentNews = () => {
  const { data: posts } = usePosts(6);

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Newspaper size={20} />
          সাম্প্রতিক খবর
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts?.map((post) => (
            <Link
              key={post.id}
              to={`/post/${post.slug}`}
              className="group block"
            >
              <div className="bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Newspaper className="text-muted-foreground" size={40} />
                )}
              </div>
              <h3 className="mt-2 text-sm font-bold group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentNews;
