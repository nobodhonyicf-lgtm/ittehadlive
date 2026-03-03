import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, Edit2, X, BookOpen, ScrollText, HandHelping, Scale, HelpCircle, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const categories = [
  { key: "quran", label: "কুরআন", icon: BookOpen },
  { key: "hadith", label: "হাদিস", icon: ScrollText },
  { key: "dua", label: "দোয়া", icon: HandHelping },
  { key: "masala", label: "মাসআলা", icon: Scale },
] as const;

const seasonalOptions = [
  { value: "", label: "সাধারণ (কোনো সিজন নয়)" },
  { value: "ramadan", label: "রমাদান" },
  { value: "shawwal", label: "শাওয়াল (ঈদুল ফিতর)" },
  { value: "dhul_hijjah", label: "জিলহজ্জ (কুরবানী)" },
  { value: "muharram", label: "মুহাররম" },
  { value: "rabi_ul_awal", label: "রবিউল আউয়াল (মিলাদুন্নবী)" },
  { value: "rajab", label: "রজব" },
  { value: "shaban", label: "শাবান (শবে বরাত)" },
];

const emptyForm = { title: "", content: "", source: "", subcategory: "", transliteration: "", meaning: "", reference: "", question: "", seasonal_tag: "" };

const AdminIslamicContent = () => {
  const { toast } = useToast();
  const { canEdit, canDelete } = useSectionPermissions();
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: contents, isLoading } = useQuery({
    queryKey: ["islamic_contents_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("islamic_contents").select("*").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getByCategory = (cat: string) => contents?.filter(c => c.category === cat) || [];

  const startEdit = (item: any) => {
    setEditId(item.id);
    setForm({ title: item.title || "", content: item.content || "", source: item.source || "", subcategory: item.subcategory || "", transliteration: item.transliteration || "", meaning: item.meaning || "", reference: item.reference || "", question: item.question || "", seasonal_tag: (item as any).seasonal_tag || "" });
  };

  const cancelEdit = () => { setEditId(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!editId) return;
    setSaving(true);
    const { error } = await supabase.from("islamic_contents").update({
      title: form.title, content: form.content, source: form.source || null, subcategory: form.subcategory || null,
      transliteration: form.transliteration || null, meaning: form.meaning || null, reference: form.reference || null, question: form.question || null,
      seasonal_tag: form.seasonal_tag || null,
    } as any).eq("id", editId);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else { toast({ title: "সফল", description: "আপডেট হয়েছে" }); cancelEdit(); }
    setSaving(false);
  };

  const handleAdd = async (category: string) => {
    if (!form.title.trim() || !form.content.trim()) { toast({ title: "ত্রুটি", description: "শিরোনাম ও কন্টেন্ট দিন", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("islamic_contents").insert({
      category, title: form.title.trim(), content: form.content.trim(), source: form.source.trim() || null,
      subcategory: form.subcategory.trim() || null, transliteration: form.transliteration.trim() || null,
      meaning: form.meaning.trim() || null, reference: form.reference.trim() || null, question: form.question.trim() || null,
      sort_order: getByCategory(category).length,
      seasonal_tag: form.seasonal_tag.trim() || null,
    } as any);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else { toast({ title: "সফল", description: "যুক্ত হয়েছে" }); setAdding(null); setForm(emptyForm); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("islamic_contents").delete().eq("id", id);
    if (error) toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    else toast({ title: "মুছে ফেলা হয়েছে" });
  };

  const FormFields = ({ cat }: { cat: string }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>শিরোনাম *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div><Label>বিষয়/উপশ্রেণি</Label><Input value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} placeholder={cat === "masala" ? "যেমন: নামাজ" : "বিষয়"} /></div>
      </div>
      {cat === "masala" && <div><Label>প্রশ্ন</Label><Textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} rows={2} /></div>}
      <div><Label>{cat === "masala" ? "উত্তর/বিস্তারিত" : "আরবি কন্টেন্ট *"}</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={3} dir="auto" /></div>
      {(cat === "dua" || cat === "hadith") && (
        <>
          <div><Label>উচ্চারণ</Label><Textarea value={form.transliteration} onChange={e => setForm(f => ({ ...f, transliteration: e.target.value }))} rows={2} /></div>
          <div><Label>অর্থ</Label><Textarea value={form.meaning} onChange={e => setForm(f => ({ ...f, meaning: e.target.value }))} rows={2} /></div>
        </>
      )}
      {cat === "masala" && <div><Label>অর্থ/ব্যাখ্যা</Label><Textarea value={form.meaning} onChange={e => setForm(f => ({ ...f, meaning: e.target.value }))} rows={2} /></div>}
      <div className="grid grid-cols-2 gap-3">
        <div><Label>সূত্র</Label><Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} /></div>
        <div><Label>রেফারেন্স</Label><Input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></div>
      </div>
      <div>
        <Label>সিজনাল ট্যাগ</Label>
        <select
          value={form.seasonal_tag}
          onChange={e => setForm(f => ({ ...f, seasonal_tag: e.target.value }))}
          className="w-full border border-border rounded-md px-3 py-2 bg-background text-sm"
        >
          {seasonalOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <p className="text-[10px] text-muted-foreground mt-1">সিজনাল কন্টেন্ট নির্দিষ্ট মাসে বিশেষভাবে হাইলাইট হবে</p>
      </div>
    </div>
  );

  return (
    <AdminPageWrapper title="ইসলামী কন্টেন্ট" icon={BookOpen}>
      {isLoading && <p className="text-muted-foreground">লোড হচ্ছে...</p>}
      <Tabs defaultValue="hadith">
        <TabsList className="grid grid-cols-4 w-full">
          {categories.map(cat => <TabsTrigger key={cat.key} value={cat.key} className="text-xs sm:text-sm gap-1"><cat.icon size={14} /> {cat.label}</TabsTrigger>)}
        </TabsList>
        {categories.map(cat => (
          <TabsContent key={cat.key} value={cat.key} className="space-y-3 mt-4">
            {getByCategory(cat.key).map(item => (
              <Card key={item.id}>
                <CardContent className="pt-4">
                  {editId === item.id ? (
                    <div className="space-y-3">
                      <FormFields cat={cat.key} />
                      <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={saving} size="sm"><Save size={14} className="mr-1" /> {saving ? "সেভ হচ্ছে..." : "সেভ"}</Button>
                        <Button variant="outline" onClick={cancelEdit} size="sm"><X size={14} className="mr-1" /> বাতিল</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{item.title}</h3>
                        {item.subcategory && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.subcategory}</span>}
                          {(item as any).seasonal_tag && <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full">{seasonalOptions.find(o => o.value === (item as any).seasonal_tag)?.label || (item as any).seasonal_tag}</span>}
                        </div>
                        {item.question && <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><HelpCircle size={12} /> {item.question}</p>}
                        <p className="text-sm mt-1 whitespace-pre-wrap" dir="auto">{item.content}</p>
                        {item.meaning && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><PenLine size={12} /> {item.meaning}</p>}
                        {(item.source || item.reference) && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><BookOpen size={12} /> {item.reference || item.source}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {canEdit && <Button variant="ghost" size="icon" onClick={() => startEdit(item)}><Edit2 size={14} /></Button>}
                        {canDelete && <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 size={14} className="text-destructive" /></Button>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {getByCategory(cat.key).length === 0 && !adding && <p className="text-sm text-muted-foreground text-center py-4">কোনো কন্টেন্ট নেই</p>}
            {adding === cat.key ? (
              <Card><CardHeader><CardTitle className="text-base">নতুন {cat.label} যোগ</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <FormFields cat={cat.key} />
                  <div className="flex gap-2">
                    <Button onClick={() => handleAdd(cat.key)} disabled={saving} size="sm"><Plus size={14} className="mr-1" /> {saving ? "যুক্ত হচ্ছে..." : "যুক্ত করুন"}</Button>
                    <Button variant="outline" size="sm" onClick={() => { setAdding(null); setForm(emptyForm); }}>বাতিল</Button>
                  </div>
                </CardContent>
              </Card>
            ) : canEdit && <Button variant="outline" size="sm" onClick={() => { setAdding(cat.key); setForm(emptyForm); }}><Plus size={14} className="mr-1" /> নতুন {cat.label} যোগ</Button>}
          </TabsContent>
        ))}
      </Tabs>
    </AdminPageWrapper>
  );
};

export default AdminIslamicContent;
