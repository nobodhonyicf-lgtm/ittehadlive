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
import { Plus, Edit, Trash2, ImageIcon } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";

const AdminGallery = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", image_url: "", description: "", is_active: true, sort_order: 0 });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin_gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editId) {
        const { error } = await supabase.from("gallery").update(data).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gallery").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_gallery"] });
      toast.success("সংরক্ষিত");
      setOpen(false);
      setEditId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_gallery"] });
      toast.success("মুছে ফেলা হয়েছে");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2"><ImageIcon size={20} /> গ্যালারী</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          {canEdit && <DialogTrigger asChild>
            <Button onClick={() => { setEditId(null); setForm({ title: "", image_url: "", description: "", is_active: true, sort_order: 0 }); }}>
              <Plus size={16} /> নতুন ছবি
            </Button>
          </DialogTrigger>}
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "সম্পাদনা" : "নতুন ছবি যোগ"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div><Label>শিরোনাম *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>ছবি URL *</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} required /></div>
              <div><Label>বিবরণ</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />সক্রিয়</label>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">সংরক্ষণ</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>ছবি</TableHead><TableHead>শিরোনাম</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center">লোড হচ্ছে...</TableCell></TableRow> :
              items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><img src={item.image_url} alt={item.title} className="h-12 w-16 object-cover rounded" /></TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell><span className={`text-xs px-2 py-0.5 rounded ${item.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{item.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span></TableCell>
                  <TableCell className="text-right">
                    {canEdit && <Button variant="ghost" size="icon" onClick={() => { setEditId(item.id); setForm({ title: item.title, image_url: item.image_url, description: item.description || "", is_active: item.is_active ?? true, sort_order: item.sort_order ?? 0 }); setOpen(true); }}><Edit size={16} /></Button>}
                    {canDelete && <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}><Trash2 size={16} /></Button>}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default AdminGallery;
