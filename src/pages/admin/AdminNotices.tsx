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
import { toast } from "@/components/ui/sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const AdminNotices = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", is_active: true });

  const { data: notices, isLoading } = useQuery({
    queryKey: ["admin_notices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editId) {
        const { error } = await supabase.from("notices").update(data).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("notices").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_notices"] });
      qc.invalidateQueries({ queryKey: ["notices"] });
      toast.success(editId ? "নোটিশ আপডেট হয়েছে" : "নোটিশ তৈরি হয়েছে");
      setOpen(false); setEditId(null); setForm({ title: "", content: "", is_active: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_notices"] }); qc.invalidateQueries({ queryKey: ["notices"] }); toast.success("মুছে ফেলা হয়েছে"); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">নোটিশ ব্যবস্থাপনা</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditId(null); setForm({ title: "", content: "", is_active: true }); }}><Plus size={16} /> নতুন নোটিশ</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "নোটিশ সম্পাদনা" : "নতুন নোটিশ"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div><Label>শিরোনাম *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>বিষয়বস্তু</Label><Textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />সক্রিয়</label>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">{saveMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>শিরোনাম</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={3} className="text-center">লোড হচ্ছে...</TableCell></TableRow> :
                notices?.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-0.5 rounded ${n.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{n.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditId(n.id); setForm({ title: n.title, content: n.content || "", is_active: n.is_active ?? true }); setOpen(true); }}><Edit size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(n.id)}><Trash2 size={16} /></Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotices;
