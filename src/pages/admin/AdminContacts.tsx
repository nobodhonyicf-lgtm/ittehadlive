import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Trash2, Eye, MessageSquare, Send } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminContacts = () => {
  const { canDelete, canEdit } = useSectionPermissions();
  const qc = useQueryClient();
  const [replyTo, setReplyTo] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

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

  const [sendNotification, setSendNotification] = useState(false);

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply, notify }: { id: string; reply: string; notify: boolean }) => {
      const { error } = await supabase.from("contact_submissions").update({
        admin_reply: reply,
        replied_at: new Date().toISOString(),
        is_read: true,
      }).eq("id", id);
      if (error) throw error;

      // Send push notification to all subscribers about the reply
      if (notify) {
        const contact = contacts?.find(c => c.id === id);
        await supabase.functions.invoke("send-push", {
          body: {
            title: "আপনার বার্তার উত্তর এসেছে",
            body: reply.substring(0, 200),
            url: "/app-contact",
          },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_contacts"] });
      toast.success("উত্তর পাঠানো হয়েছে");
      setReplyTo(null);
      setReplyText("");
      setSendNotification(false);
    },
  });

  const openReply = (contact: any) => {
    setReplyTo(contact);
    setReplyText(contact.admin_reply || "");
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">যোগাযোগ বার্তা</h1>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>নাম</TableHead><TableHead>ফোন</TableHead><TableHead>বিষয়</TableHead><TableHead>বার্তা</TableHead><TableHead>উত্তর</TableHead><TableHead>তারিখ</TableHead><TableHead className="text-right">অ্যাকশন</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={7} className="text-center">লোড হচ্ছে...</TableCell></TableRow> :
              contacts?.map((c) => (
                <TableRow key={c.id} className={c.is_read ? "" : "bg-accent/5"}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.phone || c.email || "-"}</TableCell>
                  <TableCell className="text-sm">{c.subject || "-"}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{c.message}</TableCell>
                  <TableCell className="text-sm max-w-[150px] truncate">
                    {c.admin_reply ? (
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓ উত্তর দেওয়া হয়েছে</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString("bn-BD")}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {!c.is_read && <Button variant="ghost" size="icon" onClick={() => markRead.mutate(c.id)} title="পঠিত"><Eye size={16} /></Button>}
                    {canEdit && <Button variant="ghost" size="icon" onClick={() => openReply(c)} title="উত্তর দিন"><MessageSquare size={16} /></Button>}
                    {canDelete && <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)} title="মুছুন"><Trash2 size={16} /></Button>}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={!!replyTo} onOpenChange={(o) => !o && setReplyTo(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>উত্তর দিন</DialogTitle>
          </DialogHeader>
          {replyTo && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                <p><strong>প্রেরক:</strong> {replyTo.name}</p>
                {replyTo.phone && <p><strong>ফোন:</strong> {replyTo.phone}</p>}
                {replyTo.email && <p><strong>ইমেইল:</strong> {replyTo.email}</p>}
                {replyTo.subject && <p><strong>বিষয়:</strong> {replyTo.subject}</p>}
                <p className="pt-1 border-t border-border mt-2"><strong>বার্তা:</strong> {replyTo.message}</p>
              </div>
              <Textarea
                placeholder="আপনার উত্তর লিখুন..."
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="rounded"
                />
                <span>পুশ নোটিফিকেশনে উত্তর পাঠান</span>
              </label>
              <Button
                className="w-full gap-2"
                disabled={!replyText.trim() || replyMutation.isPending}
                onClick={() => replyMutation.mutate({ id: replyTo.id, reply: replyText.trim(), notify: sendNotification })}
              >
                <Send size={16} />
                {replyMutation.isPending ? "পাঠানো হচ্ছে..." : "উত্তর পাঠান"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContacts;
