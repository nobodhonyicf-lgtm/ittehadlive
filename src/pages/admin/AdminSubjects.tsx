import { useState } from "react";
import { useAllSubjects } from "@/hooks/useBoardData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, BookOpen, Search } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const AdminSubjects = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const { data: subjects } = useAllSubjects();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", code: "", full_marks: 100, pass_marks: 33, class_name: "", sort_order: 0 });

  const resetForm = () => { setForm({ name: "", code: "", full_marks: 100, pass_marks: 33, class_name: "", sort_order: 0 }); setEditing(null); };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, code: s.code || "", full_marks: s.full_marks, pass_marks: s.pass_marks, class_name: s.class_name || "", sort_order: s.sort_order || 0 });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return toast.error("নাম দিন");
    const payload = { ...form, full_marks: Number(form.full_marks), pass_marks: Number(form.pass_marks), sort_order: Number(form.sort_order), class_name: form.class_name || null };
    if (editing) { const { error } = await supabase.from("subjects").update(payload).eq("id", editing.id); if (error) return toast.error(error.message); }
    else { const { error } = await supabase.from("subjects").insert(payload); if (error) return toast.error(error.message); }
    qc.invalidateQueries({ queryKey: ["all_subjects"] });
    setOpen(false); resetForm();
    toast.success("সংরক্ষিত");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("মুছতে চান?")) return;
    await supabase.from("subjects").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["all_subjects"] });
    toast.success("মুছে ফেলা হয়েছে");
  };

  const filtered = subjects?.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <AdminPageWrapper
      title="বিষয় ব্যবস্থাপনা"
      icon={BookOpen}
      action={
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
          {canEdit && <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus size={16} /> নতুন বিষয়</Button></DialogTrigger>}
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "সম্পাদনা" : "নতুন বিষয়"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>নাম *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>কোড</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
                <div><Label>পূর্ণমান</Label><Input type="number" value={form.full_marks} onChange={e => setForm({ ...form, full_marks: Number(e.target.value) })} /></div>
                <div><Label>পাসমার্ক</Label><Input type="number" value={form.pass_marks} onChange={e => setForm({ ...form, pass_marks: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>ক্লাস</Label><Input value={form.class_name} onChange={e => setForm({ ...form, class_name: e.target.value })} placeholder="সবার জন্য খালি রাখুন" /></div>
                <div><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "আপডেট" : "সংরক্ষণ"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input placeholder="বিষয় খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="space-y-2">
        {filtered.map(s => (
          <Card key={s.id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">{s.name} {s.code && <span className="text-muted-foreground">({s.code})</span>}</p>
                <p className="text-xs text-muted-foreground">পূর্ণমান: {s.full_marks} | পাস: {s.pass_marks} | ক্লাস: {s.class_name || "সকল"}</p>
              </div>
              <div className="flex gap-2">
                {canEdit && <Button variant="outline" size="icon" onClick={() => openEdit(s)}><Edit size={14} /></Button>}
                {canDelete && <Button variant="destructive" size="icon" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSubjects;
