import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePost } from "@/hooks/useData";
import Sidebar from "@/components/home/Sidebar";
import { Calendar } from "lucide-react";

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = usePost(slug || "");

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="animate-pulse bg-muted h-64 rounded" />
            ) : post ? (
              <article className="bg-card rounded-lg border p-6">
                <h1 className="text-2xl font-bold text-primary mb-3">{post.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar size={14} />
                  {new Date(post.created_at).toLocaleDateString("bn-BD")}
                  {post.categories && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                      {post.categories.name}
                    </span>
                  )}
                </div>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full rounded-lg mb-4"
                  />
                )}
                <div className="prose max-w-none text-foreground whitespace-pre-wrap">
                  {post.content}
                </div>
              </article>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                পোস্ট পাওয়া যায়নি
              </div>
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

export default PostPage;
