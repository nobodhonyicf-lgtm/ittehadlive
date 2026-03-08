import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Plus, Edit, Trash2, GraduationCap, Search, Eye, CheckCircle, XCircle, Clock, BadgeCheck, UserPlus, BookOpen, MapPin, DollarSign, CalendarDays, Star, ClipboardList, Megaphone, Briefcase, ImageOff, Building2, Bell } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

/* ─── Teachers Tab ─── */
const TeachersTab = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sendPush, setSendPush] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", district: "", subject: "",
    qualification: "", experience_years: 0, specialization: "", certification: "",
    bio: "", photo_url: "", preferred_area: "", expected_salary: "",
    is_available: true, is_active: true, is_verified: false, sort_order: 0,
    exam_result: "", grade_obtained: "", previous_institution: "",
    institution_id: "",
  });

  // Fetch branches for assignment (merged from institutions)
  const { data: branchesList } = useQuery({
    queryKey: ["admin_branches_for_teacher_assign"],
    queryFn: async () => {
      const { data } = await supabase.from("branches").select("id, name, image_url").eq("status", "active").order("name");
      return data || [];
    },
  });

  const { data: teachers, isLoading } = useQuery({
    queryKey: ["admin_teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const filtered = teachers?.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase())) || [];

  const saveMutation = useMutation({
    mutationFn: async (d: typeof form) => {
      const payload = { ...d, email: d.email || null, photo_url: d.photo_url || null, bio: d.bio || null, certification: d.certification || null, specialization: d.specialization || null, preferred_area: d.preferred_area || null, expected_salary: d.expected_salary || null, exam_result: d.exam_result || null, grade_obtained: d.grade_obtained || null, previous_institution: d.previous_institution || null, institution_id: d.institution_id || null } as any;
      // If branch selected, get its logo for affiliate badge
      if (d.institution_id) {
        const branch = (branchesList as any[])?.find((b: any) => b.id === d.institution_id);
        if (branch?.image_url) payload.institution_logo_url = branch.image_url;
      } else {
        payload.institution_logo_url = null;
      }
      if (editId) { const { error } = await supabase.from("teachers").update(payload).eq("id", editId); if (error) throw error; return editId; }
      else { const { data: inserted, error } = await supabase.from("teachers").insert([payload]).select("id").single(); if (error) throw error; return inserted?.id; }
    },
    onSuccess: (insertedId?: string) => {
      toast.success("সংরক্ষিত");
      if (sendPush && !editId && insertedId) {
        supabase.functions.invoke("send-push", {
          body: {
            title: `📋 নতুন শিক্ষক: ${form.name}`,
            body: `${form.subject} বিষয়ে নতুন শিক্ষক যুক্ত হয়েছেন${form.district ? ` (${form.district})` : ""}`,
            url: `/teachers?highlight=${insertedId}`,
            image: form.photo_url || undefined,
          },
        }).then(() => toast.success("পুশ নোটিফিকেশন পাঠানো হয়েছে")).catch(() => toast.error("পুশ পাঠানো ব্যর্থ"));
      }
      setSendPush(false);
      setOpen(false); setEditId(null); queryClient.invalidateQueries({ queryKey: ["admin_teachers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("teachers").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("মুছে ফেলা হয়েছে"); queryClient.invalidateQueries({ queryKey: ["admin_teachers"] }); },
  });

  const resetForm = () => setForm({ name: "", phone: "", email: "", address: "", district: "", subject: "", qualification: "", experience_years: 0, specialization: "", certification: "", bio: "", photo_url: "", preferred_area: "", expected_salary: "", is_available: true, is_active: true, is_verified: false, sort_order: 0, exam_result: "", grade_obtained: "", previous_institution: "", institution_id: "" });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="শিক্ষক খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          {canEdit && <DialogTrigger asChild><Button size="sm" onClick={() => { setEditId(null); resetForm(); }}><Plus size={16} className="mr-1" /> নতুন শিক্ষক</Button></DialogTrigger>}
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "সম্পাদনা" : "নতুন শিক্ষক"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>নাম *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div><Label>বিষয় *</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>ফোন</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>ইমেইল</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>ঠিকানা</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <div><Label>জেলা</Label><Input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>যোগ্যতা</Label><Input value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} /></div>
                <div><Label>অভিজ্ঞতা (বছর)</Label><Input type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>বিশেষ দক্ষতা</Label><Input value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} /></div>
                <div><Label>সার্টিফিকেশন</Label><Input value={form.certification} onChange={e => setForm({ ...form, certification: e.target.value })} /></div>
              </div>
              {/* New fields */}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>পরীক্ষার ফলাফল</Label><Input value={form.exam_result} onChange={e => setForm({ ...form, exam_result: e.target.value })} placeholder="যেমন: দাওরায়ে হাদিস - ১ম বিভাগ" /></div>
                <div><Label>গ্রেড</Label><Input value={form.grade_obtained} onChange={e => setForm({ ...form, grade_obtained: e.target.value })} placeholder="যেমন: মুমতাজ / জায়্যিদ জিদ্দান" /></div>
              </div>
               <div><Label>পূর্ববর্তী প্রতিষ্ঠান</Label><Input value={form.previous_institution} onChange={e => setForm({ ...form, previous_institution: e.target.value })} placeholder="পূর্বে যেখানে কাজ করেছেন" /></div>
               {/* Assign to Branch/Institution */}
               <div>
                 <Label className="flex items-center gap-1"><Building2 size={14} /> প্রতিষ্ঠান/শাখা এসাইন</Label>
                 <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background h-10 mt-1" value={form.institution_id} onChange={e => setForm({ ...form, institution_id: e.target.value })}>
                   <option value="">কোনো প্রতিষ্ঠান নেই</option>
                   {(branchesList as any[])?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                 </select>
               </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>পছন্দের এলাকা</Label><Input value={form.preferred_area} onChange={e => setForm({ ...form, preferred_area: e.target.value })} /></div>
                <div><Label>প্রত্যাশিত বেতন</Label><Input value={form.expected_salary} onChange={e => setForm({ ...form, expected_salary: e.target.value })} /></div>
              </div>
              <div><Label>ছবি URL</Label><Input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} /></div>
              <div><Label>জীবনবৃত্তান্ত</Label><Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_available} onCheckedChange={v => setForm({ ...form, is_available: v })} />উপলব্ধ</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />সক্রিয়</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_verified} onCheckedChange={v => setForm({ ...form, is_verified: v })} /><BadgeCheck size={16} className="text-blue-500" /> যাচাইকৃত</label>
              </div>
              {!editId && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={sendPush} onCheckedChange={(v) => setSendPush(!!v)} />
                  <Bell size={14} className="text-primary" /> সংরক্ষণের পর পুশ নোটিফিকেশন পাঠান
                </label>
              )}
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">সংরক্ষণ</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>নাম</TableHead><TableHead>বিষয়</TableHead><TableHead>জেলা</TableHead><TableHead>অভিজ্ঞতা</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead>যাচাই</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow></TableHeader>
          <TableBody>
             {isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow> :
              filtered.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">কোনো শিক্ষক নেই</TableCell></TableRow> :
              filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell>{t.district || "—"}</TableCell>
                  <TableCell>{t.experience_years} বছর</TableCell>
                   <TableCell>
                     <Badge variant={t.is_available ? "default" : "secondary"}>{t.is_available ? "উপলব্ধ" : "অনুপলব্ধ"}</Badge>
                   </TableCell>
                   <TableCell>
                     {(t as any).is_verified ? <BadgeCheck size={18} className="text-blue-500" /> : <span className="text-muted-foreground text-xs">—</span>}
                   </TableCell>
                   <TableCell className="text-right">
                      {canEdit && <Button variant="ghost" size="icon" title="পুশ নোটিফিকেশন পাঠান" onClick={() => {
                        supabase.functions.invoke("send-push", {
                          body: {
                            title: `📋 শিক্ষক তথ্য: ${t.name}`,
                            body: `${t.subject} বিষয়ে শিক্ষক${t.district ? ` (${t.district})` : ""}`,
                            url: `/teachers?highlight=${t.id}`,
                            image: t.photo_url || undefined,
                          },
                        }).then(() => toast.success("পুশ নোটিফিকেশন পাঠানো হয়েছে")).catch(() => toast.error("পুশ পাঠানো ব্যর্থ"));
                      }}><Bell size={16} className="text-primary" /></Button>}
                     {canEdit && <Button variant="ghost" size="icon" onClick={() => {
                       setEditId(t.id);
                        setForm({ name: t.name, phone: t.phone || "", email: t.email || "", address: t.address || "", district: t.district || "", subject: t.subject, qualification: t.qualification || "", experience_years: t.experience_years || 0, specialization: t.specialization || "", certification: t.certification || "", bio: t.bio || "", photo_url: t.photo_url || "", preferred_area: t.preferred_area || "", expected_salary: t.expected_salary || "", is_available: t.is_available ?? true, is_active: t.is_active ?? true, is_verified: (t as any).is_verified ?? false, sort_order: t.sort_order || 0, exam_result: (t as any).exam_result || "", grade_obtained: (t as any).grade_obtained || "", previous_institution: (t as any).previous_institution || "", institution_id: (t as any).institution_id || "" });
                        setOpen(true);
                     }}><Edit size={16} /></Button>}
                     {canDelete && <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(t.id)}><Trash2 size={16} className="text-destructive" /></Button>}
                   </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

/* ─── Applications Tab ─── */
const ApplicationsTab = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [detailApp, setDetailApp] = useState<any>(null);

  const { data: apps, isLoading } = useQuery({
    queryKey: ["admin_teacher_apps", statusFilter],
    queryFn: async () => {
      let q = supabase.from("teacher_applications").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { error } = await supabase.from("teacher_applications").update({ status, admin_note: note || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("আপডেট হয়েছে"); queryClient.invalidateQueries({ queryKey: ["admin_teacher_apps"] }); },
  });

  const convertToTeacher = useMutation({
    mutationFn: async (app: any) => {
      const { error: insertErr } = await supabase.from("teachers").insert([{
        name: app.name, phone: app.phone, email: app.email || null,
        address: app.address || null, district: app.district || null,
        subject: app.subject, qualification: app.qualification || null,
        experience_years: app.experience_years || 0,
        specialization: app.specialization || null, certification: app.certification || null,
        bio: app.bio || null, photo_url: app.photo_url || null,
        preferred_area: app.preferred_area || null, expected_salary: app.expected_salary || null,
        is_available: true, is_active: true,
      }] as any);
      if (insertErr) throw insertErr;
      const { error: updateErr } = await supabase.from("teacher_applications").update({ status: "approved" }).eq("id", app.id);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      toast.success("শিক্ষক হিসেবে যোগ করা হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["admin_teacher_apps"] });
      queryClient.invalidateQueries({ queryKey: ["admin_teachers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("teacher_applications").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("মুছে ফেলা হয়েছে"); queryClient.invalidateQueries({ queryKey: ["admin_teacher_apps"] }); },
  });

  const statusColors: Record<string, string> = { pending: "bg-accent text-accent-foreground", approved: "bg-primary/10 text-primary", rejected: "bg-destructive/10 text-destructive" };
  const statusLabels: Record<string, string> = { pending: "অপেক্ষমান", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত" };

  const deleteFilesFromStorage = async (app: any) => {
    const filesToDelete: string[] = [];
    const extractPath = (url: string) => {
      try {
        const match = url.match(/\/uploads\/(.+)$/);
        return match ? match[1] : null;
      } catch { return null; }
    };
    if (app.nid_image_url) { const p = extractPath(app.nid_image_url); if (p) filesToDelete.push(p); }
    if (app.verification_video_url) { const p = extractPath(app.verification_video_url); if (p) filesToDelete.push(p); }
    if (app.photo_url) { const p = extractPath(app.photo_url); if (p) filesToDelete.push(p); }
    if (filesToDelete.length === 0) { toast.info("কোনো ফাইল পাওয়া যায়নি"); return; }
    const { error } = await supabase.storage.from("uploads").remove(filesToDelete);
    if (error) { toast.error("ফাইল মুছতে ব্যর্থ: " + error.message); return; }
    // Clear URLs from the application record
    await supabase.from("teacher_applications").update({ nid_image_url: null, verification_video_url: null, photo_url: null } as any).eq("id", app.id);
    toast.success(`${filesToDelete.length}টি ফাইল মুছে ফেলা হয়েছে`);
    queryClient.invalidateQueries({ queryKey: ["admin_teacher_apps"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "approved", "rejected"].map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
            {s === "all" ? "সকল" : statusLabels[s]} {s === "pending" && apps?.length ? `(${apps.length})` : ""}
          </Button>
        ))}
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>নাম</TableHead><TableHead>বিষয়</TableHead><TableHead>ফোন</TableHead><TableHead>জেলা</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow> :
              !apps?.length ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">কোনো আবেদন নেই</TableCell></TableRow> :
              apps.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.subject}</TableCell>
                  <TableCell>{a.phone}</TableCell>
                  <TableCell>{a.district || "—"}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-0.5 rounded ${statusColors[a.status] || ""}`}>{statusLabels[a.status] || a.status}</span></TableCell>
                   <TableCell className="text-right space-x-1">
                     <Button variant="ghost" size="icon" onClick={() => setDetailApp(a)}><Eye size={16} /></Button>
                     {canEdit && a.status === "pending" && <>
                       <Button variant="ghost" size="icon" title="অনুমোদন ও শিক্ষক হিসেবে যোগ" onClick={() => convertToTeacher.mutate(a)}><UserPlus size={16} className="text-primary" /></Button>
                       <Button variant="ghost" size="icon" onClick={() => updateStatus.mutate({ id: a.id, status: "rejected" })}><XCircle size={16} className="text-destructive" /></Button>
                     </>}
                     {canEdit && a.status === "approved" && (
                       <Button variant="ghost" size="icon" title="শিক্ষক হিসেবে পুনরায় যোগ" onClick={() => convertToTeacher.mutate(a)}><UserPlus size={16} className="text-primary" /></Button>
                     )}
                      {canDelete && <Button variant="ghost" size="icon" title="ফাইল মুছুন" onClick={() => { if(confirm("এই আবেদনের সকল আপলোড ফাইল (ছবি, ভিডিও) স্থায়ীভাবে মুছে ফেলতে চান?")) deleteFilesFromStorage(a); }}><ImageOff size={16} className="text-orange-500" /></Button>}
                     {canDelete && <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(a.id)}><Trash2 size={16} className="text-destructive" /></Button>}
                   </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={!!detailApp} onOpenChange={o => !o && setDetailApp(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>আবেদনের বিস্তারিত</DialogTitle></DialogHeader>
          {detailApp && (
            <div className="space-y-3 text-sm">
              {detailApp.photo_url && <img src={detailApp.photo_url} alt="" className="w-20 h-20 rounded-full object-cover" />}
              <div className="grid grid-cols-2 gap-2">
                <p><strong>নাম:</strong> {detailApp.name}</p>
                <p><strong>বিষয়:</strong> {detailApp.subject}</p>
                <p><strong>ফোন:</strong> {detailApp.phone}</p>
                <p><strong>ইমেইল:</strong> {detailApp.email || "—"}</p>
                <p><strong>জেলা:</strong> {detailApp.district || "—"}</p>
                <p><strong>ঠিকানা:</strong> {detailApp.address || "—"}</p>
                <p><strong>যোগ্যতা:</strong> {detailApp.qualification || "—"}</p>
                <p><strong>অভিজ্ঞতা:</strong> {detailApp.experience_years} বছর</p>
                <p><strong>দক্ষতা:</strong> {detailApp.specialization || "—"}</p>
                <p><strong>সার্টিফিকেশন:</strong> {detailApp.certification || "—"}</p>
                <p><strong>পছন্দের এলাকা:</strong> {detailApp.preferred_area || "—"}</p>
                <p><strong>প্রত্যাশিত বেতন:</strong> {detailApp.expected_salary || "—"}</p>
                <p><strong>রেফারেন্স:</strong> {detailApp.reference_name || "—"} ({detailApp.reference_phone || "—"})</p>
              </div>
              {detailApp.bio && <p><strong>জীবনবৃত্তান্ত:</strong> {detailApp.bio}</p>}
              {detailApp.cv_url && <a href={detailApp.cv_url} target="_blank" rel="noopener" className="text-primary underline">সিভি দেখুন</a>}

              {((detailApp as any).nid_image_url || (detailApp as any).verification_video_url) && (
                <div className="border-t pt-3 space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    🛡️ পরিচয় যাচাই ডকুমেন্ট
                  </h4>
                  {(detailApp as any).nid_image_url && (
                    <div>
                      <p className="text-xs font-medium mb-1">ভোটার আইডি / জন্ম নিবন্ধন:</p>
                      <a href={(detailApp as any).nid_image_url} target="_blank" rel="noopener">
                        <img src={(detailApp as any).nid_image_url} alt="NID" className="max-w-full max-h-48 rounded-lg border object-contain cursor-pointer hover:opacity-80 transition" />
                      </a>
                    </div>
                  )}
                  {(detailApp as any).verification_video_url && (
                    <div>
                      <p className="text-xs font-medium mb-1">সেলফি ভিডিও:</p>
                      <video
                        src={(detailApp as any).verification_video_url}
                        controls
                        className="max-w-full max-h-48 rounded-lg border"
                        preload="metadata"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─── Job Postings Tab ─── */
const JobPostingsTab = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sendJobPush, setSendJobPush] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "", qualification_required: "", experience_required: "", salary_range: "", location: "", deadline: "", is_active: true, branch_id: "" });

  const { data: branches } = useQuery({
    queryKey: ["admin_branches_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("id, name, image_url").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin_job_postings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_postings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (d: typeof form) => {
      const payload = { ...d, deadline: d.deadline || null, description: d.description || null, subject: d.subject || null, qualification_required: d.qualification_required || null, experience_required: d.experience_required || null, salary_range: d.salary_range || null, location: d.location || null, branch_id: d.branch_id || null };
      if (editId) { const { error } = await supabase.from("job_postings").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("job_postings").insert([payload]); if (error) throw error; }
    },
    onSuccess: () => {
      toast.success("সংরক্ষিত");
      if (sendJobPush && !editId) {
        const branchLogo = form.branch_id ? branches?.find(b => b.id === form.branch_id) : null;
        supabase.functions.invoke("send-push", {
          body: {
            title: `📢 নিয়োগ বিজ্ঞপ্তি: ${form.title}`,
            body: `${form.subject ? form.subject + " বিষয়ে " : ""}নতুন নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে${form.location ? ` (${form.location})` : ""}`,
            url: `/teachers?job=${form.title}`,
            image: (branchLogo as any)?.image_url || undefined,
          },
        }).then(({ data, error }) => {
          if (error) { toast.error("পুশ পাঠানো ব্যর্থ"); console.error(error); }
          else toast.success(`পুশ পাঠানো হয়েছে (${data?.sent || 0}/${data?.total || 0})`);
        });
      }
      setSendJobPush(false);
      setOpen(false); setEditId(null); queryClient.invalidateQueries({ queryKey: ["admin_job_postings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("job_postings").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("মুছে ফেলা হয়েছে"); queryClient.invalidateQueries({ queryKey: ["admin_job_postings"] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          {canEdit && <DialogTrigger asChild><Button size="sm" onClick={() => { setEditId(null); setForm({ title: "", description: "", subject: "", qualification_required: "", experience_required: "", salary_range: "", location: "", deadline: "", is_active: true, branch_id: "" }); }}><Plus size={16} className="mr-1" /> নতুন বিজ্ঞপ্তি</Button></DialogTrigger>}
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "সম্পাদনা" : "নতুন নিয়োগ বিজ্ঞপ্তি"}</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>শিরোনাম *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                <div>
                  <Label>প্রতিষ্ঠান (ব্রাঞ্চ)</Label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background h-10" value={form.branch_id} onChange={e => setForm({ ...form, branch_id: e.target.value })}>
                    <option value="">নির্বাচন করুন</option>
                    {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>বিবরণ</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>বিষয়</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
                <div><Label>যোগ্যতা</Label><Input value={form.qualification_required} onChange={e => setForm({ ...form, qualification_required: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>অভিজ্ঞতা</Label><Input value={form.experience_required} onChange={e => setForm({ ...form, experience_required: e.target.value })} /></div>
                <div><Label>বেতন</Label><Input value={form.salary_range} onChange={e => setForm({ ...form, salary_range: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>অবস্থান</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                <div><Label>শেষ তারিখ</Label><Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />সক্রিয়</label>
              {!editId && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={sendJobPush} onCheckedChange={(v) => setSendJobPush(!!v)} />
                  <Bell size={14} className="text-primary" /> সংরক্ষণের পর পুশ নোটিফিকেশন পাঠান
                </label>
              )}
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">সংরক্ষণ</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-muted-foreground">লোড হচ্ছে...</p>}
        {jobs?.map(j => (
          <Card key={j.id} className={!j.is_active ? "opacity-60" : ""}>
            <CardContent className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{j.title}</h3>
                  <Badge variant={j.is_active ? "default" : "secondary"}>{j.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1 space-x-3">
                  {j.subject && <span className="inline-flex items-center gap-0.5"><BookOpen size={10} /> {j.subject}</span>}
                  {j.location && <span className="inline-flex items-center gap-0.5"><MapPin size={10} /> {j.location}</span>}
                  {j.salary_range && <span className="inline-flex items-center gap-0.5"><DollarSign size={10} /> {j.salary_range}</span>}
                  {j.deadline && <span className="inline-flex items-center gap-0.5"><CalendarDays size={10} /> {new Date(j.deadline).toLocaleDateString("bn-BD")}</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                {canEdit && <Button variant="ghost" size="icon" title="পুশ নোটিফিকেশন পাঠান" onClick={async () => {
                   try {
                     let branchLogo: string | undefined;
                     if (j.branch_id) {
                        const { data: br } = await supabase.from("branches").select("image_url").eq("id", j.branch_id).maybeSingle();
                        branchLogo = br?.image_url || undefined;
                     }
                     const { data, error } = await supabase.functions.invoke("send-push", {
                        body: {
                          title: `📢 নিয়োগ বিজ্ঞপ্তি: ${j.title}`,
                          body: `${j.subject ? j.subject + " বিষয়ে " : ""}নিয়োগ বিজ্ঞপ্তি${j.location ? ` (${j.location})` : ""}`,
                          url: `/teachers?job=${j.id}`,
                          image: branchLogo,
                        },
                     });
                     if (error) throw error;
                     toast.success(`পুশ পাঠানো হয়েছে (${data?.sent || 0}/${data?.total || 0})`);
                   } catch (err: any) {
                     console.error("Job push error:", err);
                     toast.error("পুশ পাঠানো ব্যর্থ: " + (err?.message || "অজানা ত্রুটি"));
                   }
                 }}><Bell size={16} className="text-primary" /></Button>}
                {canEdit && <Button variant="ghost" size="icon" onClick={() => {
                  setEditId(j.id);
                  setForm({ title: j.title, description: j.description || "", subject: j.subject || "", qualification_required: j.qualification_required || "", experience_required: j.experience_required || "", salary_range: j.salary_range || "", location: j.location || "", deadline: j.deadline || "", is_active: j.is_active ?? true, branch_id: j.branch_id || "" });
                  setOpen(true);
                }}><Edit size={16} /></Button>}
                {canDelete && <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(j.id)}><Trash2 size={16} className="text-destructive" /></Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ─── Reviews Tab ─── */
const ReviewsTab = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin_teacher_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_reviews")
        .select("*, teachers(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from("teacher_reviews").update({ is_approved: approved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("আপডেট হয়েছে"); queryClient.invalidateQueries({ queryKey: ["admin_teacher_reviews"] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teacher_reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("মুছে ফেলা হয়েছে"); queryClient.invalidateQueries({ queryKey: ["admin_teacher_reviews"] }); },
  });

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>শিক্ষক</TableHead><TableHead>রিভিউয়ার</TableHead><TableHead>প্রতিষ্ঠান</TableHead><TableHead>রেটিং</TableHead><TableHead>মন্তব্য</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow> :
              !reviews?.length ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">কোনো রিভিউ নেই</TableCell></TableRow> :
              reviews.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-sm">{(r as any).teachers?.name || "—"}</TableCell>
                  <TableCell className="text-sm">{r.reviewer_name}</TableCell>
                  <TableCell className="text-sm">{r.institution_name || "—"}</TableCell>
                  <TableCell><div className="flex items-center gap-0.5">{Array.from({length: r.rating}).map((_, i) => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}</div></TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{r.comment || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.is_approved ? "default" : "secondary"}>{r.is_approved ? "অনুমোদিত" : "অপেক্ষমান"}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {canEdit && !r.is_approved && (
                      <Button variant="ghost" size="icon" onClick={() => approveMutation.mutate({ id: r.id, approved: true })}>
                        <CheckCircle size={16} className="text-primary" />
                      </Button>
                    )}
                    {canEdit && r.is_approved && (
                      <Button variant="ghost" size="icon" onClick={() => approveMutation.mutate({ id: r.id, approved: false })}>
                        <XCircle size={16} className="text-muted-foreground" />
                      </Button>
                    )}
                    {canDelete && <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)}><Trash2 size={16} className="text-destructive" /></Button>}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

/* ─── Job Applications Tab ─── */
const JobApplicationsTab = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [detailApp, setDetailApp] = useState<any>(null);

  const { data: apps, isLoading } = useQuery({
    queryKey: ["admin_job_applications", statusFilter],
    queryFn: async () => {
      let q = supabase.from("job_applications").select("*, job_postings(title, branch_id)").order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { error } = await supabase.from("job_applications").update({ status, admin_note: note || null } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("আপডেট হয়েছে"); queryClient.invalidateQueries({ queryKey: ["admin_job_applications"] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("job_applications").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("মুছে ফেলা হয়েছে"); queryClient.invalidateQueries({ queryKey: ["admin_job_applications"] }); },
  });

  const statusColors: Record<string, string> = { pending: "bg-accent text-accent-foreground", reviewing: "bg-blue-100 text-blue-800", shortlisted: "bg-primary/10 text-primary", approved: "bg-green-100 text-green-800", rejected: "bg-destructive/10 text-destructive" };
  const statusLabels: Record<string, string> = { pending: "অপেক্ষমান", reviewing: "পর্যালোচনা", shortlisted: "শর্টলিস্ট", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত" };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "reviewing", "shortlisted", "approved", "rejected"].map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
            {s === "all" ? "সকল" : statusLabels[s]}
          </Button>
        ))}
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>ট্র্যাকিং</TableHead><TableHead>নাম</TableHead><TableHead>পদ</TableHead><TableHead>ফোন</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow> :
              !apps?.length ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">কোনো আবেদন নেই</TableCell></TableRow> :
              apps.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.tracking_code}</TableCell>
                  <TableCell className="font-medium">{a.applicant_name}</TableCell>
                  <TableCell className="text-xs">{a.job_postings?.title || "—"}</TableCell>
                  <TableCell className="text-xs">{a.phone}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-0.5 rounded ${statusColors[a.status] || ""}`}>{statusLabels[a.status] || a.status}</span></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => setDetailApp(a)}><Eye size={16} /></Button>
                    {canEdit && a.status === "pending" && <>
                      <Button variant="ghost" size="icon" title="শর্টলিস্ট" onClick={() => updateStatus.mutate({ id: a.id, status: "shortlisted" })}><CheckCircle size={16} className="text-primary" /></Button>
                      <Button variant="ghost" size="icon" title="প্রত্যাখ্যান" onClick={() => updateStatus.mutate({ id: a.id, status: "rejected" })}><XCircle size={16} className="text-destructive" /></Button>
                    </>}
                    {canEdit && a.status === "reviewing" && <>
                      <Button variant="ghost" size="icon" title="শর্টলিস্ট" onClick={() => updateStatus.mutate({ id: a.id, status: "shortlisted" })}><CheckCircle size={16} className="text-primary" /></Button>
                    </>}
                    {canEdit && a.status === "shortlisted" && (
                      <Button variant="ghost" size="icon" title="অনুমোদন" onClick={() => updateStatus.mutate({ id: a.id, status: "approved" })}><CheckCircle size={16} className="text-green-600" /></Button>
                    )}
                    {canDelete && <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(a.id)}><Trash2 size={16} className="text-destructive" /></Button>}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={!!detailApp} onOpenChange={o => !o && setDetailApp(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>আবেদনের বিস্তারিত</DialogTitle></DialogHeader>
          {detailApp && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                <span className="text-xs text-muted-foreground">ট্র্যাকিং:</span>
                <span className="font-mono font-bold text-primary">{detailApp.tracking_code}</span>
              </div>
              {detailApp.photo_url && <img src={detailApp.photo_url} alt="" className="w-20 h-20 rounded-full object-cover" />}
              <div className="grid grid-cols-2 gap-2">
                <p><strong>নাম:</strong> {detailApp.applicant_name}</p>
                <p><strong>পদ:</strong> {detailApp.job_postings?.title || "—"}</p>
                <p><strong>ফোন:</strong> {detailApp.phone}</p>
                <p><strong>ইমেইল:</strong> {detailApp.email || "—"}</p>
                <p><strong>জেলা:</strong> {detailApp.district || "—"}</p>
                <p><strong>ঠিকানা:</strong> {detailApp.address || "—"}</p>
                <p><strong>বিষয়:</strong> {detailApp.subject || "—"}</p>
                <p><strong>যোগ্যতা:</strong> {detailApp.qualification || "—"}</p>
                <p><strong>অভিজ্ঞতা:</strong> {detailApp.experience_years} বছর</p>
                <p><strong>প্রত্যাশিত বেতন:</strong> {detailApp.expected_salary || "—"}</p>
              </div>
              {detailApp.bio && <p><strong>পরিচিতি:</strong> {detailApp.bio}</p>}
              {detailApp.cv_url && <a href={detailApp.cv_url} target="_blank" rel="noopener" className="text-primary underline">সিভি দেখুন</a>}
              {canEdit && (
                <div className="border-t pt-3 space-y-2">
                  <Label>স্ট্যাটাস পরিবর্তন:</Label>
                  <div className="flex gap-2 flex-wrap">
                    {["pending", "reviewing", "shortlisted", "approved", "rejected"].map(s => (
                      <Button key={s} size="sm" variant={detailApp.status === s ? "default" : "outline"} onClick={() => {
                        updateStatus.mutate({ id: detailApp.id, status: s });
                        setDetailApp({ ...detailApp, status: s });
                      }}>{statusLabels[s]}</Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─── Main Page ─── */
const AdminTeachers = () => (
  <AdminPageWrapper title="শিক্ষক সার্ভিস সেন্টার" icon={GraduationCap}>
    <Tabs defaultValue="teachers">
      <TabsList className="grid grid-cols-5 w-full max-w-2xl">
        <TabsTrigger value="teachers" className="gap-1 text-xs"><GraduationCap size={14} /> শিক্ষক</TabsTrigger>
        <TabsTrigger value="applications" className="gap-1 text-xs"><ClipboardList size={14} /> আবেদন</TabsTrigger>
        <TabsTrigger value="jobs" className="gap-1 text-xs"><Megaphone size={14} /> বিজ্ঞপ্তি</TabsTrigger>
        <TabsTrigger value="job-apps" className="gap-1 text-xs"><Briefcase size={14} /> নিয়োগ আবেদন</TabsTrigger>
        <TabsTrigger value="reviews" className="gap-1 text-xs"><Star size={14} /> রিভিউ</TabsTrigger>
      </TabsList>
      <TabsContent value="teachers" className="mt-4"><TeachersTab /></TabsContent>
      <TabsContent value="applications" className="mt-4"><ApplicationsTab /></TabsContent>
      <TabsContent value="jobs" className="mt-4"><JobPostingsTab /></TabsContent>
      <TabsContent value="job-apps" className="mt-4"><JobApplicationsTab /></TabsContent>
      <TabsContent value="reviews" className="mt-4"><ReviewsTab /></TabsContent>
    </Tabs>
  </AdminPageWrapper>
);

export default AdminTeachers;
