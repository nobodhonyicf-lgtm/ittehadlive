import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const AdminPrayerTimes = () => {
  const { toast } = useToast();
  const { canEdit, canDelete } = useSectionPermissions();
  const queryClient = useQueryClient();
  const [editItems, setEditItems] = useState<any[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState("");

  const { data: prayerTimes, isLoading } = useQuery({
    queryKey: ["prayer_times"],
    queryFn: async () => {
      const { data, error } = await supabase.from("prayer_times").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const items = editItems || prayerTimes || [];

  const handleEdit = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setEditItems(updated);
  };

  const handleSave = async () => {
    if (!editItems) return;
    setSaving(true);
    for (const item of editItems) {
      await supabase.from("prayer_times").update({ name: item.name, time_text: item.time_text, sort_order: item.sort_order }).eq("id", item.id);
    }
    toast({ title: "সফল", description: "নামাজের সময়সূচি আপডেট হয়েছে" });
    setEditItems(null);
    setSaving(false);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newTime.trim()) { toast({ title: "ত্রুটি", description: "নাম ও সময় দিন", variant: "destructive" }); return; }
    const { error } = await supabase.from("prayer_times").insert({ name: newName.trim(), time_text: newTime.trim(), sort_order: items.length });
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else { toast({ title: "সফল", description: "যুক্ত হয়েছে" }); setNewName(""); setNewTime(""); setEditItems(null); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("prayer_times").delete().eq("id", id);
    setEditItems(null);
    toast({ title: "মুছে ফেলা হয়েছে" });
  };

  return (
    <AdminPageWrapper title="নামাজের সময়সূচি" icon={Clock}>
      <Card>
        <CardHeader><CardTitle className="text-base">সময়সূচি সম্পাদনা</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-muted-foreground">লোড হচ্ছে...</p>}
          {items.map((item, i) => (
            <div key={item.id} className="flex gap-2 items-center">
              <Input value={item.name} onChange={(e) => handleEdit(i, "name", e.target.value)} placeholder="নামাজের নাম" className="flex-1" />
              <Input value={item.time_text} onChange={(e) => handleEdit(i, "time_text", e.target.value)} placeholder="সময়" className="w-28" />
              {canDelete && <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 size={16} className="text-destructive" /></Button>}
            </div>
          ))}
          {editItems && <Button onClick={handleSave} disabled={saving} size="sm"><Save size={14} className="mr-1" />{saving ? "সেভ হচ্ছে..." : "সেভ করুন"}</Button>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">নতুন সময় যোগ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1"><Label>নাম</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="যেমন: তাহাজ্জুদ" /></div>
            <div className="w-28"><Label>সময়</Label><Input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="৩:৩০" /></div>
          </div>
          {canEdit && <Button onClick={handleAdd} size="sm"><Plus size={14} className="mr-1" /> যোগ করুন</Button>}
        </CardContent>
      </Card>
    </AdminPageWrapper>
  );
};

export default AdminPrayerTimes;
