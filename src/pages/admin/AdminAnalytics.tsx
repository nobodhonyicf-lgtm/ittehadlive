import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Eye, Users, FileText, Building2, TrendingUp } from "lucide-react";

const AdminAnalytics = () => {
  const { data: pageViews } = useQuery({
    queryKey: ["admin_page_views"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data;
    },
  });

  const { data: postCount } = useQuery({
    queryKey: ["admin_post_count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("posts").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: studentCount } = useQuery({
    queryKey: ["admin_student_count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("students").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: branchCount } = useQuery({
    queryKey: ["admin_branch_count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("branches").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Calculate stats
  const totalViews = pageViews?.length || 0;
  const uniqueVisitors = new Set(pageViews?.map(v => v.visitor_id)).size;
  const today = new Date().toDateString();
  const todayViews = pageViews?.filter(v => new Date(v.created_at).toDateString() === today).length || 0;

  // Top pages
  const pageCounts: Record<string, number> = {};
  pageViews?.forEach(v => {
    pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1;
  });
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2"><BarChart3 size={22} /> অ্যানালিটিক্স ড্যাশবোর্ড</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="mx-auto text-primary mb-2" size={24} />
            <p className="text-2xl font-bold">{totalViews}</p>
            <p className="text-xs text-muted-foreground">মোট পেজ ভিউ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto text-primary mb-2" size={24} />
            <p className="text-2xl font-bold">{uniqueVisitors}</p>
            <p className="text-xs text-muted-foreground">ইউনিক ভিজিটর</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto text-accent mb-2" size={24} />
            <p className="text-2xl font-bold">{todayViews}</p>
            <p className="text-xs text-muted-foreground">আজকের ভিউ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="mx-auto text-primary mb-2" size={24} />
            <p className="text-2xl font-bold">{postCount}</p>
            <p className="text-xs text-muted-foreground">মোট পোস্ট</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Institution Stats */}
        <Card>
          <CardHeader><CardTitle className="text-base">প্রতিষ্ঠান পরিসংখ্যান</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm flex items-center gap-2"><Users size={16} /> শিক্ষার্থী</span>
              <span className="font-bold">{studentCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm flex items-center gap-2"><Building2 size={16} /> শাখা</span>
              <span className="font-bold">{branchCount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm flex items-center gap-2"><FileText size={16} /> পোস্ট</span>
              <span className="font-bold">{postCount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader><CardTitle className="text-base">জনপ্রিয় পেজ</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPages.map(([path, count]) => (
                <div key={path} className="flex justify-between items-center text-sm py-1.5 border-b last:border-0">
                  <span className="truncate text-muted-foreground">{path}</span>
                  <span className="font-semibold text-primary shrink-0 ml-2">{count}</span>
                </div>
              ))}
              {topPages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">এখনো কোনো ভিউ নেই</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
