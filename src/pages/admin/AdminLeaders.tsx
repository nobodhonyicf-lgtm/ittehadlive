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
import { toast } from "@/components/ui/sonner";
import { Plus, Edit, Trash2, Crown, Search } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const AdminLeaders = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", title: "", bio: "", image_url: "", sort_order: 0 });

  const { data: leaders, isLoading } = useQuery({
    queryKey: ["admin_leaders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leader_profiles").select("*").order("sort_order");
      if (error) throw error; return data;
    },
  });

  const filtered = leaders?.filter(l => l.name.toLowerCase().includes(search.toLowerCase())) || [];

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = { ...data, bio: data.bio || null, image_url: data.image_url || null };
      if (editId) { const { error } = await supabase.from("leader_profiles").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("leader_profiles").insert([payload]); if (error) throw error; }
    },
    onSuccess: () => { toast.success("সংরক্ষিত"); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("leader_profiles").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => toast.success("মুছে ফেলা হয়েছে"),
  });

  return (
    <AdminPageWrapper
      title="নেতৃবৃন্দ ব্যবস্থাপনা"
      icon={Crown}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          {canEdit && <DialogTrigger asChild><Button size="sm" onClick={() => { setEditId(null); setForm({ name: "", title: "", bio: "", image_url: "", sort_order: 0 }); }}><Plus size={16} className="mr-1" /> নতুন</Button></DialogTrigger>}
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "সম্পাদনা" : "নতুন নেতা"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div><Label>নাম *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>পদবী *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>জীবনী</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
              <div><Label>ছবি URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
              <div><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">সংরক্ষণ</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input placeholder="নেতা খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>নাম</TableHead><TableHead>পদবী</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow> :
              filtered.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">কোনো নেতা নেই</TableCell></TableRow> :
              filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>{l.title}</TableCell>
                  <TableCell className="text-right">
                    {canEdit && <Button variant="ghost" size="icon" onClick={() => { setEditId(l.id); setForm({ name: l.name, title: l.title, bio: l.bio || "", image_url: l.image_url || "", sort_order: l.sort_order ?? 0 }); setOpen(true); }}><Edit size={16} /></Button>}
                    {canDelete && <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(l.id)}><Trash2 size={16} className="text-destructive" /></Button>}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </AdminPageWrapper>
  );
};

export default AdminLeaders;
