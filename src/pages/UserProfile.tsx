import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { User, Package, MessageSquare, LogOut, Save, Send, Search, Link as LinkIcon, Trash2, Mail, Phone, MapPin, ChevronRight, Briefcase, Copy, Building2, GraduationCap, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIsApp } from "@/hooks/useIsApp";
import AppLayout from "@/components/app/AppLayout";
import Breadcrumbs from "@/components/Breadcrumbs";

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
  const [trackJobCode, setTrackJobCode] = useState("");
  const [trackedJobApp, setTrackedJobApp] = useState<any>(null);
  const [trackingJob, setTrackingJob] = useState(false);
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

  // Check if user has assigned branches
  const { data: assignedBranches } = useQuery({
    queryKey: ["user_assigned_branches", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("branches").select("id, name, image_url, status").eq("user_id", user!.id).eq("is_active", true);
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Check if user has approved teacher application
  const { data: teacherApp } = useQuery({
    queryKey: ["user_teacher_app", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("teacher_applications").select("id, name, status, subject").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const hasDashboard = (assignedBranches && assignedBranches.length > 0) || (teacherApp?.status === "approved");

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

  const trackJobApplication = async () => {
    if (!trackJobCode.trim()) return;
    setTrackingJob(true);
    const { data } = await supabase.from("job_applications").select("*, job_postings(title)").eq("tracking_code", trackJobCode.trim().toUpperCase()).maybeSingle();
    setTrackingJob(false);
    if (data) setTrackedJobApp(data);
    else { setTrackedJobApp(null); toast.error("এই ট্র্যাকিং কোডে কোনো আবেদন পাওয়া যায়নি"); }
  };

  const jobStatusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "অপেক্ষমান", color: "bg-yellow-100 text-yellow-800" },
    reviewing: { label: "পর্যালোচনায়", color: "bg-blue-100 text-blue-800" },
    shortlisted: { label: "শর্টলিস্ট", color: "bg-purple-100 text-purple-800" },
    approved: { label: "অনুমোদিত", color: "bg-green-100 text-green-800" },
    rejected: { label: "প্রত্যাখ্যাত", color: "bg-red-100 text-red-800" },
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isApp = useIsApp();

  if (authLoading || !user) {
    const loadingContent = <div className="py-20 text-center">লোড হচ্ছে...</div>;
    return isApp ? <AppLayout>{loadingContent}</AppLayout> : <Layout>{loadingContent}</Layout>;
  }

  const profileContent = (
    <div className={isApp ? "max-w-lg mx-auto px-4 py-6" : "max-w-4xl mx-auto px-4 py-6"}>
      <Breadcrumbs items={[{ label: "প্রোফাইল" }]} />
      {/* Profile Header - Professional Card */}
      {isApp ? (
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 mb-6 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-16 w-16 ring-2 ring-white/30 shadow-md">
                {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="Profile" /> : null}
                <AvatarFallback className="bg-white/20 text-primary-foreground text-xl font-bold">
                  {profile?.full_name?.charAt(0) || <User size={28} />}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => setShowAvatarInput(!showAvatarInput)}
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white text-primary flex items-center justify-center shadow-md"
              >
                <LinkIcon size={10} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{profile?.full_name || "ইউজার"}</h1>
              <p className="text-xs opacity-80 flex items-center gap-1 truncate">
                <Mail size={11} /> {user.email}
              </p>
              {profile?.phone && (
                <p className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                  <Phone size={11} /> {profile.phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={handleSignOut}>
              <LogOut size={14} className="mr-1" /> লগআউট
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Avatar className="h-14 w-14">
                {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="Profile" /> : null}
                <AvatarFallback className="bg-primary/10 text-primary"><User size={28} /></AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setShowAvatarInput(!showAvatarInput)} title="ছবি পরিবর্তন করুন" className="text-white hover:scale-110 transition-transform"><LinkIcon size={14} /></button>
                {profile?.avatar_url && <button onClick={removeAvatar} title="ছবি মুছুন" className="text-red-300 hover:text-red-100 hover:scale-110 transition-all"><Trash2 size={14} /></button>}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile?.full_name || "ইউজার"}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}><LogOut size={16} className="mr-1" /> লগআউট</Button>
        </div>
      )}

      {/* Avatar URL input */}
      {showAvatarInput && (
        <div className="mb-4 p-3 border border-border rounded-lg bg-muted/30 space-y-2">
          <Label className="text-sm">ছবির লিংক দিন (URL)</Label>
          <div className="flex gap-2">
            <Input placeholder="https://example.com/photo.jpg" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
            <Button size="sm" onClick={saveAvatarUrl}>সেভ</Button>
            {profile?.avatar_url && <Button size="sm" variant="destructive" onClick={removeAvatar} title="ছবি মুছুন"><Trash2 size={14} /></Button>}
            <Button size="sm" variant="ghost" onClick={() => setShowAvatarInput(false)}>বাতিল</Button>
          </div>
        </div>
      )}

      {/* Dashboard Section for assigned users */}
      {hasDashboard && (
        <Card className="mb-4 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <LayoutDashboard size={18} className="text-primary" /> আমার ড্যাশবোর্ড
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {assignedBranches && assignedBranches.length > 0 && (
              <div className="space-y-2">
                {assignedBranches.map(branch => (
                  <Link key={branch.id} to="/branch-dashboard">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
                      {branch.image_url ? (
                        <img src={branch.image_url} alt="" className="w-10 h-10 rounded-lg object-contain bg-muted" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 size={20} className="text-primary" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{branch.name}</p>
                        <p className="text-[11px] text-muted-foreground">প্রতিষ্ঠান ম্যানেজমেন্ট</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {teacherApp?.status === "approved" && (
              <Link to="/teacher-dashboard">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><GraduationCap size={20} className="text-emerald-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">শিক্ষক ড্যাশবোর্ড</p>
                    <p className="text-[11px] text-muted-foreground">{teacherApp.subject} - আবেদন অনুমোদিত</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary" />
                </div>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className={isApp ? "grid grid-cols-4 w-full rounded-xl" : "grid grid-cols-4 w-full"}>
          <TabsTrigger value="profile">প্রোফাইল</TabsTrigger>
          <TabsTrigger value="orders">অর্ডার</TabsTrigger>
          <TabsTrigger value="track">ট্র্যাক</TabsTrigger>
          <TabsTrigger value="inbox">ইনবক্স</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className={isApp ? "border-0 shadow-sm" : ""}>
            <CardHeader><CardTitle className="text-lg">প্রোফাইল তথ্য</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>পূর্ণ নাম</Label><Input value={profile?.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
              <div><Label>ফোন</Label><Input value={profile?.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
              <div><Label>জেলা</Label><Input value={profile?.district || ""} onChange={(e) => setProfile({ ...profile, district: e.target.value })} /></div>
              <div><Label>ঠিকানা</Label><Textarea value={profile?.address || ""} onChange={(e) => setProfile({ ...profile, address: e.target.value })} /></div>
              <Button onClick={saveProfile} disabled={saving} className="w-full">
                <Save size={16} className="mr-1" /> {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card className={isApp ? "border-0 shadow-sm" : ""}>
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
          <div className="space-y-4">
            {/* Order Tracking */}
            <Card className={isApp ? "border-0 shadow-sm" : ""}>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Package size={18} /> অর্ডার ট্র্যাক করুন</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="অর্ডার নম্বর দিন" value={trackOrderNum} onChange={(e) => setTrackOrderNum(e.target.value)} onKeyDown={(e) => e.key === "Enter" && trackOrder()} />
                  <Button onClick={trackOrder} disabled={tracking}><Search size={16} className="mr-1" /> খুঁজুন</Button>
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

            {/* Job Application Tracking */}
            <Card className={isApp ? "border-0 shadow-sm" : ""}>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Briefcase size={18} /> নিয়োগ আবেদন ট্র্যাক করুন</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="ট্র্যাকিং কোড দিন (যেমন: JA-2603-abc123)" value={trackJobCode} onChange={(e) => setTrackJobCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && trackJobApplication()} />
                  <Button onClick={trackJobApplication} disabled={trackingJob}><Search size={16} className="mr-1" /> খুঁজুন</Button>
                </div>
                {trackedJobApp && (
                  <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-primary">{trackedJobApp.tracking_code}</span>
                      <Badge className={jobStatusMap[trackedJobApp.status]?.color}>{jobStatusMap[trackedJobApp.status]?.label}</Badge>
                    </div>
                    <p className="text-sm font-semibold">{(trackedJobApp as any).job_postings?.title || "নিয়োগ বিজ্ঞপ্তি"}</p>
                    <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                      <p>আবেদনকারী: {trackedJobApp.applicant_name}</p>
                      <p>ফোন: {trackedJobApp.phone}</p>
                      <p>বিষয়: {trackedJobApp.subject || "—"}</p>
                      <p>তারিখ: {new Date(trackedJobApp.created_at).toLocaleDateString("bn-BD")}</p>
                    </div>
                    {trackedJobApp.admin_note && (
                      <div className="bg-primary/5 border-l-2 border-primary p-2 rounded text-sm">
                        <span className="text-xs font-medium text-primary">প্রশাসনের নোট:</span>
                        <p className="mt-1">{trackedJobApp.admin_note}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inbox Tab */}
        <TabsContent value="inbox">
          <div className="space-y-4">
            <Card className={isApp ? "border-0 shadow-sm" : ""}>
              <CardHeader><CardTitle className="text-lg">নতুন মেসেজ পাঠান</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="বিষয়" value={newMessage.subject} onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })} />
                <Textarea placeholder="আপনার মেসেজ লিখুন..." rows={3} value={newMessage.message} onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })} />
                <Button onClick={sendMessage} disabled={sendingMsg} className="w-full">
                  <Send size={16} className="mr-1" /> {sendingMsg ? "পাঠানো হচ্ছে..." : "পাঠান"}
                </Button>
              </CardContent>
            </Card>
            <Card className={isApp ? "border-0 shadow-sm" : ""}>
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
  );

  return (
    <>
      <SEOHead title="আমার প্রোফাইল" />
      {isApp ? <AppLayout>{profileContent}</AppLayout> : <Layout>{profileContent}</Layout>}
    </>
  );
};

export default UserProfile;
