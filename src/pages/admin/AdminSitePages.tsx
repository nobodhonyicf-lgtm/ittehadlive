import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { Edit, Search, Sparkles, Globe, Eye, Loader2 } from "lucide-react";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

// All site pages with their paths
const SITE_PAGES = [
  { path: "/", name: "হোমপেজ" },
  { path: "/posts", name: "সকল পোস্ট" },
  { path: "/contact", name: "যোগাযোগ" },
  { path: "/teachers", name: "শিক্ষক তথ্য" },
  { path: "/branches", name: "শাখা সমূহ" },
  { path: "/students", name: "শিক্ষার্থী" },
  { path: "/result", name: "রেজাল্ট" },
  { path: "/books", name: "বইয়ের দোকান" },
  { path: "/quran", name: "কুরআন" },
  { path: "/hadith", name: "হাদিস" },
  { path: "/dua", name: "দোয়া সমূহ" },
  { path: "/masala", name: "মাসআলা" },
  { path: "/quiz", name: "কুইজ" },
  { path: "/advertise", name: "বিজ্ঞাপন" },
  { path: "/login", name: "লগইন" },
  { path: "/register", name: "রেজিস্ট্রেশন" },
  { path: "/install", name: "অ্যাপ ইনস্টল" },
  { path: "/nearby-map", name: "কাছের মাদরাসা" },
  { path: "/qibla", name: "কিবলা কম্পাস" },
  { path: "/zakat", name: "যাকাত ক্যালকুলেটর" },
  { path: "/teacher-apply", name: "শিক্ষক আবেদন" },
  { path: "/institution-register", name: "প্রতিষ্ঠান নিবন্ধন" },
  { path: "/notifications", name: "নোটিফিকেশন" },
  { path: "/profile", name: "প্রোফাইল" },
];

interface SeoForm {
  page_path: string;
  page_name: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  og_title: string;
  og_description: string;
  keywords: string;
  canonical_url: string;
}

const emptySeoForm: SeoForm = {
  page_path: "", page_name: "", meta_title: "", meta_description: "",
  og_image_url: "", og_title: "", og_description: "", keywords: "", canonical_url: "",
};

