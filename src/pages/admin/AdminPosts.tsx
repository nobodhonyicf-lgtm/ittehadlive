import { useState, useRef } from "react";
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
import { Plus, Edit, Trash2, Link2, Bell, Newspaper, Search } from "lucide-react";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";
import { Checkbox } from "@/components/ui/checkbox";
import { useCategories } from "@/hooks/useData";
import { useEffect } from "react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";

type PostForm = {
  title: string;
  content: string;
  slug: string;
  image_url: string;
  image_caption: string;
  summary: string;
  category_id: string;
  author_name: string;
  is_featured: boolean;
  is_published: boolean;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
};

const emptyForm: PostForm = {
  title: "", content: "", slug: "", image_url: "", image_caption: "", summary: "", category_id: "", author_name: "", is_featured: false, is_published: true,
  meta_title: "", meta_description: "", og_image_url: "",
};

const DRAFT_KEY = "admin_post_draft";

const AdminPosts = () => {
  const qc = useQueryClient();
  const { canEdit, canDelete } = useSectionPermissions();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sendPush, setSendPush] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState<PostForm>(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved) : emptyForm;
  });
  const { data: categories } = useCategories();

  // Search posts for linking
  const { data: linkPosts } = useQuery({
    queryKey: ["link_posts_search", linkSearch],
    queryFn: async () => {
      if (!linkSearch.trim()) return [];
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug")
        .eq("is_published", true)
        .ilike("title", `%${linkSearch}%`)
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: linkDialogOpen && linkSearch.trim().length > 1,
  });

  // Auto-save draft
  useEffect(() => {
    if (open && !editId) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }
  }, [form, open, editId]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin_posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*, categories(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ data, shouldPush }: { data: PostForm; shouldPush: boolean }) => {
      const payload: any = { ...data, category_id: data.category_id || null, author_name: data.author_name || null };
      if (editId) {
        const { error } = await supabase.from("posts").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase.from("posts").insert([payload]).select().single();
        if (error) throw error;

        // Send push notification for new post
        if (shouldPush && inserted) {
          await supabase.functions.invoke("send-push", {
            body: {
              title: inserted.title,
              body: inserted.summary || inserted.title,
              url: `/post/${inserted.slug}`,
              image: inserted.image_url || undefined,
            },
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_posts"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success(editId ? "পোস্ট আপডেট হয়েছে" : "পোস্ট তৈরি হয়েছে");
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
      setSendPush(false);
      localStorage.removeItem(DRAFT_KEY);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_posts"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("পোস্ট মুছে ফেলা হয়েছে");
    },
  });

  const openEdit = (post: any) => {
    setEditId(post.id);
    setForm({
      title: post.title,
      content: post.content || "",
      slug: post.slug,
      image_url: post.image_url || "",
      image_caption: post.image_caption || "",
      summary: post.summary || "",
      category_id: post.category_id || "",
      author_name: post.author_name || "",
      is_featured: post.is_featured || false,
      is_published: post.is_published ?? true,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      og_image_url: post.og_image_url || "",
    });
    setOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    const saved = localStorage.getItem(DRAFT_KEY);
    setForm(saved ? JSON.parse(saved) : emptyForm);
    setOpen(true);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-").replace(/^-|-$/g, "") || `post-${Date.now()}`;
  };

  const [searchQuery, setSearchQuery] = useState("");
  const filteredPosts = posts?.filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <AdminPageWrapper
      title="পোস্ট ব্যবস্থাপনা"
      icon={Newspaper}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          {canEdit && <DialogTrigger asChild>
            <Button onClick={openNew} className="gap-1.5"><Plus size={16} /> নতুন পোস্ট</Button>
          </DialogTrigger>}
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "পোস্ট সম্পাদনা" : "নতুন পোস্ট"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const slug = form.slug || generateSlug(form.title);
                saveMutation.mutate({ data: { ...form, slug }, shouldPush: sendPush });
              }}
              className="space-y-4"
            >
              <div>
                <Label>শিরোনাম *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <Label>স্লাগ</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
              </div>
              <div>
                <Label>লেখক</Label>
                <Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="লেখকের নাম" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label>বিষয়বস্তু</Label>
                  <Button type="button" variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => setLinkDialogOpen(true)}>
                    <Link2 size={12} /> পোস্ট লিংক যুক্ত করুন
                  </Button>
                </div>
                <Textarea ref={contentRef} rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                
                {/* Post link insertion dialog */}
                <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><Link2 size={16} /> পোস্ট লিংক সংযুক্ত করুন</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input
                        placeholder="পোস্ট খুঁজুন (শিরোনাম লিখুন)..."
                        value={linkSearch}
                        onChange={(e) => setLinkSearch(e.target.value)}
                        autoFocus
                      />
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {linkPosts?.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full text-left px-3 py-2 rounded text-sm hover:bg-muted border border-transparent hover:border-border transition-colors"
                            onClick={() => {
                              const linkText = `\n\n📖 আরও পড়ুন: ${p.title}\n🔗 /post/${p.slug}\n`;
                              const textarea = contentRef.current;
                              if (textarea) {
                                const start = textarea.selectionStart;
                                const newContent = form.content.slice(0, start) + linkText + form.content.slice(start);
                                setForm({ ...form, content: newContent });
                              } else {
                                setForm({ ...form, content: form.content + linkText });
                              }
                              setLinkDialogOpen(false);
                              setLinkSearch("");
                              toast.success("লিংক যুক্ত হয়েছে");
                            }}
                          >
                            {p.title}
                          </button>
                        ))}
                        {linkSearch.trim().length > 1 && !linkPosts?.length && (
                          <p className="text-sm text-muted-foreground text-center py-4">কোনো পোস্ট পাওয়া যায়নি</p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div>
                <Label>ছবির URL</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
              <div>
                <Label>ছবির ক্যাপশন</Label>
                <Input value={form.image_caption} onChange={(e) => setForm({ ...form, image_caption: e.target.value })} placeholder="ছবির বর্ণনা" />
              </div>
              <div>
                <Label>সারাংশ</Label>
                <Textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="পোস্টের সংক্ষিপ্ত সারাংশ (SEO)" />
              </div>
              <div>
                <Label>ক্যাটাগরি</Label>
                <select
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">-- নির্বাচন করুন --</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                  ফিচারড
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                  প্রকাশিত
                </label>
              </div>
              {!editId && (
                <label className="flex items-center gap-2 text-sm p-3 bg-accent/10 rounded-md border border-accent/30 cursor-pointer">
                  <Checkbox checked={sendPush} onCheckedChange={(v) => setSendPush(!!v)} />
                  <Bell size={14} className="text-accent" />
                  <span>পুশ নোটিফিকেশন পাঠান</span>
                </label>
              )}
              {/* SEO Fields */}
              <details className="border border-border rounded-md p-3">
                <summary className="text-sm font-semibold cursor-pointer">🔍 এসইও সেটিংস</summary>
                <div className="space-y-3 mt-3">
                  <div>
                    <Label>মেটা টাইটেল</Label>
                    <Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} placeholder="SEO টাইটেল (ডিফল্ট: পোস্ট শিরোনাম)" />
                  </div>
                  <div>
                    <Label>মেটা ডেসক্রিপশন</Label>
                    <Textarea rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} placeholder="SEO ডেসক্রিপশন (ডিফল্ট: সারাংশ)" />
                  </div>
                  <div>
                    <Label>OG ছবি URL</Label>
                    <Input value={form.og_image_url} onChange={(e) => setForm({ ...form, og_image_url: e.target.value })} placeholder="সোশ্যাল শেয়ার প্রিভিউ ছবি" />
                  </div>
                </div>
              </details>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">
                {saveMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="পোস্ট খুঁজুন..."
          className="pl-9 bg-card"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="border border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>শিরোনাম</TableHead>
                <TableHead className="hidden md:table-cell">লেখক</TableHead>
                <TableHead className="hidden md:table-cell">ক্যাটাগরি</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow>
              ) : filteredPosts?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">কোনো পোস্ট পাওয়া যায়নি</TableCell></TableRow>
              ) : filteredPosts?.map((post) => (
                <TableRow key={post.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
                  <TableCell className="text-muted-foreground text-sm hidden md:table-cell">{(post as any).author_name || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{post.categories?.name || "-"}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${post.is_published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {post.is_published ? "প্রকাশিত" : "ড্রাফট"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {canEdit && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(post)}><Edit size={15} /></Button>}
                      {canDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(post.id)}><Trash2 size={15} /></Button>}
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

export default AdminPosts;
