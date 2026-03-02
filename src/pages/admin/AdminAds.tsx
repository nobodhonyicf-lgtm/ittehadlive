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
import { Plus, Edit, Trash2, Megaphone, Search } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const AdminAds = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", image_url: "", link: "", position: "header", is_active: true, sort_order: 0 });

  const { data: ads, isLoading } = useQuery({
    queryKey: ["admin_ads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ads").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const filtered = ads?.filter(a => a.title.toLowerCase().includes(search.toLowerCase())) || [];

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editId) {
        const { error } = await supabase.from("ads").update(data).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ads").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("সংরক্ষিত"); setOpen(false); setEditId(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("ads").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => toast.success("মুছে ফেলা হয়েছে"),
  });

  return (
    <AdminPageWrapper
      title="বিজ্ঞাপন ব্যবস্থাপনা"
      icon={Megaphone}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          {canEdit && <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditId(null); setForm({ title: "", image_url: "", link: "", position: "header", is_active: true, sort_order: 0 }); }}><Plus size={16} className="mr-1" /> নতুন বিজ্ঞাপন</Button>
          </DialogTrigger>}
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "সম্পাদনা" : "নতুন বিজ্ঞাপন"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div><Label>শিরোনাম *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>ছবি URL *</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} required /></div>
              <div><Label>লিংক</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
              <div><Label>পজিশন</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                  <option value="header">হেডার</option><option value="sidebar">সাইডবার</option><option value="footer">ফুটার</option><option value="slider">স্লাইডার</option><option value="in_post">পোস্টের মধ্যে</option>
                </select>
              </div>
              <div><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />সক্রিয়</label>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">সংরক্ষণ</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input placeholder="বিজ্ঞাপন খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 max-w-sm" />
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>শিরোনাম</TableHead><TableHead>পজিশন</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow> :
              filtered.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">কোনো বিজ্ঞাপন নেই</TableCell></TableRow> :
              filtered.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.title}</TableCell>
                  <TableCell><span className="text-xs bg-muted px-2 py-0.5 rounded">{ad.position}</span></TableCell>
                  <TableCell><span className={`text-xs px-2 py-0.5 rounded ${ad.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{ad.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span></TableCell>
                  <TableCell className="text-right">
                    {canEdit && <Button variant="ghost" size="icon" onClick={() => { setEditId(ad.id); setForm({ title: ad.title, image_url: ad.image_url, link: ad.link || "", position: ad.position, is_active: ad.is_active ?? true, sort_order: ad.sort_order ?? 0 }); setOpen(true); }}><Edit size={16} /></Button>}
                    {canDelete && <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(ad.id)}><Trash2 size={16} className="text-destructive" /></Button>}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </AdminPageWrapper>
  );
};

export default AdminAds;
