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
import { Plus, Edit, Trash2 } from "lucide-react";

const AdminPages = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", slug: "", cover_image_url: "" });

  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin_pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-") || `page-${Date.now()}`;
      const payload = { title: data.title, content: data.content, slug, cover_image_url: data.cover_image_url || null } as any;
      if (editId) {
        const { error } = await supabase.from("pages").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pages").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_pages"] });
      toast.success(editId ? "পেজ আপডেট হয়েছে" : "পেজ তৈরি হয়েছে");
      setOpen(false); setEditId(null); setForm({ title: "", content: "", slug: "", cover_image_url: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_pages"] }); toast.success("পেজ মুছে ফেলা হয়েছে"); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">পেজ ব্যবস্থাপনা</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditId(null); setForm({ title: "", content: "", slug: "", cover_image_url: "" }); }}><Plus size={16} /> নতুন পেজ</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editId ? "পেজ সম্পাদনা" : "নতুন পেজ"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div><Label>শিরোনাম *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>স্লাগ</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              <div><Label>কভার ছবি URL (ফেসবুক শেয়ার প্রিভিউ)</Label><Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="ফেসবুকে শেয়ারের সময় এই ছবি দেখাবে" /></div>
              <div><Label>বিষয়বস্তু</Label><Textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">{saveMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>শিরোনাম</TableHead><TableHead>স্লাগ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={3} className="text-center">লোড হচ্ছে...</TableCell></TableRow> :
                pages?.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-muted-foreground">{page.slug}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditId(page.id); setForm({ title: page.title, content: page.content || "", slug: page.slug, cover_image_url: (page as any).cover_image_url || "" }); setOpen(true); }}><Edit size={16} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(page.id)}><Trash2 size={16} /></Button>
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

export default AdminPages;
