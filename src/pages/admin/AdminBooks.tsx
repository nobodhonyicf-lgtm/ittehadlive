import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { toBengali } from "@/lib/bengali";

const emptyBook = {
  title: "", slug: "", author_name: "", publisher: "", description: "",
  cover_image_url: "", preview_pdf_url: "", price: 0, discount_price: null as number | null,
  isbn: "", pages: null as number | null, language: "বাংলা", category: "",
  stock: 0, is_active: true, is_featured: false, sort_order: 0,
};

const AdminBooks = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyBook);

  const { data: books, isLoading } = useQuery({
    queryKey: ["admin_books"],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.title || !form.author_name) {
      toast.error("শিরোনাম ও লেখকের নাম দিন");
      return;
    }
    const slug = form.slug || generateSlug(form.title);
    const payload = { ...form, slug, discount_price: form.discount_price || null, pages: form.pages || null };

    if (editing) {
      const { error } = await supabase.from("books").update(payload).eq("id", editing.id);
      if (error) { toast.error("আপডেট ব্যর্থ"); return; }
      toast.success("বই আপডেট হয়েছে");
    } else {
      const { error } = await supabase.from("books").insert(payload);
      if (error) { toast.error("বই যোগ ব্যর্থ: " + error.message); return; }
      toast.success("বই যোগ হয়েছে");
    }
    queryClient.invalidateQueries({ queryKey: ["admin_books"] });
    setOpen(false);
    setEditing(null);
    setForm(emptyBook);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই বই মুছে ফেলবেন?")) return;
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) toast.error("মুছতে ব্যর্থ");
    else {
      toast.success("বই মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin_books"] });
    }
  };

  const openEdit = (book: any) => {
    setEditing(book);
    setForm({
      title: book.title, slug: book.slug, author_name: book.author_name,
      publisher: book.publisher || "", description: book.description || "",
      cover_image_url: book.cover_image_url || "", preview_pdf_url: book.preview_pdf_url || "",
      price: Number(book.price), discount_price: book.discount_price ? Number(book.discount_price) : null,
      isbn: book.isbn || "", pages: book.pages, language: book.language || "বাংলা",
      category: book.category || "", stock: book.stock, is_active: book.is_active,
      is_featured: book.is_featured, sort_order: book.sort_order,
    });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2"><BookOpen size={24} /> বই ম্যানেজমেন্ট</h1>
        <Button onClick={() => { setEditing(null); setForm(emptyBook); setOpen(true); }}>
          <Plus size={16} /> নতুন বই যোগ করুন
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto" /></div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>কভার</TableHead>
                  <TableHead>শিরোনাম</TableHead>
                  <TableHead>লেখক</TableHead>
                  <TableHead>মূল্য</TableHead>
                  <TableHead>স্টক</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books?.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <div className="w-10 h-14 bg-muted rounded overflow-hidden">
                        {book.cover_image_url ? (
                          <img src={book.cover_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><BookOpen size={14} /></div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{book.title}</TableCell>
                    <TableCell>{book.author_name}</TableCell>
                    <TableCell>
                      {book.discount_price ? (
                        <span>৳{toBengali(book.discount_price)} <span className="text-xs line-through text-muted-foreground">৳{toBengali(book.price)}</span></span>
                      ) : (
                        <span>৳{toBengali(book.price)}</span>
                      )}
                    </TableCell>
                    <TableCell>{toBengali(book.stock)}</TableCell>
                    <TableCell>
                      <Badge variant={book.is_active ? "default" : "secondary"}>
                        {book.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(book)}><Edit size={14} /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(book.id)}><Trash2 size={14} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "বই সম্পাদনা" : "নতুন বই যোগ করুন"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>শিরোনাম *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>স্লাগ</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="অটো জেনারেট হবে" />
            </div>
            <div>
              <Label>লেখক *</Label>
              <Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
            </div>
            <div>
              <Label>প্রকাশনী</Label>
              <Input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
            </div>
            <div>
              <Label>ক্যাটাগরি</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <Label>মূল্য (৳) *</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div>
              <Label>ছাড়ের মূল্য (৳)</Label>
              <Input type="number" value={form.discount_price || ""} onChange={(e) => setForm({ ...form, discount_price: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div>
              <Label>স্টক</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
            <div>
              <Label>পৃষ্ঠা সংখ্যা</Label>
              <Input type="number" value={form.pages || ""} onChange={(e) => setForm({ ...form, pages: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div>
              <Label>ISBN</Label>
              <Input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
            </div>
            <div>
              <Label>ভাষা</Label>
              <Input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            </div>
            <div>
              <Label>সর্ট অর্ডার</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <Label>কভার ইমেজ URL</Label>
              <Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>প্রিভিউ PDF URL</Label>
              <Input value={form.preview_pdf_url} onChange={(e) => setForm({ ...form, preview_pdf_url: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>বিবরণ</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>সক্রিয়</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
              <Label>ফিচার্ড</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
            <Button onClick={handleSave}>{editing ? "আপডেট করুন" : "যোগ করুন"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBooks;
