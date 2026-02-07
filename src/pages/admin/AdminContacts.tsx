import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Trash2, Eye } from "lucide-react";

const AdminContacts = () => {
  const qc = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["admin_contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_contacts"] }); toast.success("মুছে ফেলা হয়েছে"); },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_submissions").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_contacts"] }); },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">যোগাযোগ বার্তা</h1>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>নাম</TableHead><TableHead>ইমেইল</TableHead><TableHead>বিষয়</TableHead><TableHead>বার্তা</TableHead><TableHead>তারিখ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center">লোড হচ্ছে...</TableCell></TableRow> :
              contacts?.map((c) => (
                <TableRow key={c.id} className={c.is_read ? "" : "bg-accent/5"}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.email || "-"}</TableCell>
                  <TableCell className="text-sm">{c.subject || "-"}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{c.message}</TableCell>
                  <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString("bn-BD")}</TableCell>
                  <TableCell className="text-right">
                    {!c.is_read && <Button variant="ghost" size="icon" onClick={() => markRead.mutate(c.id)}><Eye size={16} /></Button>}
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)}><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
};

export default AdminContacts;
