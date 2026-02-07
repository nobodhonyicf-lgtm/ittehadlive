import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const AdminMenu = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", url: "#", sort_order: 0, is_active: true });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin_menu"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("*").order("sort_order");
      if (error) throw error; return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editId) { const { error } = await supabase.from("menu_items").update(data).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("menu_items").insert([data]); if (error) throw error; }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_menu"] }); qc.invalidateQueries({ queryKey: ["menu_items"] }); toast.success("সংরক্ষিত"); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("menu_items").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_menu"] }); toast.success("মুছে ফেলা হয়েছে"); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">মেনু ব্যবস্থাপনা</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => { setEditId(null); setForm({ label: "", url: "#", sort_order: 0, is_active: true }); }}><Plus size={16} /> নতুন মেনু</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "সম্পাদনা" : "নতুন মেনু আইটেম"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div><Label>লেবেল *</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required /></div>
              <div><Label>URL *</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required /></div>
              <div><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />সক্রিয়</label>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">সংরক্ষণ</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>লেবেল</TableHead><TableHead>URL</TableHead><TableHead>ক্রম</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center">লোড হচ্ছে...</TableCell></TableRow> :
              items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.label}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.url}</TableCell>
                  <TableCell>{item.sort_order}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditId(item.id); setForm({ label: item.label, url: item.url, sort_order: item.sort_order ?? 0, is_active: item.is_active ?? true }); setOpen(true); }}><Edit size={16} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default AdminMenu;
