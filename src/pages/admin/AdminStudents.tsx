import { useState, useEffect } from "react";
import { useAllStudents, useAllBranches } from "@/hooks/useBoardData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Users } from "lucide-react";

const classes = ["ইবতেদায়ী", "মুতাওয়াসসিতা", "সানাবিয়্যা আম্মা", "সানাবিয়্যা খাসসা", "ফযীলত", "তাকমীল"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const emptyForm = {
  name: "", father_name: "", mother_name: "", roll_number: "", registration_number: "",
  branch_id: "", class_name: "", admission_year: new Date().getFullYear(),
  photo_url: "", address: "", phone: "", date_of_birth: "", nid: "", blood_group: ""
};

const DRAFT_KEY = "admin_student_draft";

const AdminStudents = () => {
  const { data: students, isLoading } = useAllStudents();
  const { data: branches } = useAllBranches();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  // Auto-save draft
  useEffect(() => {
    if (open && !editing) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }
  }, [form, open, editing]);

  const resetForm = () => { setForm(emptyForm); setEditing(null); localStorage.removeItem(DRAFT_KEY); };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      name: s.name, father_name: s.father_name || "", mother_name: (s as any).mother_name || "",
      roll_number: s.roll_number, registration_number: s.registration_number || "",
      branch_id: s.branch_id || "", class_name: s.class_name,
      admission_year: s.admission_year || new Date().getFullYear(),
      photo_url: s.photo_url || "", address: s.address || "", phone: s.phone || "",
      date_of_birth: s.date_of_birth || "", nid: (s as any).nid || "", blood_group: (s as any).blood_group || ""
    });
    setOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    const saved = localStorage.getItem(DRAFT_KEY);
    setForm(saved ? JSON.parse(saved) : emptyForm);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.roll_number || !form.class_name) return toast.error("নাম, রোল ও ক্লাস আবশ্যক");
    const payload: any = {
      ...form,
      admission_year: Number(form.admission_year) || null,
      branch_id: form.branch_id || null,
      date_of_birth: form.date_of_birth || null,
      nid: form.nid || null,
      blood_group: form.blood_group || null,
      mother_name: form.mother_name || null,
    };
    if (editing) {
      const { error } = await supabase.from("students").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("আপডেট হয়েছে");
    } else {
      const { error } = await supabase.from("students").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("যোগ হয়েছে");
    }
    qc.invalidateQueries({ queryKey: ["all_students"] });
    setOpen(false); resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("মুছতে চান?")) return;
    await supabase.from("students").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["all_students"] });
    toast.success("মুছে ফেলা হয়েছে");
  };

  const filtered = students?.filter(s => !search || s.name.includes(search) || s.roll_number.includes(search));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Users size={22} /> শিক্ষার্থী ব্যবস্থাপনা</h2>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2" onClick={openNew}><Plus size={16} /> নতুন শিক্ষার্থী</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "সম্পাদনা" : "নতুন শিক্ষার্থী"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>নাম *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>পিতার নাম</Label><Input value={form.father_name} onChange={e => setForm({ ...form, father_name: e.target.value })} /></div>
                <div><Label>মাতার নাম</Label><Input value={form.mother_name} onChange={e => setForm({ ...form, mother_name: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>রোল নম্বর *</Label><Input value={form.roll_number} onChange={e => setForm({ ...form, roll_number: e.target.value })} /></div>
                <div><Label>রেজিস্ট্রেশন</Label><Input value={form.registration_number} onChange={e => setForm({ ...form, registration_number: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>ক্লাস *</Label>
                  <Select value={form.class_name} onValueChange={v => setForm({ ...form, class_name: v })}>
                    <SelectTrigger><SelectValue placeholder="ক্লাস" /></SelectTrigger>
                    <SelectContent>{classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>শাখা</Label>
                  <Select value={form.branch_id} onValueChange={v => setForm({ ...form, branch_id: v })}>
                    <SelectTrigger><SelectValue placeholder="শাখা" /></SelectTrigger>
                    <SelectContent>{branches?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>ভর্তির সাল</Label><Input type="number" value={form.admission_year} onChange={e => setForm({ ...form, admission_year: Number(e.target.value) })} /></div>
                <div><Label>জন্ম তারিখ</Label><Input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} /></div>
                <div>
                  <Label>রক্তের গ্রুপ</Label>
                  <Select value={form.blood_group} onValueChange={v => setForm({ ...form, blood_group: v })}>
                    <SelectTrigger><SelectValue placeholder="রক্তের গ্রুপ" /></SelectTrigger>
                    <SelectContent>{bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>NID নম্বর</Label><Input value={form.nid} onChange={e => setForm({ ...form, nid: e.target.value })} /></div>
              <div><Label>ঠিকানা</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div><Label>ফোন</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>ছবি URL</Label><Input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">{editing ? "আপডেট" : "সংরক্ষণ"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input placeholder="নাম বা রোল দিয়ে খুঁজুন..." className="mb-4" value={search} onChange={e => setSearch(e.target.value)} />

      <div className="space-y-2">
        {filtered?.map(s => (
          <Card key={s.id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">{s.name} <span className="text-xs text-muted-foreground">({s.roll_number})</span></p>
                <p className="text-xs text-muted-foreground">{s.class_name} — {(s as any).branches?.name || "—"}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openEdit(s)}><Edit size={14} /></Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminStudents;
