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
import { Plus, Edit, Trash2, Bell, Search } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const AdminNotices = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sendPush, setSendPush] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", is_active: true, source: "" });

  const { data: notices, isLoading } = useQuery({
    queryKey: ["admin_notices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ data, shouldPush }: { data: typeof form; shouldPush: boolean }) => {
      if (editId) {
        const { error } = await supabase.from("notices").update(data).eq("id", editId);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase.from("notices").insert([data]).select().single();
        if (error) throw error;

        // Send push notification for new notice
        if (shouldPush && inserted) {
          await supabase.functions.invoke("send-push", {
            body: {
              title: "📢 নতুন নোটিশ",
              body: inserted.title,
              url: `/notice/${inserted.id}`,
            },
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_notices"] });
      qc.invalidateQueries({ queryKey: ["notices"] });
      toast.success(editId ? "নোটিশ আপডেট হয়েছে" : "নোটিশ তৈরি হয়েছে");
      setOpen(false); setEditId(null); setForm({ title: "", content: "", is_active: true, source: "" }); setSendPush(false);
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

  const [searchQuery, setSearchQuery] = useState("");
  const filteredNotices = notices?.filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <AdminPageWrapper
      title="নোটিশ ব্যবস্থাপনা"
      icon={Bell}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          {canEdit && <DialogTrigger asChild>
            <Button onClick={() => { setEditId(null); setForm({ title: "", content: "", is_active: true, source: "" }); }} className="gap-1.5"><Plus size={16} /> নতুন নোটিশ</Button>
          </DialogTrigger>}
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "নোটিশ সম্পাদনা" : "নতুন নোটিশ"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ data: form, shouldPush: sendPush }); }} className="space-y-4">
              <div><Label>শিরোনাম *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>বিষয়বস্তু</Label><Textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
              <div><Label>সূত্র নম্বর</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="যেমন: ১২৩/২০২৬" /></div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />সক্রিয়</label>
              {!editId && (
                <label className="flex items-center gap-2 text-sm p-3 bg-accent/10 rounded-md border border-accent/30 cursor-pointer">
                  <Checkbox checked={sendPush} onCheckedChange={(v) => setSendPush(!!v)} />
                  <Bell size={14} className="text-accent" />
                  <span>পুশ নোটিফিকেশন পাঠান</span>
                </label>
              )}
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">{saveMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="নোটিশ খুঁজুন..."
          className="pl-9 bg-card"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="border border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-muted/30"><TableHead>শিরোনাম</TableHead><TableHead>স্ট্যাটাস</TableHead><TableHead className="text-right">অ্যাকশন</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow> :
                filteredNotices?.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">কোনো নোটিশ পাওয়া যায়নি</TableCell></TableRow> :
                filteredNotices?.map((n) => (
                  <TableRow key={n.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-1 rounded-full font-medium ${n.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{n.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        {canEdit && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="পুশ নোটিফিকেশন পাঠান" onClick={() => {
                          supabase.functions.invoke("send-push", {
                            body: {
                              title: "📢 নোটিশ",
                              body: n.title,
                              url: `/notice/${n.id}`,
                            },
                          }).then(() => toast.success("পুশ নোটিফিকেশন পাঠানো হয়েছে")).catch(() => toast.error("পুশ পাঠানো ব্যর্থ"));
                        }}><Bell size={15} /></Button>}
                        {canEdit && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setEditId(n.id); setForm({ title: n.title, content: n.content || "", is_active: n.is_active ?? true, source: (n as any).source || "" }); setOpen(true); }}><Edit size={15} /></Button>}
                        {canDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(n.id)}><Trash2 size={15} /></Button>}
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

export default AdminNotices;
