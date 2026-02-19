import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, Edit2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";

const categories = [
  { key: "quran", label: "কুরআন", emoji: "📖" },
  { key: "hadith", label: "হাদিস", emoji: "📜" },
  { key: "dua", label: "দোয়া", emoji: "🤲" },
  { key: "iftar", label: "ইফতার", emoji: "🌙" },
] as const;

const AdminIslamicContent = () => {
  const { toast } = useToast();
  const { canEdit, canDelete } = useSectionPermissions();
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", source: "" });
  const [adding, setAdding] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: contents, isLoading } = useQuery({
    queryKey: ["islamic_contents_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("islamic_contents")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getByCategory = (cat: string) => contents?.filter(c => c.category === cat) || [];

  const startEdit = (item: any) => {
    setEditId(item.id);
    setForm({ title: item.title, content: item.content, source: item.source || "" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ title: "", content: "", source: "" });
  };

  const handleSave = async () => {
    if (!editId) return;
    setSaving(true);
    const { error } = await supabase
      .from("islamic_contents")
      .update({ title: form.title, content: form.content, source: form.source || null })
      .eq("id", editId);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল", description: "আপডেট হয়েছে" });
      cancelEdit();
      queryClient.invalidateQueries({ queryKey: ["islamic_contents_admin"] });
      queryClient.invalidateQueries({ queryKey: ["islamic_contents"] });
    }
    setSaving(false);
  };

  const handleAdd = async (category: string) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "ত্রুটি", description: "শিরোনাম ও কন্টেন্ট দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("islamic_contents").insert({
      category,
      title: form.title.trim(),
      content: form.content.trim(),
      source: form.source.trim() || null,
      sort_order: getByCategory(category).length,
    });
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল", description: "যুক্ত হয়েছে" });
      setAdding(null);
      setForm({ title: "", content: "", source: "" });
      queryClient.invalidateQueries({ queryKey: ["islamic_contents_admin"] });
      queryClient.invalidateQueries({ queryKey: ["islamic_contents"] });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("islamic_contents").delete().eq("id", id);
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "মুছে ফেলা হয়েছে" });
      queryClient.invalidateQueries({ queryKey: ["islamic_contents_admin"] });
      queryClient.invalidateQueries({ queryKey: ["islamic_contents"] });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ইসলামী কন্টেন্ট</h1>

      {isLoading && <p>লোড হচ্ছে...</p>}

      <Tabs defaultValue="quran">
        <TabsList className="grid grid-cols-4 w-full">
          {categories.map(cat => (
            <TabsTrigger key={cat.key} value={cat.key} className="text-xs sm:text-sm">
              {cat.emoji} {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat.key} value={cat.key} className="space-y-3 mt-4">
            {getByCategory(cat.key).map(item => (
              <Card key={item.id}>
                <CardContent className="pt-4">
                  {editId === item.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label>শিরোনাম</Label>
                        <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                      </div>
                      <div>
                        <Label>কন্টেন্ট</Label>
                        <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={3} dir="auto" />
                      </div>
                      <div>
                        <Label>সূত্র (ঐচ্ছিক)</Label>
                        <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={saving} size="sm">
                          <Save size={14} className="mr-1" /> {saving ? "সেভ হচ্ছে..." : "সেভ"}
                        </Button>
                        <Button variant="outline" onClick={cancelEdit} size="sm">
                          <X size={14} className="mr-1" /> বাতিল
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm">{item.title}</h3>
                          <p className="text-sm mt-1 whitespace-pre-wrap" dir="auto">{item.content}</p>
                          {item.source && <p className="text-xs text-muted-foreground mt-1">সূত্র: {item.source}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {canEdit && (
                            <Button variant="ghost" size="icon" onClick={() => startEdit(item)}>
                              <Edit2 size={14} />
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                              <Trash2 size={14} className="text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {getByCategory(cat.key).length === 0 && !adding && (
              <p className="text-sm text-muted-foreground text-center py-4">কোনো কন্টেন্ট নেই</p>
            )}

            {adding === cat.key ? (
              <Card>
                <CardHeader><CardTitle className="text-base">নতুন {cat.label} যোগ</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>শিরোনাম</Label>
                    <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="শিরোনাম লিখুন" />
                  </div>
                  <div>
                    <Label>কন্টেন্ট</Label>
                    <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="আরবি বা বাংলা কন্টেন্ট" rows={3} dir="auto" />
                  </div>
                  <div>
                    <Label>সূত্র (ঐচ্ছিক)</Label>
                    <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="যেমন: বুখারী শরীফ" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleAdd(cat.key)} disabled={saving} size="sm">
                      <Plus size={14} className="mr-1" /> {saving ? "যুক্ত হচ্ছে..." : "যুক্ত করুন"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setAdding(null); setForm({ title: "", content: "", source: "" }); }}>
                      বাতিল
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              canEdit && (
                <Button variant="outline" size="sm" onClick={() => { setAdding(cat.key); setForm({ title: "", content: "", source: "" }); }}>
                  <Plus size={14} className="mr-1" /> নতুন {cat.label} যোগ
                </Button>
              )
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminIslamicContent;
