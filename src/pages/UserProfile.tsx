import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { toBengali } from "@/lib/bengali";
import { User, Package, MessageSquare, LogOut, Save, Send, Search, Link as LinkIcon, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "অপেক্ষমান", color: "bg-yellow-100 text-yellow-800" },
  processing: { label: "প্রসেসিং", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "শিপড", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "ডেলিভারি সম্পন্ন", color: "bg-green-100 text-green-800" },
  cancelled: { label: "বাতিল", color: "bg-red-100 text-red-800" },
};

const UserProfile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [newMessage, setNewMessage] = useState({ subject: "", message: "" });
  const [sendingMsg, setSendingMsg] = useState(false);
  const [trackOrderNum, setTrackOrderNum] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [tracking, setTracking] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showAvatarInput, setShowAvatarInput] = useState(false);

  // Use shared React Query for profile (syncs with admin panel & header)
  const { data: profileData } = useQuery({
    queryKey: ["user_profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Sync local state from query data
  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setAvatarUrl(profileData.avatar_url || "");
    }
  }, [profileData]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    loadOrders();
    loadMessages();
  }, [user]);

  const saveAvatarUrl = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl || null }).eq("user_id", user.id);
    if (error) toast.error("ছবি সেভ ব্যর্থ");
    else {
      toast.success("প্রোফাইল ছবি আপডেট হয়েছে");
      setShowAvatarInput(false);
      setProfile({ ...profile, avatar_url: avatarUrl });
      queryClient.invalidateQueries({ queryKey: ["user_profile", user.id] });
    }
  };

  const removeAvatar = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
    if (error) toast.error("ছবি মুছতে ব্যর্থ");
    else {
      toast.success("প্রোফাইল ছবি মুছে ফেলা হয়েছে");
      setAvatarUrl("");
      setProfile({ ...profile, avatar_url: null });
      setShowAvatarInput(false);
      queryClient.invalidateQueries({ queryKey: ["user_profile", user.id] });
    }
  };

  const loadOrders = async () => {
    const { data } = await supabase.from("book_orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const loadMessages = async () => {
    const { data } = await supabase.from("customer_messages").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
    if (data) setMessages(data);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      phone: profile.phone,
      address: profile.address,
      district: profile.district,
    }).eq("user_id", user!.id);
    setSaving(false);
    if (error) toast.error("সেভ ব্যর্থ");
    else {
      toast.success("প্রোফাইল আপডেট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["user_profile", user!.id] });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.subject || !newMessage.message) { toast.error("বিষয় ও মেসেজ দিন"); return; }
    setSendingMsg(true);
    const { error } = await supabase.from("customer_messages").insert({
      user_id: user!.id,
      subject: newMessage.subject,
      message: newMessage.message,
    });
    setSendingMsg(false);
    if (error) toast.error("পাঠাতে ব্যর্থ");
    else {
      toast.success("মেসেজ পাঠানো হয়েছে");
      setNewMessage({ subject: "", message: "" });
      loadMessages();
    }
  };

  const trackOrder = async () => {
    if (!trackOrderNum.trim()) return;
    setTracking(true);
    const { data } = await supabase.from("book_orders").select("*").eq("order_number", trackOrderNum.trim()).maybeSingle();
    setTracking(false);
    if (data) setTrackedOrder(data);
    else { setTrackedOrder(null); toast.error("এই অর্ডার নম্বরে কোনো অর্ডার পাওয়া যায়নি"); }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) return <Layout><div className="py-20 text-center">লোড হচ্ছে...</div></Layout>;

  return (
    <Layout>
      <SEOHead title="আমার প্রোফাইল" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Avatar className="h-14 w-14">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Profile" />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User size={28} />
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => setShowAvatarInput(!showAvatarInput)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="ছবি পরিবর্তন করুন"
              >
                <LinkIcon size={16} className="text-white" />
              </button>
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile?.full_name || "ইউজার"}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut size={16} className="mr-1" /> লগআউট
          </Button>
        </div>

        {/* Avatar URL input */}
        {showAvatarInput && (
          <div className="mb-4 p-3 border border-border rounded-lg bg-muted/30 space-y-2">
            <Label className="text-sm">ছবির লিংক দিন (URL)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/photo.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <Button size="sm" onClick={saveAvatarUrl}>সেভ</Button>
              {profile?.avatar_url && (
                <Button size="sm" variant="destructive" onClick={removeAvatar} title="ছবি মুছুন">
                  <Trash2 size={14} />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setShowAvatarInput(false)}>বাতিল</Button>
            </div>
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile">প্রোফাইল</TabsTrigger>
            <TabsTrigger value="orders">অর্ডার</TabsTrigger>
            <TabsTrigger value="track">ট্র্যাক</TabsTrigger>
            <TabsTrigger value="inbox">ইনবক্স</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle className="text-lg">প্রোফাইল তথ্য</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>পূর্ণ নাম</Label>
                  <Input value={profile?.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                </div>
                <div>
                  <Label>ফোন</Label>
                  <Input value={profile?.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div>
                  <Label>জেলা</Label>
                  <Input value={profile?.district || ""} onChange={(e) => setProfile({ ...profile, district: e.target.value })} />
                </div>
                <div>
                  <Label>ঠিকানা</Label>
                  <Textarea value={profile?.address || ""} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                </div>
                <Button onClick={saveProfile} disabled={saving}>
                  <Save size={16} className="mr-1" /> {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle className="text-lg">আমার অর্ডারসমূহ</CardTitle></CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">কোনো অর্ডার নেই</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const s = statusMap[order.status] || statusMap.pending;
                      return (
                        <div key={order.id} className="border rounded-lg p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{order.order_number}</span>
                            <Badge className={s.color}>{s.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            তারিখ: {new Date(order.created_at).toLocaleDateString("bn-BD")} | মোট: ৳{toBengali(order.total_amount)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Track Tab */}
          <TabsContent value="track">
            <Card>
              <CardHeader><CardTitle className="text-lg">অর্ডার ট্র্যাক করুন</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="অর্ডার নম্বর দিন (যেমন: ORD-260207-1234)" value={trackOrderNum} onChange={(e) => setTrackOrderNum(e.target.value)} onKeyDown={(e) => e.key === "Enter" && trackOrder()} />
                  <Button onClick={trackOrder} disabled={tracking}>
                    <Search size={16} className="mr-1" /> খুঁজুন
                  </Button>
                </div>
                {trackedOrder && (
                  <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{trackedOrder.order_number}</span>
                      <Badge className={statusMap[trackedOrder.status]?.color}>{statusMap[trackedOrder.status]?.label}</Badge>
                    </div>
                    <p className="text-sm">ক্রেতা: {trackedOrder.customer_name}</p>
                    <p className="text-sm">মোট: ৳{toBengali(trackedOrder.total_amount)}</p>
                    <p className="text-sm text-muted-foreground">তারিখ: {new Date(trackedOrder.created_at).toLocaleDateString("bn-BD")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inbox Tab */}
          <TabsContent value="inbox">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">নতুন মেসেজ পাঠান</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="বিষয়" value={newMessage.subject} onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })} />
                  <Textarea placeholder="আপনার মেসেজ লিখুন..." rows={3} value={newMessage.message} onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })} />
                  <Button onClick={sendMessage} disabled={sendingMsg}>
                    <Send size={16} className="mr-1" /> {sendingMsg ? "পাঠানো হচ্ছে..." : "পাঠান"}
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">মেসেজ ইতিহাস</CardTitle></CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">কোনো মেসেজ নেই</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-sm">{msg.subject}</span>
                            <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleDateString("bn-BD")}</span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                          {msg.admin_reply && (
                            <div className="bg-primary/5 border-l-2 border-primary p-2 rounded text-sm">
                              <span className="text-xs font-medium text-primary">উত্তর:</span>
                              <p className="mt-1">{msg.admin_reply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfile;
