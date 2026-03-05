import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { Building2, Edit, Eye, Users, GraduationCap, Briefcase, Save, Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toBengaliNumber } from "@/lib/bengali";

const BranchDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Fetch branch assigned to this user
  const { data: branch, isLoading } = useQuery({
    queryKey: ["my_branch", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!user?.id,
  });

  // Fetch job postings for this branch
  const { data: jobs } = useQuery({
    queryKey: ["branch_jobs", branch?.id],
    queryFn: async () => {
      const { data } = await supabase.from("job_postings").select("*").eq("branch_id", branch!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!branch?.id,
  });

  // Fetch job applications for this branch's jobs
  const { data: applications } = useQuery({
    queryKey: ["branch_job_apps", branch?.id],
    queryFn: async () => {
      const jobIds = jobs?.map((j: any) => j.id) || [];
      if (jobIds.length === 0) return [];
      const { data } = await supabase.from("job_applications").select("*, job_postings(title)").in("job_id", jobIds).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!jobs?.length,
  });

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});

  const startEdit = () => {
    if (!branch) return;
    setForm({
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
      head_name: branch.head_name || "",
      description: branch.description || "",
      total_students: branch.total_students || 0,
      total_teachers: branch.total_teachers || 0,
    });
    setEditMode(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Save changes as pending_changes (moderation)
      const { error } = await supabase.from("branches").update({
        pending_changes: form,
      } as any).eq("id", branch.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("পরিবর্তনগুলো অ্যাডমিনের অনুমোদনের জন্য জমা হয়েছে");
      setEditMode(false);
      qc.invalidateQueries({ queryKey: ["my_branch"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (authLoading) return <Layout><div className="py-20 text-center">লোড হচ্ছে...</div></Layout>;
  if (!user) { navigate("/login?returnUrl=/branch-dashboard"); return null; }

  if (isLoading) return <Layout><div className="py-20 text-center"><Loader2 className="animate-spin mx-auto" size={32} /></div></Layout>;

  if (!branch) {
    return (
      <Layout>
        <SEOHead title="প্রতিষ্ঠান ড্যাশবোর্ড" />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <Building2 size={48} className="mx-auto text-muted-foreground/40 mb-4" />
          <h1 className="text-xl font-bold mb-2">কোনো প্রতিষ্ঠান এসাইন করা নেই</h1>
          <p className="text-sm text-muted-foreground mb-4">আপনার অ্যাকাউন্টে কোনো প্রতিষ্ঠান/শাখা এসাইন করা হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।</p>
          <Button onClick={() => navigate("/institution-register")} className="gap-2"><Building2 size={16} /> প্রতিষ্ঠান নিবন্ধন করুন</Button>
        </div>
      </Layout>
    );
  }

  const statusLabels: Record<string, string> = { pending: "অপেক্ষমান", active: "সক্রিয়", rejected: "প্রত্যাখ্যাত" };

  return (
    <Layout>
      <SEOHead title={`${branch.name} - ড্যাশবোর্ড`} />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {branch.image_url ? <img src={branch.image_url} alt="" className="w-16 h-16 rounded-xl object-contain bg-muted border" /> : <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 size={28} className="text-primary" /></div>}
          <div className="flex-1">
            <h1 className="text-xl font-bold">{branch.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {branch.code && <Badge variant="outline">কোড: {branch.code}</Badge>}
              <Badge className={branch.status === "active" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                {statusLabels[branch.status] || branch.status}
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={startEdit}><Edit size={14} /> তথ্য সম্পাদনা</Button>
        </div>

        {branch.pending_changes && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">আপনার পরিবর্তনগুলো অ্যাডমিনের অনুমোদনের অপেক্ষায় রয়েছে।</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card><CardContent className="p-4 text-center">
            <GraduationCap className="mx-auto text-primary mb-1" size={20} />
            <div className="text-2xl font-bold">{toBengaliNumber(branch.total_teachers || 0)}</div>
            <div className="text-xs text-muted-foreground">শিক্ষক</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Users className="mx-auto text-primary mb-1" size={20} />
            <div className="text-2xl font-bold">{toBengaliNumber(branch.total_students || 0)}</div>
            <div className="text-xs text-muted-foreground">শিক্ষার্থী</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Briefcase className="mx-auto text-primary mb-1" size={20} />
            <div className="text-2xl font-bold">{toBengaliNumber(jobs?.length || 0)}</div>
            <div className="text-xs text-muted-foreground">নিয়োগ বিজ্ঞপ্তি</div>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <CheckCircle className="mx-auto text-primary mb-1" size={20} />
            <div className="text-2xl font-bold">{toBengaliNumber(applications?.length || 0)}</div>
            <div className="text-xs text-muted-foreground">আবেদন</div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="info">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="info">তথ্য</TabsTrigger>
            <TabsTrigger value="jobs">নিয়োগ বিজ্ঞপ্তি</TabsTrigger>
            <TabsTrigger value="applications">আবেদনসমূহ</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            {editMode ? (
              <Card><CardContent className="p-5 space-y-4">
                <h3 className="font-semibold">তথ্য সম্পাদনা</h3>
                <p className="text-xs text-muted-foreground">পরিবর্তনগুলো অ্যাডমিনের অনুমোদনের পর প্রদর্শিত হবে।</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>ফোন</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>ইমেইল</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div><Label>ঠিকানা</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <div><Label>প্রধানের নাম</Label><Input value={form.head_name} onChange={e => setForm({ ...form, head_name: e.target.value })} /></div>
                <div><Label>বিবরণ</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>শিক্ষক সংখ্যা</Label><Input type="number" value={form.total_teachers} onChange={e => setForm({ ...form, total_teachers: Number(e.target.value) })} /></div>
                  <div><Label>শিক্ষার্থী সংখ্যা</Label><Input type="number" value={form.total_students} onChange={e => setForm({ ...form, total_students: Number(e.target.value) })} /></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-1"><Save size={14} /> জমা দিন</Button>
                  <Button variant="outline" onClick={() => setEditMode(false)}>বাতিল</Button>
                </div>
              </CardContent></Card>
            ) : (
              <Card><CardContent className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/50 p-3 rounded"><span className="text-[10px] text-muted-foreground block">ঠিকানা</span>{branch.address || "—"}</div>
                  <div className="bg-muted/50 p-3 rounded"><span className="text-[10px] text-muted-foreground block">জেলা</span>{branch.district || "—"}</div>
                  <div className="bg-muted/50 p-3 rounded"><span className="text-[10px] text-muted-foreground block">ফোন</span>{branch.phone || "—"}</div>
                  <div className="bg-muted/50 p-3 rounded"><span className="text-[10px] text-muted-foreground block">ইমেইল</span>{branch.email || "—"}</div>
                  <div className="bg-muted/50 p-3 rounded"><span className="text-[10px] text-muted-foreground block">প্রধান</span>{branch.head_name || "—"}</div>
                  <div className="bg-muted/50 p-3 rounded"><span className="text-[10px] text-muted-foreground block">ওয়েবসাইট</span>{branch.website || "—"}</div>
                </div>
                {branch.description && <p className="text-sm text-muted-foreground">{branch.description}</p>}
              </CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="mt-4">
            <div className="space-y-3">
              {!jobs?.length ? <p className="text-sm text-muted-foreground text-center py-8">কোনো নিয়োগ বিজ্ঞপ্তি নেই। অ্যাডমিন থেকে যোগ করা হবে।</p> :
               jobs.map((j: any) => (
                <Card key={j.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{j.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                          {j.subject && <span>{j.subject}</span>}
                          {j.deadline && <span>শেষ: {new Date(j.deadline).toLocaleDateString("bn-BD")}</span>}
                        </div>
                      </div>
                      <Badge variant={j.is_active ? "default" : "secondary"}>{j.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>নাম</TableHead><TableHead>পদ</TableHead><TableHead>ফোন</TableHead><TableHead>স্ট্যাটাস</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {!applications?.length ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">কোনো আবেদন নেই</TableCell></TableRow> :
                   applications.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-sm">{a.applicant_name}</TableCell>
                      <TableCell className="text-xs">{a.job_postings?.title || "—"}</TableCell>
                      <TableCell className="text-xs">{a.phone}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === "approved" ? "default" : "secondary"} className="text-[10px]">
                          {a.status === "pending" ? "অপেক্ষমান" : a.status === "approved" ? "অনুমোদিত" : a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default BranchDashboard;
