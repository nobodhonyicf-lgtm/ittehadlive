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
import { Plus, Edit, Trash2, Menu, Search } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const AdminMenu = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ label: "", url: "#", sort_order: 0, is_active: true });

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin_menu"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("*").order("sort_order");
      if (error) throw error; return data;
    },
  });

  const filtered = items?.filter(i => i.label.toLowerCase().includes(search.toLowerCase())) || [];

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editId) { const { error } = await supabase.from("menu_items").update(data).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("menu_items").insert([data]); if (error) throw error; }
    },
    onSuccess: () => { toast.success("সংরক্ষিত"); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("menu_items").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => toast.success("মুছে ফেলা হয়েছে"),
  });

  return (
    <AdminPageWrapper
      title="মেনু ব্যবস্থাপনা"
      icon={Menu}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          {canEdit && <DialogTrigger asChild><Button size="sm" onClick={() => { setEditId(null); setForm({ label: "", url: "#", sort_order: 0, is_active: true }); }}><Plus size={16} className="mr-1" /> নতুন মেনু</Button></DialogTrigger>}
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
      }
    >
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input placeholder="মেনু খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>লেবেল</TableHead><TableHead>URL</TableHead><TableHead>ক্রম</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow> :
              filtered.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">কোনো মেনু নেই</TableCell></TableRow> :
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.url}</TableCell>
                  <TableCell>{item.sort_order}</TableCell>
                  <TableCell className="text-right">
                    {canEdit && <Button variant="ghost" size="icon" onClick={() => { setEditId(item.id); setForm({ label: item.label, url: item.url, sort_order: item.sort_order ?? 0, is_active: item.is_active ?? true }); setOpen(true); }}><Edit size={16} /></Button>}
                    {canDelete && <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}><Trash2 size={16} className="text-destructive" /></Button>}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </AdminPageWrapper>
  );
};

export default AdminMenu;
