import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePage } from "@/hooks/useData";
import Sidebar from "@/components/home/Sidebar";

const PageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading } = usePage(slug || "");

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="animate-pulse bg-muted h-64 rounded" />
            ) : page ? (
              <article className="bg-card rounded-lg border p-6">
                <h1 className="text-2xl font-bold text-primary mb-4">{page.title}</h1>
                <div className="prose max-w-none text-foreground whitespace-pre-wrap">
                  {page.content}
                </div>
              </article>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                পেজ পাওয়া যায়নি
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

export default PageView;
