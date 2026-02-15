import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Users, MessageCircle, Send, Mail } from "lucide-react";
import { format } from "date-fns";

const AdminUsers = () => {
  const qc = useQueryClient();
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  // Load users via edge function
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin_users_list"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-users");
      if (error) throw error;
      return data?.users || [];
    },
  });

  // Load customer messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["admin_customer_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      const { error } = await supabase
        .from("customer_messages")
        .update({ admin_reply: reply, replied_at: new Date().toISOString(), is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_customer_messages"] });
      toast.success("উত্তর পাঠানো হয়েছে");
    },
    onError: () => toast.error("উত্তর পাঠানো ব্যর্থ"),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customer_messages").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_customer_messages"] }),
  });

  // Find user email for a message
  const getUserEmail = (userId: string) => {
    const user = usersData?.find((u: any) => u.id === userId);
    return user?.email || user?.profile?.full_name || userId.slice(0, 8);
  };

  const unreadCount = messages?.filter((m) => !m.is_read).length || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Users size={22} /> ইউজার ও মেসেজ ম্যানেজমেন্ট
      </h1>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-1">
            <Users size={14} /> ইউজার তালিকা
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-1">
            <MessageCircle size={14} /> মেসেজ
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">নিবন্ধিত ইউজার ({usersData?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <p className="text-center py-4 text-muted-foreground">লোড হচ্ছে...</p>
              ) : !usersData?.length ? (
                <p className="text-center py-4 text-muted-foreground">কোনো ইউজার নেই</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ইমেইল</th>
                        <th className="text-left p-2">নাম</th>
                        <th className="text-left p-2">ফোন</th>
                        <th className="text-left p-2">জেলা</th>
                        <th className="text-left p-2">রোল</th>
                        <th className="text-left p-2">যোগদান</th>
                        <th className="text-left p-2">সর্বশেষ লগইন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData.map((user: any) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">{user.profile?.full_name || "—"}</td>
                          <td className="p-2">{user.profile?.phone || "—"}</td>
                          <td className="p-2">{user.profile?.district || "—"}</td>
                          <td className="p-2">
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-2 text-xs text-muted-foreground">
                            {user.created_at ? format(new Date(user.created_at), "dd/MM/yyyy") : "—"}
                          </td>
                          <td className="p-2 text-xs text-muted-foreground">
                            {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "dd/MM/yyyy HH:mm") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-4 space-y-4">
          {messagesLoading ? (
            <p className="text-center py-4 text-muted-foreground">লোড হচ্ছে...</p>
          ) : !messages?.length ? (
            <p className="text-center py-8 text-muted-foreground">কোনো মেসেজ নেই</p>
          ) : (
            messages.map((msg) => (
              <Card key={msg.id} className={!msg.is_read ? "border-primary/50 bg-primary/5" : ""}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-muted-foreground" />
                        <span className="font-semibold text-sm">{getUserEmail(msg.user_id)}</span>
                        {!msg.is_read && <Badge variant="destructive" className="text-xs">নতুন</Badge>}
                      </div>
                      <h3 className="font-bold mt-1">{msg.subject}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(msg.created_at), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>

                  <p className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{msg.message}</p>

                  {msg.admin_reply ? (
                    <div className="border-l-4 border-primary pl-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        আপনার উত্তর ({msg.replied_at ? format(new Date(msg.replied_at), "dd/MM/yyyy HH:mm") : ""})
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.admin_reply}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        rows={3}
                        placeholder="উত্তর লিখুন..."
                        value={replyText[msg.id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={!replyText[msg.id]?.trim() || replyMutation.isPending}
                          onClick={() => replyMutation.mutate({ id: msg.id, reply: replyText[msg.id] })}
                          className="gap-1"
                        >
                          <Send size={14} /> উত্তর দিন
                        </Button>
                        {!msg.is_read && (
                          <Button variant="outline" size="sm" onClick={() => markRead.mutate(msg.id)}>
                            পঠিত হিসেবে চিহ্নিত করুন
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsers;
