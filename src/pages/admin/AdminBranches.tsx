import { useState } from "react";
import { useAllBranches } from "@/hooks/useBoardData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";

const AdminBranches = () => {
  const { data: branches, isLoading } = useAllBranches();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", code: "", address: "", phone: "", email: "", head_name: "", image_url: "", sort_order: 0 });

  const resetForm = () => {
    setForm({ name: "", code: "", address: "", phone: "", email: "", head_name: "", image_url: "", sort_order: 0 });
    setEditing(null);
  };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({ name: b.name, code: b.code || "", address: b.address || "", phone: b.phone || "", email: b.email || "", head_name: b.head_name || "", image_url: b.image_url || "", sort_order: b.sort_order || 0 });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return toast.error("নাম দিন");
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
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
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={16} /> নতুন শাখা</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "শাখা সম্পাদনা" : "নতুন শাখা"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>নাম *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>কোড</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
                <div><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
              </div>
              <div><Label>প্রধান</Label><Input value={form.head_name} onChange={e => setForm({ ...form, head_name: e.target.value })} /></div>
              <div><Label>ঠিকানা</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>ফোন</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>ইমেইল</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>ছবি URL</Label><Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">{editing ? "আপডেট" : "সংরক্ষণ"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {branches?.map(b => (
          <Card key={b.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{b.name} {b.code && <span className="text-xs text-muted-foreground">({b.code})</span>}</p>
                <p className="text-sm text-muted-foreground">{b.address || "—"} | {b.head_name || "—"}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openEdit(b)}><Edit size={14} /></Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(b.id)}><Trash2 size={14} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBranches;
