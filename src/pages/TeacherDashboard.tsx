import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Clock, CheckCircle, XCircle, Loader2, User, FileText, MapPin, BookOpen } from "lucide-react";
import { toBengaliNumber } from "@/lib/bengali";
import { Link } from "react-router-dom";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "অপেক্ষমান", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "অনুমোদিত", color: "bg-green-100 text-green-800" },
  rejected: { label: "প্রত্যাখ্যাত", color: "bg-red-100 text-red-800" },
  reviewing: { label: "পর্যালোচনায়", color: "bg-blue-100 text-blue-800" },
  shortlisted: { label: "শর্টলিস্ট", color: "bg-purple-100 text-purple-800" },
};

const TeacherDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Teacher registration applications
  const { data: teacherApps, isLoading: appsLoading } = useQuery({
    queryKey: ["my_teacher_apps", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("teacher_applications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Job applications
  const { data: jobApps } = useQuery({
    queryKey: ["my_job_apps", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("job_applications").select("*, job_postings(title)").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Profile data
  const { data: profile } = useQuery({
    queryKey: ["user_profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  if (authLoading) return <Layout><div className="py-20 text-center">লোড হচ্ছে...</div></Layout>;
  if (!user) { navigate("/login?returnUrl=/teacher-dashboard"); return null; }

  if (appsLoading) return <Layout><div className="py-20 text-center"><Loader2 className="animate-spin mx-auto" size={32} /></div></Layout>;

  const totalApps = (teacherApps?.length || 0) + (jobApps?.length || 0);
  const approvedApps = [...(teacherApps || []), ...(jobApps || [])].filter((a: any) => a.status === "approved").length;
  const pendingApps = [...(teacherApps || []), ...(jobApps || [])].filter((a: any) => a.status === "pending").length;

  return (
    <Layout>
      <SEOHead title="শিক্ষক ড্যাশবোর্ড" />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">শিক্ষক ড্যাশবোর্ড</h1>
            <p className="text-sm text-muted-foreground">{profile?.full_name || user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card><CardContent className="p-4 text-center">
            <FileText className="mx-auto text-primary mb-1" size={18} />
            <div className="text-xl font-bold">{toBengaliNumber(totalApps)}</div>
            <div className="text-[10px] text-muted-foreground">মোট আবেদন</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Clock className="mx-auto text-amber-500 mb-1" size={18} />
            <div className="text-xl font-bold">{toBengaliNumber(pendingApps)}</div>
            <div className="text-[10px] text-muted-foreground">অপেক্ষমান</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-1" size={18} />
            <div className="text-xl font-bold">{toBengaliNumber(approvedApps)}</div>
            <div className="text-[10px] text-muted-foreground">অনুমোদিত</div>
          </CardContent></Card>
        </div>

        {/* Teacher Registration Applications */}
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><GraduationCap size={16} /> শিক্ষক নিবন্ধন আবেদন</h2>
        {!teacherApps?.length ? (
          <Card className="mb-6"><CardContent className="p-6 text-center text-muted-foreground text-sm">
            আপনি এখনো শিক্ষক নিবন্ধনের আবেদন করেননি।
            <br />
            <Link to="/teacher-apply"><Button size="sm" className="mt-3 gap-1"><GraduationCap size={14} /> আবেদন করুন</Button></Link>
          </CardContent></Card>
        ) : (
          <div className="space-y-2 mb-6">
            {teacherApps.map((app: any) => {
              const st = statusLabels[app.status] || statusLabels.pending;
              return (
                <Card key={app.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{app.name}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen size={10} /> {app.subject}</span>
                        {app.district && <span className="flex items-center gap-1"><MapPin size={10} /> {app.district}</span>}
                      </div>
                    </div>
                    <Badge className={`${st.color} text-[10px]`}>{st.label}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Job Applications */}
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><Briefcase size={16} /> নিয়োগ আবেদন</h2>
        {!jobApps?.length ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">
            কোনো নিয়োগ আবেদন নেই।
            <br />
            <Link to="/teachers"><Button size="sm" className="mt-3 gap-1"><Briefcase size={14} /> নিয়োগ বিজ্ঞপ্তি দেখুন</Button></Link>
          </CardContent></Card>
        ) : (
          <div className="space-y-2">
            {jobApps.map((app: any) => {
              const st = statusLabels[app.status] || statusLabels.pending;
              return (
                <Card key={app.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{app.job_postings?.title || "পদ"}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                        <span>ট্র্যাকিং: {app.tracking_code}</span>
                        {app.admin_note && <span className="text-primary">নোট: {app.admin_note}</span>}
                      </div>
                    </div>
                    <Badge className={`${st.color} text-[10px]`}>{st.label}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/teacher-apply">
            <Button variant="outline" className="w-full gap-1 h-12"><GraduationCap size={16} /> শিক্ষক নিবন্ধন</Button>
          </Link>
          <Link to="/teachers">
            <Button variant="outline" className="w-full gap-1 h-12"><Briefcase size={16} /> চাকরি খুঁজুন</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
