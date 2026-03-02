import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Image, Plus, Trash2, Edit2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const AdminSliders = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", image_url: "", link: "", sort_order: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: sliders, isLoading } = useQuery({
    queryKey: ["admin_sliders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sliders").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editId) {
        const { error } = await supabase.from("sliders").update(form).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sliders").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("সংরক্ষিত"); setOpen(false); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sliders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("মুছে ফেলা হয়েছে"); },
  });

  const resetForm = () => { setEditId(null); setForm({ title: "", image_url: "", link: "", sort_order: 0 }); };

  const openEdit = (s: any) => {
    setEditId(s.id);
    setForm({ title: s.title, image_url: s.image_url, link: s.link || "", sort_order: s.sort_order || 0 });
    setOpen(true);
  };

  const filteredSliders = sliders?.filter(s => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</div>;

  return (
    <AdminPageWrapper
      title="স্লাইডার"
      icon={Image}
      action={
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          {canEdit && <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus size={16} /> নতুন স্লাইড</Button>
          </DialogTrigger>}
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "স্লাইড সম্পাদনা" : "নতুন স্লাইড"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>শিরোনাম</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>ছবির URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
              <div><Label>লিংক (ঐচ্ছিক)</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
              <div><Label>ক্রম</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
              {form.image_url && <img src={form.image_url} alt="Preview" className="h-24 rounded" />}
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.title || !form.image_url} className="w-full">
                {saveMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="স্লাইড খুঁজুন..." className="pl-9 bg-card" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSliders?.map((s) => (
          <Card key={s.id} className="border border-border/50 overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <img src={s.image_url} alt={s.title} className="w-full h-32 object-cover rounded mb-2" />
              <p className="font-semibold text-sm">{s.title}</p>
              <div className="flex gap-2 mt-2">
                {canEdit && <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(s)}>
                  <Edit2 size={14} /> সম্পাদনা
                </Button>}
                {canDelete && <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(s.id)}>
                  <Trash2 size={14} />
                </Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredSliders?.length === 0 && <p className="text-center text-muted-foreground py-8">কোনো স্লাইড পাওয়া যায়নি।</p>}
    </AdminPageWrapper>
  );
};

export default AdminSliders;
