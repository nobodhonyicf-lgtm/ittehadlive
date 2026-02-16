import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, Check, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { toBengali } from "@/lib/bengali";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";

const AdminBookReviews = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin_book_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_reviews")
        .select("*, books(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleApprove = async (id: string, current: boolean) => {
    const { error } = await supabase.from("book_reviews").update({ is_approved: !current }).eq("id", id);
    if (error) toast.error("আপডেট ব্যর্থ");
    else {
      toast.success(!current ? "অনুমোদিত" : "অনুমোদন বাতিল");
      queryClient.invalidateQueries({ queryKey: ["admin_book_reviews"] });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("মুছে ফেলবেন?")) return;
    const { error } = await supabase.from("book_reviews").delete().eq("id", id);
    if (error) toast.error("মুছতে ব্যর্থ");
    else {
      toast.success("মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin_book_reviews"] });
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageCircle size={24} /> রিভিউ ম্যানেজমেন্ট</h1>
      {isLoading ? (
        <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto" /></div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>বই</TableHead>
                  <TableHead>রিভিউয়ার</TableHead>
                  <TableHead>রেটিং</TableHead>
                  <TableHead>মন্তব্য</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews?.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[150px] truncate">{r.books?.title}</TableCell>
                    <TableCell>{r.reviewer_name}</TableCell>
                    <TableCell>
                      <div className="flex">{[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={s <= r.rating ? "text-accent fill-accent" : "text-muted"} />
                      ))}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{r.comment || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={r.is_approved ? "default" : "secondary"}>
                        {r.is_approved ? "অনুমোদিত" : "অপেক্ষমান"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {canEdit && <Button variant="ghost" size="icon" onClick={() => toggleApprove(r.id, r.is_approved)}>
                          <Check size={14} />
                        </Button>}
                        {canDelete && <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(r.id)}>
                          <Trash2 size={14} />
                        </Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminBookReviews;
