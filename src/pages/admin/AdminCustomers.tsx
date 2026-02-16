import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, MessageCircle, Send, Mail, ShieldCheck, Plus, Trash2, Tag } from "lucide-react";
import { format } from "date-fns";

const MAX_REPLY_CHARS = 1000;

const SECTION_LABELS: Record<string, string> = {
  analytics: "অ্যানালিটিক্স",
  posts: "পোস্ট",
  "photo-card": "ফটো কার্ড",
  pages: "পেজ",
  notices: "নোটিশ",
  branches: "শাখা",
  students: "শিক্ষার্থী",
  exams: "পরীক্ষা",
  subjects: "বিষয়",
  results: "রেজাল্ট",
  polls: "পোল",
  "prayer-times": "নামাজের সময়",
  books: "বই",
  "book-orders": "অর্ডার",
  "book-reviews": "বই রিভিউ",
  ads: "বিজ্ঞাপন",
  videos: "ভিডিও",
  leaders: "নেতৃবৃন্দ",
  committee: "কমিটি/উপদেষ্টা",
  gallery: "গ্যালারী",
  sliders: "স্লাইডার",
  menu: "মেনু",
  categories: "ক্যাটাগরি",
  contacts: "যোগাযোগ",
  users: "ইউজার",
  email: "ইমেইল",
  sms: "SMS",
  settings: "সেটিংস",
};

const ALL_SECTIONS = Object.keys(SECTION_LABELS);

