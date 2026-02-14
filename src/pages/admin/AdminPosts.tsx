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
import { Plus, Edit, Trash2 } from "lucide-react";
import { useCategories } from "@/hooks/useData";
import { useEffect } from "react";

type PostForm = {
  title: string;
  content: string;
  slug: string;
  image_url: string;
  category_id: string;
  author_name: string;
  is_featured: boolean;
  is_published: boolean;
};

const emptyForm: PostForm = {
  title: "", content: "", slug: "", image_url: "", category_id: "", author_name: "", is_featured: false, is_published: true,
};

const DRAFT_KEY = "admin_post_draft";

const AdminPosts = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved) : emptyForm;
  });
  const { data: categories } = useCategories();

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
    mutationFn: async (data: PostForm) => {
      const payload: any = { ...data, category_id: data.category_id || null, author_name: data.author_name || null };
      if (editId) {
        const { error } = await supabase.from("posts").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_posts"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success(editId ? "পোস্ট আপডেট হয়েছে" : "পোস্ট তৈরি হয়েছে");
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
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
      category_id: post.category_id || "",
      author_name: post.author_name || "",
      is_featured: post.is_featured || false,
      is_published: post.is_published ?? true,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">পোস্ট ব্যবস্থাপনা</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus size={16} /> নতুন পোস্ট</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "পোস্ট সম্পাদনা" : "নতুন পোস্ট"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const slug = form.slug || generateSlug(form.title);
                saveMutation.mutate({ ...form, slug });
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
                <Label>বিষয়বস্তু</Label>
                <Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <div>
                <Label>ছবির URL</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
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
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">
                {saveMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>শিরোনাম</TableHead>
                <TableHead>লেখক</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">লোড হচ্ছে...</TableCell></TableRow>
              ) : posts?.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{(post as any).author_name || "-"}</TableCell>
                  <TableCell>{post.categories?.name || "-"}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded ${post.is_published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {post.is_published ? "প্রকাশিত" : "ড্রাফট"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(post)}><Edit size={16} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(post.id)}><Trash2 size={16} /></Button>
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

export default AdminPosts;
