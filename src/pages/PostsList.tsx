import Layout from "@/components/layout/Layout";
import { usePosts } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { Calendar, Newspaper } from "lucide-react";
import Sidebar from "@/components/home/Sidebar";

const PostsList = () => {
  const { data: posts, isLoading } = usePosts();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-primary mb-6">সকল পোস্ট</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-muted h-32 rounded" />
              ))
            ) : posts?.length ? (
              posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.slug}`}
                  className="block bg-card border rounded-lg p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded shrink-0 flex items-center justify-center overflow-hidden">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <Newspaper className="text-muted-foreground" size={24} />
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Calendar size={12} />
                        {new Date(post.created_at).toLocaleDateString("bn-BD")}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">কোনো পোস্ট পাওয়া যায়নি</p>
            )}
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostsList;