const AdminUsers = () => {
  const qc = useQueryClient();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [selectedRole, setSelectedRole] = useState("admin");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDisplay, setNewRoleDisplay] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  // Load custom roles
  const { data: customRoles } = useQuery({
    queryKey: ["custom_roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_roles")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async () => {
      if (!newRoleName.trim() || !newRoleDisplay.trim()) throw new Error("নাম দিন");
      const { error } = await supabase.from("custom_roles").insert({
        role_name: newRoleName.trim().toLowerCase().replace(/\s+/g, "_"),
        display_name: newRoleDisplay.trim(),
        description: newRoleDesc.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom_roles"] });
      setNewRoleName("");
      setNewRoleDisplay("");
      setNewRoleDesc("");
      toast.success("নতুন রোল যুক্ত হয়েছে");
    },
    onError: (e: any) => toast.error(e.message || "রোল যুক্ত করা ব্যর্থ"),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_roles").delete().eq("id", id);
      if (error) throw error;
      // Also delete associated permissions
      const role = customRoles?.find((r: any) => r.id === id);
      if (role) {
        await supabase.from("admin_permissions").delete().eq("role_name", role.role_name);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom_roles"] });
      qc.invalidateQueries({ queryKey: ["admin_permissions"] });
      toast.success("রোল মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("রোল মুছে ফেলা ব্যর্থ"),
  });

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

  // Load permissions
  const { data: permissions, isLoading: permsLoading } = useQuery({
    queryKey: ["admin_permissions", selectedRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_permissions")
        .select("*")
        .eq("role_name", selectedRole);
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

  // Role change mutation (standard role)
  const roleMutation = useMutation({
    mutationFn: async ({ userId, newRole, customRoleName }: { userId: string; newRole: "admin" | "user"; customRoleName?: string | null }) => {
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      const payload: any = { role: newRole, custom_role_name: customRoleName || null };

      if (existing) {
        const { error } = await supabase
          .from("user_roles")
          .update(payload)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, ...payload });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_users_list"] });
      toast.success("রোল পরিবর্তন সফল");
    },
    onError: () => toast.error("রোল পরিবর্তন ব্যর্থ"),
  });

  // Permission update mutation
  const permMutation = useMutation({
    mutationFn: async ({
      sectionKey,
      field,
      value,
    }: {
      sectionKey: string;
      field: "can_view" | "can_edit" | "can_delete";
      value: boolean;
    }) => {
      const existing = permissions?.find((p: any) => p.section_key === sectionKey);
      if (existing) {
        const { error } = await supabase
          .from("admin_permissions")
          .update({ [field]: value })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("admin_permissions").insert({
          role_name: selectedRole,
          section_key: sectionKey,
          can_view: field === "can_view" ? value : true,
          can_edit: field === "can_edit" ? value : false,
          can_delete: field === "can_delete" ? value : false,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_permissions", selectedRole] });
      toast.success("পারমিশন আপডেট হয়েছে");
    },
    onError: () => toast.error("পারমিশন আপডেট ব্যর্থ"),
  });

  const getPermValue = (sectionKey: string, field: "can_view" | "can_edit" | "can_delete") => {
    const perm = permissions?.find((p: any) => p.section_key === sectionKey);
    if (!perm) return field === "can_view"; // default: view=true, edit/delete=false
    return perm[field];
  };

  const getUserEmail = (userId: string) => {
    const user = usersData?.find((u: any) => u.id === userId);
    return user?.email || user?.profile?.full_name || userId.slice(0, 8);
  };

  const unreadCount = messages?.filter((m) => !m.is_read).length || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Users size={22} /> ইউজার ও পারমিশন ম্যানেজমেন্ট
      </h1>

      <Tabs defaultValue="users">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users" className="gap-1">
            <Users size={14} /> ইউজার তালিকা
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1">
            <Tag size={14} /> রোল
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-1">
            <ShieldCheck size={14} /> পারমিশন
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-1">
            <MessageCircle size={14} /> মেসেজ
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
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
                        <th className="text-left p-2">স্ট্যান্ডার্ড রোল</th>
                        <th className="text-left p-2">কাস্টম রোল</th>
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
                            <div className="flex flex-wrap gap-1">
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role === "admin" ? "এডমিন" : "ইউজার"}
                              </Badge>
                              {user.custom_role_display && (
                                <Badge variant="outline" className="text-xs">
                                  {user.custom_role_display}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-xs text-muted-foreground">
                            {user.created_at ? format(new Date(user.created_at), "dd/MM/yyyy") : "—"}
                          </td>
                          <td className="p-2 text-xs text-muted-foreground">
                            {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "dd/MM/yyyy HH:mm") : "—"}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Select
                                value={user.role}
                                onValueChange={(val) =>
                                  roleMutation.mutate({ userId: user.id, newRole: val as "admin" | "user", customRoleName: user.custom_role_name })
                                }
                              >
                                <SelectTrigger className="w-24 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">ইউজার</SelectItem>
                                  <SelectItem value="admin">এডমিন</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </td>
                          <td className="p-2">
                            <Select
                              value={user.custom_role_name || "none"}
                              onValueChange={(val) =>
                                roleMutation.mutate({ userId: user.id, newRole: user.role as "admin" | "user", customRoleName: val === "none" ? null : val })
                              }
                            >
                              <SelectTrigger className="w-28 h-8 text-xs">
                                <SelectValue placeholder="কোনটি নয়" />
                              </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="none">কোনটি নয়</SelectItem>
                                {(customRoles || []).filter((r: any) => !r.is_system).map((role: any) => (
                                  <SelectItem key={role.role_name} value={role.role_name}>
                                    {role.display_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag size={18} /> কাস্টম রোল ম্যানেজমেন্ট
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                নতুন রোল তৈরি করুন এবং পারমিশন ট্যাবে তাদের অনুমতি নির্ধারণ করুন।
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new role form */}
              <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                <h3 className="font-semibold text-sm">নতুন রোল যুক্ত করুন</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">রোল কী (ইংরেজি)</label>
                    <Input
                      placeholder="যেমন: editor, moderator"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">প্রদর্শন নাম</label>
                    <Input
                      placeholder="যেমন: সম্পাদক, মডারেটর"
                      value={newRoleDisplay}
                      onChange={(e) => setNewRoleDisplay(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">বিবরণ (ঐচ্ছিক)</label>
                    <Input
                      placeholder="এই রোলের কাজ কী..."
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="gap-1"
                  disabled={!newRoleName.trim() || !newRoleDisplay.trim() || addRoleMutation.isPending}
                  onClick={() => addRoleMutation.mutate()}
                >
                  <Plus size={14} /> রোল যুক্ত করুন
                </Button>
              </div>

              {/* Existing roles list */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2">রোল কী</th>
                      <th className="text-left p-2">প্রদর্শন নাম</th>
                      <th className="text-left p-2">বিবরণ</th>
                      <th className="text-left p-2">ধরন</th>
                      <th className="text-left p-2">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(customRoles || []).map((role: any) => (
                      <tr key={role.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono text-xs">{role.role_name}</td>
                        <td className="p-2 font-medium">{role.display_name}</td>
                        <td className="p-2 text-muted-foreground text-xs">{role.description || "—"}</td>
                        <td className="p-2">
                          <Badge variant={role.is_system ? "default" : "outline"}>
                            {role.is_system ? "সিস্টেম" : "কাস্টম"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {!role.is_system && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1 h-7 text-xs"
                              onClick={() => deleteRoleMutation.mutate(role.id)}
                              disabled={deleteRoleMutation.isPending}
                            >
                              <Trash2 size={12} /> মুছুন
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck size={18} /> রোল ভিত্তিক পারমিশন
                </CardTitle>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(customRoles || []).map((role: any) => (
                      <SelectItem key={role.role_name} value={role.role_name}>
                        {role.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                প্রতিটি সেকশনের জন্য দেখা, এডিট ও ডিলিট করার অনুমতি নির্ধারণ করুন।
              </p>
            </CardHeader>
            <CardContent>
              {permsLoading ? (
                <p className="text-center py-4 text-muted-foreground">লোড হচ্ছে...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 font-semibold">সেকশন</th>
                        <th className="text-center p-2 font-semibold">দেখতে পারবে</th>
                        <th className="text-center p-2 font-semibold">এডিট করতে পারবে</th>
                        <th className="text-center p-2 font-semibold">ডিলিট করতে পারবে</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALL_SECTIONS.map((section) => (
                        <tr key={section} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-medium">{SECTION_LABELS[section]}</td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={getPermValue(section, "can_view")}
                              onCheckedChange={(checked) =>
                                permMutation.mutate({ sectionKey: section, field: "can_view", value: !!checked })
                              }
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={getPermValue(section, "can_edit")}
                              onCheckedChange={(checked) =>
                                permMutation.mutate({ sectionKey: section, field: "can_edit", value: !!checked })
                              }
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Checkbox
                              checked={getPermValue(section, "can_delete")}
                              onCheckedChange={(checked) =>
                                permMutation.mutate({ sectionKey: section, field: "can_delete", value: !!checked })
                              }
                            />
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

        {/* Messages Tab */}
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
                      <div>
                        <Textarea
                          rows={3}
                          placeholder="উত্তর লিখুন..."
                          maxLength={MAX_REPLY_CHARS}
                          value={replyText[msg.id] || ""}
                          onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {(replyText[msg.id] || "").length}/{MAX_REPLY_CHARS} অক্ষর
                        </p>
                      </div>
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
