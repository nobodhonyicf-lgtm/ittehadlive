import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { z } from "zod";
import { useSiteSettings } from "@/hooks/useData";
import { Phone, Mail, Send, Search, Reply, Clock, MessageSquare } from "lucide-react";
import { toBengali } from "@/lib/bengali";
import PageSidebar from "@/components/home/PageSidebar";
import { useIsApp } from "@/hooks/useIsApp";
import { useQuery } from "@tanstack/react-query";

const contactSchema = z.object({
  name: z.string().trim().min(1, "নাম আবশ্যক").max(100),
  email: z.string().trim().email("সঠিক ইমেইল দিন").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1, "বার্তা আবশ্যক").max(2000),
});

const Contact = () => {
  const { data: settings } = useSiteSettings();
  const isApp = useIsApp();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "replies">("form");
  const [lookupPhone, setLookupPhone] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const { data: myMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ["my_contact_replies", searchPhone],
    queryFn: async () => {
      if (!searchPhone.trim()) return [];
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .eq("phone", searchPhone.trim())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!searchPhone.trim(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const insertData = {
      name: parsed.data.name,
      message: parsed.data.message,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
    };
    const { error } = await supabase.from("contact_submissions").insert([insertData]);
    setLoading(false);
    if (error) {
      toast.error("বার্তা পাঠাতে সমস্যা হয়েছে");
    } else {
      toast.success("বার্তা সফলভাবে পাঠানো হয়েছে!");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <Layout>
      <SEOHead title="যোগাযোগ" description="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ-এর সাথে যোগাযোগ করুন — ফোন, ইমেইল অথবা মেসেজ পাঠান।" keywords="যোগাযোগ, ইত্তেহাদ, মাদরাসা, বাংলাদেশ" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: "যোগাযোগ" }]} />
        <div className={`grid grid-cols-1 ${isApp ? '' : 'lg:grid-cols-3'} gap-6`}>
          <div className={isApp ? '' : 'lg:col-span-2'}>
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeTab === "form" ? "default" : "outline"}
                className="flex-1 rounded-xl h-10 text-sm gap-1.5"
                onClick={() => setActiveTab("form")}
              >
                <Send size={14} /> যোগাযোগ ফর্ম
              </Button>
              <Button
                variant={activeTab === "replies" ? "default" : "outline"}
                className="flex-1 rounded-xl h-10 text-sm gap-1.5"
                onClick={() => setActiveTab("replies")}
              >
                <Reply size={14} /> উত্তর দেখুন
              </Button>
            </div>

            {activeTab === "form" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">যোগাযোগ ফর্ম</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">নাম *</Label>
                        <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="email">ইমেইল</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="phone">ফোন</Label>
                        <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="subject">বিষয়</Label>
                        <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="message">বার্তা *</Label>
                        <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full">
                        <Send size={16} />
                        {loading ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">যোগাযোগ তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="text-primary" size={20} />
                      <span>{toBengali(settings?.contact_phone || "০১৯২৬-৪২৮৯৮৮")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="text-primary" size={20} />
                      <span>{settings?.contact_email || "info@ittehad.bd"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Replies Tab */
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Reply size={20} /> উত্তর দেখুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form
                    onSubmit={(e) => { e.preventDefault(); setSearchPhone(lookupPhone); }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="আপনার ফোন নম্বর দিন"
                      value={lookupPhone}
                      onChange={e => setLookupPhone(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!lookupPhone.trim()}>
                      <Search size={16} />
                    </Button>
                  </form>

                  {searchPhone && messagesLoading && (
                    <p className="text-center text-sm text-muted-foreground py-6">লোড হচ্ছে...</p>
                  )}

                  {searchPhone && !messagesLoading && myMessages?.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare size={36} className="mx-auto mb-2 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">এই নম্বরে কোনো বার্তা পাওয়া যায়নি</p>
                    </div>
                  )}

                  {myMessages?.map((msg) => (
                    <div key={msg.id} className="rounded-lg border border-border overflow-hidden">
                      <div className="p-3.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          {msg.subject && <span className="text-xs font-semibold text-foreground">{msg.subject}</span>}
                          <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                            <Clock size={10} /> {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{msg.message}</p>
                      </div>

                      {msg.admin_reply ? (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-t border-emerald-200/50 dark:border-emerald-800/30 p-3.5">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Reply size={12} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">প্রশাসনের উত্তর</span>
                            {msg.replied_at && (
                              <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 ml-auto">
                                {formatDate(msg.replied_at)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">{msg.admin_reply}</p>
                        </div>
                      ) : (
                        <div className="bg-muted/30 border-t border-border p-3 text-center">
                          <span className="text-[11px] text-muted-foreground">⏳ উত্তরের অপেক্ষায়</span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          {!isApp && (
            <div className="lg:col-span-1">
              <PageSidebar />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
