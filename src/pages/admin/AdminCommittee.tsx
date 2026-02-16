import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";

const AdminCommittee = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [pageFilter, setPageFilter] = useState("committee");
  const [form, setForm] = useState({ name: "", title: "", institution: "", photo_url: "", page_slug: "committee", sort_order: 0 });

  const { data: members, isLoading } = useQuery({
    queryKey: ["admin_committee", pageFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("committee_members")
        .select("*")
        .eq("page_slug", pageFilter)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = { ...data, institution: data.institution || null, photo_url: data.photo_url || null };
      if (editId) {
        const { error } = await supabase.from("committee_members").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("committee_members").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_committee"] });
      qc.invalidateQueries({ queryKey: ["committee_members"] });
      toast.success("সংরক্ষিত");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("committee_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_committee"] });
      toast.success("মুছে ফেলা হয়েছে");
    },
  });

  const resetForm = () => {
    setEditId(null);
    setForm({ name: "", title: "", institution: "", photo_url: "", page_slug: pageFilter, sort_order: 0 });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2"><Users size={22} /> কমিটি/উপদেষ্টা ব্যবস্থাপনা</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          {canEdit && <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus size={16} /> নতুন সদস্য</Button>
          </DialogTrigger>}
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "সম্পাদনা" : "নতুন সদস্য"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div><Label>নাম *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>পদবী *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>প্রতিষ্ঠান</Label><Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} /></div>
              <div><Label>ছবি URL</Label><Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} /></div>
              <div><Label>পাতা</Label>
                <Select value={form.page_slug} onValueChange={(v) => setForm({ ...form, page_slug: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="committee">কমিটি</SelectItem>
                    <SelectItem value="advisors">উপদেষ্টা</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">সংরক্ষণ</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-4">
        <Button variant={pageFilter === "committee" ? "default" : "outline"} size="sm" onClick={() => setPageFilter("committee")}>কমিটি</Button>
        <Button variant={pageFilter === "advisors" ? "default" : "outline"} size="sm" onClick={() => setPageFilter("advisors")}>উপদেষ্টা</Button>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ছবি</TableHead>
              <TableHead>নাম</TableHead>
              <TableHead>পদবী</TableHead>
              <TableHead>প্রতিষ্ঠান</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">লোড হচ্ছে...</TableCell></TableRow>
            ) : members?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">কোনো সদস্য নেই</TableCell></TableRow>
            ) : members?.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">ছবি</div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.title}</TableCell>
                <TableCell>{m.institution || "—"}</TableCell>
                <TableCell className="text-right">
                  {canEdit && <Button variant="ghost" size="icon" onClick={() => {
                    setEditId(m.id);
                    setForm({ name: m.name, title: m.title, institution: m.institution || "", photo_url: m.photo_url || "", page_slug: m.page_slug, sort_order: m.sort_order ?? 0 });
                    setOpen(true);
                  }}><Edit size={16} /></Button>}
                  {canDelete && <Button variant="ghost" size="icon" onClick={() => { if (confirm("মুছে ফেলতে চান?")) deleteMutation.mutate(m.id); }}><Trash2 size={16} /></Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default AdminCommittee;