const AdminSitePages = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SeoForm>(emptySeoForm);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: seoData } = useQuery({
    queryKey: ["page_seo_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_seo").select("*");
      if (error) throw error;
      return data;
    },
  });

  const seoMap = new Map((seoData || []).map((s: any) => [s.page_path, s]));

  const saveMutation = useMutation({
    mutationFn: async (data: SeoForm) => {
      const existing = seoMap.get(data.page_path);
      const payload = {
        page_path: data.page_path,
        page_name: data.page_name,
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        og_image_url: data.og_image_url || null,
        og_title: data.og_title || null,
        og_description: data.og_description || null,
        keywords: data.keywords || null,
        canonical_url: data.canonical_url || null,
        updated_at: new Date().toISOString(),
      };
      if (existing) {
        const { error } = await supabase.from("page_seo").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("page_seo").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["page_seo_all"] });
      toast.success("SEO সেটিংস সংরক্ষিত হয়েছে");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (page: { path: string; name: string }) => {
    const existing = seoMap.get(page.path) as any;
    setForm({
      page_path: page.path,
      page_name: page.name,
      meta_title: existing?.meta_title || "",
      meta_description: existing?.meta_description || "",
      og_image_url: existing?.og_image_url || "",
      og_title: existing?.og_title || "",
      og_description: existing?.og_description || "",
      keywords: existing?.keywords || "",
      canonical_url: existing?.canonical_url || "",
    });
    setOpen(true);
  };

  const generateWithAI = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-seo-generate", {
        body: { pageName: form.page_name, pagePath: form.page_path },
      });
      if (error) throw error;
      if (data) {
        setForm(prev => ({
          ...prev,
          meta_title: data.meta_title || prev.meta_title,
          meta_description: data.meta_description || prev.meta_description,
          og_title: data.og_title || prev.og_title,
          og_description: data.og_description || prev.og_description,
          keywords: data.keywords || prev.keywords,
        }));
        toast.success("AI দ্বারা SEO কন্টেন্ট তৈরি হয়েছে");
      }
    } catch (e: any) {
      toast.error("AI জেনারেট ব্যর্থ: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredPages = SITE_PAGES.filter(p =>
    !searchQuery || p.name.includes(searchQuery) || p.path.includes(searchQuery)
  );

  return (
    <AdminPageWrapper title="পাতাসমূহ ও SEO" icon={Globe}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="পাতা খুঁজুন..." className="pl-9 bg-card" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      <Card className="border border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>পাতার নাম</TableHead>
                <TableHead>পাথ</TableHead>
                <TableHead>SEO স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map(page => {
                const hasSeo = seoMap.has(page.path);
                return (
                  <TableRow key={page.path} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium">{page.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{page.path}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${hasSeo ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {hasSeo ? "✓ কনফিগার করা" : "ডিফল্ট"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(page)}>
                        <Edit size={15} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe size={18} /> {form.page_name} - SEO সেটিংস
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
            {/* AI Generate Button */}
            <Button type="button" variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5" onClick={generateWithAI} disabled={aiLoading}>
              {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {aiLoading ? "AI তৈরি করছে..." : "AI দিয়ে SEO তৈরি করুন"}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>মেটা টাইটেল</Label>
                <Input value={form.meta_title} onChange={e => setForm({ ...form, meta_title: e.target.value })} placeholder="পেজের SEO টাইটেল" />
                <p className="text-[10px] text-muted-foreground mt-1">{form.meta_title.length}/60 অক্ষর</p>
              </div>
              <div>
                <Label>OG টাইটেল</Label>
                <Input value={form.og_title} onChange={e => setForm({ ...form, og_title: e.target.value })} placeholder="সোশ্যাল শেয়ার টাইটেল" />
              </div>
            </div>
            <div>
              <Label>মেটা ডেসক্রিপশন</Label>
              <Textarea rows={3} value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })} placeholder="পেজের বর্ণনা (SEO)" />
              <p className="text-[10px] text-muted-foreground mt-1">{form.meta_description.length}/160 অক্ষর</p>
            </div>
            <div>
              <Label>OG ডেসক্রিপশন</Label>
              <Textarea rows={2} value={form.og_description} onChange={e => setForm({ ...form, og_description: e.target.value })} placeholder="সোশ্যাল মিডিয়ায় শেয়ারের সময় দেখাবে" />
            </div>
            <div>
              <Label>OG ছবি URL</Label>
              <Input value={form.og_image_url} onChange={e => setForm({ ...form, og_image_url: e.target.value })} placeholder="শেয়ার প্রিভিউ ছবি" />
            </div>
            <div>
              <Label>কীওয়ার্ড (কমা দিয়ে আলাদা)</Label>
              <Input value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="ইসলামী শিক্ষা, মাদরাসা, বাংলাদেশ" />
            </div>
            <div>
              <Label>ক্যানোনিক্যাল URL</Label>
              <Input value={form.canonical_url} onChange={e => setForm({ ...form, canonical_url: e.target.value })} placeholder="https://ittehad.bd/..." />
            </div>

            {/* Preview */}
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1"><Eye size={10} /> গুগল প্রিভিউ</p>
              <div className="space-y-1">
                <p className="text-blue-600 text-sm font-medium truncate">{form.meta_title || form.page_name} | ইত্তেহাদুল মাদারিস</p>
                <p className="text-[11px] text-green-700">ittehad.bd{form.page_path}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{form.meta_description || "এই পেজের বর্ণনা..."}</p>
              </div>
            </div>

            <Button type="submit" disabled={saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
};

export default AdminSitePages;
