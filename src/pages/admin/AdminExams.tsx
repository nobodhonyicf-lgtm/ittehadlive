import { useState } from "react";
import { useExams } from "@/hooks/useBoardData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, ClipboardList } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";

const AdminExams = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const { data: exams } = useExams();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", year: new Date().getFullYear(), exam_type: "annual", is_published: false });

  const resetForm = () => { setForm({ name: "", year: new Date().getFullYear(), exam_type: "annual", is_published: false }); setEditing(null); };

  const openEdit = (e: any) => {
    setEditing(e);
    setForm({ name: e.name, year: e.year, exam_type: e.exam_type || "annual", is_published: e.is_published || false });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.year) return toast.error("নাম ও সাল দিন");
    const payload = { ...form, year: Number(form.year) };
    if (editing) {
      const { error } = await supabase.from("exams").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("exams").insert(payload);
      if (error) return toast.error(error.message);
    }
    qc.invalidateQueries({ queryKey: ["exams"] });
    setOpen(false); resetForm();
    toast.success("সংরক্ষিত");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("মুছতে চান?")) return;
    await supabase.from("exams").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["exams"] });
    toast.success("মুছে ফেলা হয়েছে");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2"><ClipboardList size={22} /> পরীক্ষা ব্যবস্থাপনা</h2>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
          {canEdit && <DialogTrigger asChild><Button className="gap-2"><Plus size={16} /> নতুন পরীক্ষা</Button></DialogTrigger>}
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "সম্পাদনা" : "নতুন পরীক্ষা"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>নাম *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>সাল *</Label><Input type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} /></div>
                <div><Label>ধরন</Label><Input value={form.exam_type} onChange={e => setForm({ ...form, exam_type: e.target.value })} placeholder="annual / half-yearly" /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={v => setForm({ ...form, is_published: v })} />
                <Label>প্রকাশিত</Label>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "আপডেট" : "সংরক্ষণ"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {exams?.map(e => (
          <Card key={e.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{e.name} <span className="text-muted-foreground text-sm">({e.year})</span></p>
                <p className="text-xs">{e.is_published ? "✅ প্রকাশিত" : "⏳ অপ্রকাশিত"} | {e.exam_type}</p>
              </div>
              <div className="flex gap-2">
                {canEdit && <Button variant="outline" size="icon" onClick={() => openEdit(e)}><Edit size={14} /></Button>}
                {canDelete && <Button variant="destructive" size="icon" onClick={() => handleDelete(e.id)}><Trash2 size={14} /></Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminExams;
