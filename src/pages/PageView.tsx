import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { usePage } from "@/hooks/useData";
import { useCommitteeMembers } from "@/hooks/useData";
import Sidebar from "@/components/home/Sidebar";
import { User } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const committeePages = ["committee", "advisors"];

const PageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading } = usePage(slug || "");
  const isCommitteePage = committeePages.includes(slug || "");
  const { data: members } = useCommitteeMembers(isCommitteePage ? slug! : undefined);

  return (
    <Layout>
      {page && <SEOHead title={page.title} description={page.content?.substring(0, 160) || ""} />}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="animate-pulse bg-muted h-64 rounded" />
            ) : page ? (
              <article className="bg-card rounded-lg border p-6">
                <h1 className="text-2xl font-bold text-primary mb-4">{page.title}</h1>
                {page.content && (
                  <div className="prose max-w-none text-foreground whitespace-pre-wrap mb-6">
                    {page.content}
                  </div>
                )}

                {/* Committee/Advisors member grid */}
                {isCommitteePage && members && members.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {members.map((m: any) => (
                      <div key={m.id} className="border rounded-lg p-4 text-center bg-muted/30">
                        <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-secondary flex items-center justify-center overflow-hidden border-2 border-primary/20">
                          {m.photo_url ? (
                            <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="text-primary" size={28} />
                          )}
                        </div>
                        <h3 className="font-bold text-sm">{m.name}</h3>
                        <p className="text-xs text-primary font-medium">{m.title}</p>
                        {m.institution && <p className="text-xs text-muted-foreground mt-1">{m.institution}</p>}
                      </div>
                    ))}
                  </div>
                )}
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
