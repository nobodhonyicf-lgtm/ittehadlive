import { useState } from "react";
import { useAllBranches } from "@/hooks/useBoardData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { toBengali } from "@/lib/bengali";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";

const emptyForm = {
  name: "", code: "", address: "", phone: "", email: "", head_name: "",
  head_photo_url: "", image_url: "", website: "", total_teachers: 0, total_students: 0, sort_order: 0,
};

const AdminBranches = () => {
  const { data: branches, isLoading } = useAllBranches();
  const { canEdit, canDelete } = useSectionPermissions();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({
      name: b.name, code: b.code || "", address: b.address || "", phone: b.phone || "",
      email: b.email || "", head_name: b.head_name || "", head_photo_url: b.head_photo_url || "",
      image_url: b.image_url || "", website: b.website || "",
      total_teachers: b.total_teachers || 0, total_students: b.total_students || 0,
      sort_order: b.sort_order || 0,
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
    };
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Building2 size={22} /> শাখা ব্যবস্থাপনা</h2>
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
                <p className="text-sm font-bold text-primary">পরিসংখ্যান</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>মোট শিক্ষক</Label><Input type="number" value={form.total_teachers} onChange={e => setForm({ ...form, total_teachers: Number(e.target.value) })} /></div>
                  <div><Label>মোট শিক্ষার্থী</Label><Input type="number" value={form.total_students} onChange={e => setForm({ ...form, total_students: Number(e.target.value) })} /></div>
                </div>

                <Button onClick={handleSave} className="w-full">{editing ? "আপডেট" : "সংরক্ষণ"}</Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {branches?.map(b => (
          <Card key={b.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{b.name} {b.code && <span className="text-xs text-muted-foreground">({toBengali(b.code)})</span>}</p>
                <p className="text-sm text-muted-foreground">{b.address || "—"} | {b.head_name || "—"}</p>
              </div>
              <div className="flex gap-2">
                {canEdit && <Button variant="outline" size="icon" onClick={() => openEdit(b)}><Edit size={14} /></Button>}
                {canDelete && <Button variant="destructive" size="icon" onClick={() => handleDelete(b.id)}><Trash2 size={14} /></Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBranches;
