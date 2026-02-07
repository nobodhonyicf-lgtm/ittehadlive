import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/home/Sidebar";
import { Calendar } from "lucide-react";

const NoticeView = () => {
  const { id } = useParams<{ id: string }>();
  const { data: notice, isLoading } = useQuery({
    queryKey: ["notice", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="animate-pulse bg-muted h-40 rounded" />
            ) : notice ? (
              <article className="bg-card rounded-lg border p-6">
                <h1 className="text-2xl font-bold text-primary mb-3">{notice.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar size={14} />
                  {new Date(notice.created_at).toLocaleDateString("bn-BD")}
                </div>
                <div className="prose max-w-none text-foreground whitespace-pre-wrap">
                  {notice.content}
                </div>
              </article>
            ) : (
              <div className="text-center py-12 text-muted-foreground">নোটিশ পাওয়া যায়নি</div>
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

export default NoticeView;
