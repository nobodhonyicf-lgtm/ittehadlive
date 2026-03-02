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
import { Plus, Edit, Trash2, Video, Search } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const AdminVideos = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", youtube_url: "", description: "", sort_order: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: videos, isLoading } = useQuery({
    queryKey: ["admin_videos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("videos").select("*").order("sort_order");
      if (error) throw error; return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = { ...data, description: data.description || null };
      if (editId) { const { error } = await supabase.from("videos").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("videos").insert([payload]); if (error) throw error; }
    },
    onSuccess: () => { toast.success("সংরক্ষিত"); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("videos").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("মুছে ফেলা হয়েছে"); },
  });

  const filteredVideos = videos?.filter(v => !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <AdminPageWrapper
      title="ভিডিও ব্যবস্থাপনা"
      icon={Video}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          {canEdit && <DialogTrigger asChild><Button onClick={() => { setEditId(null); setForm({ title: "", youtube_url: "", description: "", sort_order: 0 }); }} className="gap-1.5"><Plus size={16} /> নতুন ভিডিও</Button></DialogTrigger>}
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "সম্পাদনা" : "নতুন ভিডিও"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div><Label>শিরোনাম *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>YouTube URL *</Label><Input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} required /></div>
              <div><Label>বিবরণ</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">{saveMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="ভিডিও খুঁজুন..." className="pl-9 bg-card" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Card className="border border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-muted/30"><TableHead>শিরোনাম</TableHead><TableHead>URL</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow> :
                filteredVideos?.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">কোনো ভিডিও পাওয়া যায়নি</TableCell></TableRow> :
                filteredVideos?.map((v) => (
                  <TableRow key={v.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium">{v.title}</TableCell>
                    <TableCell className="text-muted-foreground text-xs truncate max-w-[200px]">{v.youtube_url}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        {canEdit && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setEditId(v.id); setForm({ title: v.title, youtube_url: v.youtube_url, description: v.description || "", sort_order: v.sort_order ?? 0 }); setOpen(true); }}><Edit size={15} /></Button>}
                        {canDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(v.id)}><Trash2 size={15} /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminPageWrapper>
  );
};

export default AdminVideos;
