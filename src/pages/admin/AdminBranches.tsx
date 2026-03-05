import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { useQueryClient as useQC } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Building2, Search, Eye, CheckCircle, XCircle, Clock, UserPlus } from "lucide-react";
import { toBengali, toBengaliNumber } from "@/lib/bengali";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const emptyForm = {
  name: "", code: "", address: "", phone: "", email: "", head_name: "",
  head_photo_url: "", image_url: "", website: "", total_teachers: 0, total_students: 0, sort_order: 0,
  district: "", departments: "", classes: "", description: "", user_id: "",
};

/* ─── Active Branches Tab ─── */
const BranchesTab = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const { data: branches, isLoading } = useQuery({
    queryKey: ["all_branches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Get users for assignment
  const { data: users } = useQuery({
    queryKey: ["admin_users_for_assign"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, full_name, phone").order("full_name");
      return data || [];
    },
  });

  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({
      name: b.name, code: b.code || "", address: b.address || "", phone: b.phone || "",
      email: b.email || "", head_name: b.head_name || "", head_photo_url: b.head_photo_url || "",
      image_url: b.image_url || "", website: b.website || "",
      total_teachers: b.total_teachers || 0, total_students: b.total_students || 0,
      sort_order: b.sort_order || 0, district: b.district || "",
      departments: b.departments || "", classes: b.classes || "",
      description: b.description || "", user_id: b.user_id || "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return toast.error("নাম দিন");
    const payload = {
      ...form,
      sort_order: Number(form.sort_order) || 0,
      total_teachers: Number(form.total_teachers) || 0,
      total_students: Number(form.total_students) || 0,
      head_photo_url: form.head_photo_url || null,
      website: form.website || null,
      user_id: form.user_id || null,
      district: form.district || null,
      departments: form.departments || null,
      classes: form.classes || null,
      description: form.description || null,
      status: "active",
    } as any;
    if (editing) {
      const { error } = await supabase.from("branches").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("শাখা আপডেট হয়েছে");
    } else {
      const { error } = await supabase.from("branches").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("শাখা যোগ হয়েছে");
    }
    qc.invalidateQueries({ queryKey: ["all_branches"] });
    setOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    const { error } = await supabase.from("branches").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("মুছে ফেলা হয়েছে");
    qc.invalidateQueries({ queryKey: ["all_branches"] });
  };

  const activeBranches = branches?.filter((b: any) => b.status === "active" || !b.status) || [];
  const filtered = activeBranches.filter((b: any) => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="শাখা খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          {canEdit && <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> নতুন শাখা</Button>
          </DialogTrigger>}
          <DialogContent className="max-w-lg max-h-[90vh]">
            <DialogHeader><DialogTitle>{editing ? "শাখা সম্পাদনা" : "নতুন শাখা"}</DialogTitle></DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-3">
                <div><Label>নাম *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>কোড</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
                  <div><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
                </div>
                <div><Label>ঠিকানা</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <div><Label>জেলা</Label><Input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
                <div><Label>মাদরাসার ছবি URL</Label><Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} /></div>
                
                <hr className="my-2" />
                <p className="text-sm font-bold text-primary">মুহতামিম / প্রধান শিক্ষক তথ্য</p>
                <div><Label>প্রধানের নাম</Label><Input value={form.head_name} onChange={e => setForm({ ...form, head_name: e.target.value })} /></div>
                <div><Label>প্রধানের ছবি URL</Label><Input value={form.head_photo_url} onChange={e => setForm({ ...form, head_photo_url: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>ফোন</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>ইমেইল</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div><Label>ওয়েবসাইট</Label><Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." /></div>

                <hr className="my-2" />
                <p className="text-sm font-bold text-primary">শিক্ষা তথ্য</p>
                <div><Label>বিভাগসমূহ</Label><Input value={form.departments} onChange={e => setForm({ ...form, departments: e.target.value })} placeholder="হিফজ, কিতাব, মক্তব" /></div>
                <div><Label>শ্রেণীসমূহ</Label><Input value={form.classes} onChange={e => setForm({ ...form, classes: e.target.value })} /></div>
                <div><Label>বিবরণ</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>

                <hr className="my-2" />
                <p className="text-sm font-bold text-primary">পরিসংখ্যান ও এসাইনমেন্ট</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>মোট শিক্ষক</Label><Input type="number" value={form.total_teachers} onChange={e => setForm({ ...form, total_teachers: Number(e.target.value) })} /></div>
                  <div><Label>মোট শিক্ষার্থী</Label><Input type="number" value={form.total_students} onChange={e => setForm({ ...form, total_students: Number(e.target.value) })} /></div>
                </div>
                <div>
                  <Label className="flex items-center gap-1"><UserPlus size={14} /> ইউজার এসাইন করুন</Label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background h-10 mt-1" value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })}>
                    <option value="">কোনো ইউজার নেই</option>
                    {users?.map((u: any) => <option key={u.user_id} value={u.user_id}>{u.full_name || "নাম নেই"} ({u.phone || "ফোন নেই"})</option>)}
                  </select>
                </div>

                <Button onClick={handleSave} className="w-full">{editing ? "আপডেট" : "সংরক্ষণ"}</Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>নাম</TableHead><TableHead>কোড</TableHead><TableHead>জেলা</TableHead><TableHead>প্রধান</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow> :
             filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">কোনো শাখা নেই</TableCell></TableRow> :
             filtered.map((b: any) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {b.image_url ? <img src={b.image_url} alt="" className="w-8 h-8 rounded object-contain bg-muted" /> : <Building2 size={16} className="text-muted-foreground" />}
                    <span className="font-medium text-sm">{b.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{b.code ? toBengali(b.code) : "—"}</TableCell>
                <TableCell className="text-sm">{b.district || "—"}</TableCell>
                <TableCell className="text-sm">{b.head_name || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    {canEdit && <Button variant="outline" size="icon" onClick={() => openEdit(b)}><Edit size={14} /></Button>}
                    {canDelete && <Button variant="destructive" size="icon" onClick={() => handleDelete(b.id)}><Trash2 size={14} /></Button>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

/* ─── Pending Registrations Tab ─── */
const PendingTab = () => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");

  const { data: pending, isLoading } = useQuery({
    queryKey: ["pending_branches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("*").eq("status", "pending").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const getNextCode = async (): Promise<string> => {
    const { data } = await supabase.from("branches").select("code").order("code", { ascending: false });
    if (!data || data.length === 0) return "001";
    let maxCode = 0;
    data.forEach((b: any) => { const num = parseInt(b.code || "0"); if (!isNaN(num) && num > maxCode) maxCode = num; });
    return String(maxCode + 1).padStart(3, "0");
  };

  const handleApprove = async (branch: any) => {
    const nextCode = await getNextCode();
    const { error } = await supabase.from("branches").update({
      status: "active",
      is_active: true,
      code: branch.code || nextCode,
      admin_note: adminNote || null,
    } as any).eq("id", branch.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`শাখা অনুমোদিত হয়েছে (কোড: ${branch.code || nextCode})`);
    setSelected(null);
    qc.invalidateQueries({ queryKey: ["pending_branches"] });
    qc.invalidateQueries({ queryKey: ["all_branches"] });
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from("branches").update({ status: "rejected", admin_note: adminNote || null } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("প্রত্যাখ্যাত হয়েছে");
    setSelected(null);
    qc.invalidateQueries({ queryKey: ["pending_branches"] });
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "অপেক্ষমান", color: "bg-orange-100 text-orange-700" },
    active: { label: "অনুমোদিত", color: "bg-green-100 text-green-700" },
    rejected: { label: "প্রত্যাখ্যাত", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>প্রতিষ্ঠান</TableHead><TableHead>জেলা</TableHead><TableHead>ফোন</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow> :
             !pending?.length ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">কোনো অপেক্ষমান আবেদন নেই</TableCell></TableRow> :
             pending.map((b: any) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {b.image_url ? <img src={b.image_url} alt="" className="w-8 h-8 rounded object-contain bg-muted" /> : <Building2 size={16} className="text-muted-foreground" />}
                    <div>
                      <div className="font-medium text-sm">{b.name}</div>
                      {b.head_name && <div className="text-[10px] text-muted-foreground">{b.head_name}</div>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{b.district || "—"}</TableCell>
                <TableCell className="text-sm">{b.phone || "—"}</TableCell>
                <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${statusMap[b.status]?.color || ""}`}>{statusMap[b.status]?.label || b.status}</span></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setSelected(b); setAdminNote(b.admin_note || ""); }}><Eye size={16} /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>প্রতিষ্ঠানের বিস্তারিত</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {selected.image_url ? <img src={selected.image_url} alt="" className="w-14 h-14 rounded-lg object-contain bg-muted" /> : <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 size={24} className="text-primary" /></div>}
                <div>
                  <h3 className="font-bold">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground">{selected.district} · {selected.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selected.email && <div className="bg-muted/50 p-2 rounded"><span className="text-[10px] text-muted-foreground block">ইমেইল</span>{selected.email}</div>}
                {selected.head_name && <div className="bg-muted/50 p-2 rounded"><span className="text-[10px] text-muted-foreground block">মুহতামিম</span>{selected.head_name}</div>}
                <div className="bg-muted/50 p-2 rounded"><span className="text-[10px] text-muted-foreground block">ছাত্র</span>{toBengaliNumber(selected.total_students || 0)}</div>
                <div className="bg-muted/50 p-2 rounded"><span className="text-[10px] text-muted-foreground block">শিক্ষক</span>{toBengaliNumber(selected.total_teachers || 0)}</div>
                {selected.departments && <div className="bg-muted/50 p-2 rounded col-span-2"><span className="text-[10px] text-muted-foreground block">বিভাগ</span>{selected.departments}</div>}
                {selected.classes && <div className="bg-muted/50 p-2 rounded col-span-2"><span className="text-[10px] text-muted-foreground block">শ্রেণী</span>{selected.classes}</div>}
              </div>
              {selected.description && <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">{selected.description}</p>}
              <div className="flex flex-wrap gap-2">
                {selected.registration_cert_url && <a href={selected.registration_cert_url} target="_blank" rel="noopener noreferrer"><Badge variant="outline" className="cursor-pointer">📄 রেজিস্ট্রেশন সার্টিফিকেট</Badge></a>}
                {selected.approval_letter_url && <a href={selected.approval_letter_url} target="_blank" rel="noopener noreferrer"><Badge variant="outline" className="cursor-pointer">📄 অনুমোদন পত্র</Badge></a>}
              </div>
              <div className="border-t pt-3 space-y-3">
                <Textarea placeholder="অ্যাডমিন নোট..." value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2} />
                <p className="text-xs text-muted-foreground">অনুমোদন করলে স্বয়ংক্রিয়ভাবে শাখা পাতায় যুক্ত হবে এবং একটি কোড বরাদ্দ হবে।</p>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(selected)}>
                    <CheckCircle size={14} /> অনুমোদন
                  </Button>
                  <Button variant="destructive" className="flex-1 gap-1" onClick={() => handleReject(selected.id)}>
                    <XCircle size={14} /> প্রত্যাখ্যান
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─── Main Page ─── */
const AdminBranches = () => {
  const { data: pendingCount } = useQuery({
    queryKey: ["pending_branches_count"],
    queryFn: async () => {
      const { count } = await supabase.from("branches").select("id", { count: "exact", head: true }).eq("status", "pending");
      return count || 0;
    },
  });

  return (
    <AdminPageWrapper title="শাখা ও প্রতিষ্ঠান ব্যবস্থাপনা" icon={Building2}>
      <Tabs defaultValue="branches">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="branches" className="gap-1 text-xs"><Building2 size={14} /> শাখা</TabsTrigger>
          <TabsTrigger value="pending" className="gap-1 text-xs">
            <Clock size={14} /> আবেদন {pendingCount ? <Badge variant="destructive" className="ml-1 text-[10px] h-4 px-1">{pendingCount}</Badge> : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="branches" className="mt-4"><BranchesTab /></TabsContent>
        <TabsContent value="pending" className="mt-4"><PendingTab /></TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
};

export default AdminBranches;
