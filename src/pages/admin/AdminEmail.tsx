import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { Mail, Settings, Send, Users, Eye, EyeOff } from "lucide-react";

const SMTP_KEYS = [
  { key: "smtp_host", label: "SMTP হোস্ট", placeholder: "smtp.gmail.com", type: "text" },
  { key: "smtp_port", label: "SMTP পোর্ট", placeholder: "587", type: "text" },
  { key: "smtp_username", label: "SMTP ইউজারনেম/ইমেইল", placeholder: "your@email.com", type: "text" },
  { key: "smtp_password", label: "SMTP পাসওয়ার্ড", placeholder: "••••••••", type: "password" },
  { key: "smtp_from_email", label: "প্রেরকের ইমেইল", placeholder: "noreply@example.com", type: "text" },
  { key: "smtp_from_name", label: "প্রেরকের নাম", placeholder: "My Site", type: "text" },
  { key: "smtp_secure", label: "SSL/TLS (পোর্ট 465 হলে true)", placeholder: "false", type: "text" },
];

const AdminEmail = () => {
  const qc = useQueryClient();
  const [smtpValues, setSmtpValues] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sending, setSending] = useState(false);
  const [recipientSource, setRecipientSource] = useState<"manual" | "contacts" | "customers">("manual");

  // Load SMTP settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["smtp_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", SMTP_KEYS.map((k) => k.key));
      if (error) throw error;
      return data;
    },
  });

  // Load contacts for bulk email
  const { data: contacts } = useQuery({
    queryKey: ["admin_contacts_email"],
    queryFn: async () => {
      const { data } = await supabase.from("contact_submissions").select("email, name").not("email", "is", null);
      return data?.filter((c) => c.email) || [];
    },
  });

  // Load customer profiles
  const { data: profiles } = useQuery({
    queryKey: ["admin_profiles_email"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name, user_id");
      return data || [];
    },
  });

  // Save SMTP setting
  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const existing = settings?.find((s) => s.key === key);
      if (existing) {
        const { error } = await supabase.from("site_settings").update({ value }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert({ key, value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["smtp_settings"] });
      toast.success("সংরক্ষিত");
    },
    onError: () => toast.error("সংরক্ষণ ব্যর্থ"),
  });

  const saveAllSmtp = async () => {
    for (const item of SMTP_KEYS) {
      const val = smtpValues[item.key];
      if (val !== undefined) {
        await saveMutation.mutateAsync({ key: item.key, value: val });
      }
    }
    toast.success("সব SMTP সেটিংস সংরক্ষিত!");
  };

  const getSettingValue = (key: string) => {
    return smtpValues[key] ?? settings?.find((s) => s.key === key)?.value ?? "";
  };

  const sendEmail = async () => {
    let recipients: string[] = [];

    if (recipientSource === "manual") {
      recipients = emailTo
        .split(/[,;\n]+/)
        .map((e) => e.trim())
        .filter(Boolean);
    } else if (recipientSource === "contacts") {
      recipients = contacts?.map((c) => c.email!).filter(Boolean) || [];
    } else if (recipientSource === "customers") {
      // We need to get emails from auth - but we can't directly. We'll use a workaround.
      toast.error("কাস্টমার ইমেইল পেতে প্রোফাইলে ইমেইল ফিল্ড প্রয়োজন।");
      return;
    }

    if (!recipients.length) {
      toast.error("কমপক্ষে একটি ইমেইল দিন");
      return;
    }
    if (!emailSubject || !emailBody) {
      toast.error("সাবজেক্ট ও বডি লিখুন");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { to: recipients, subject: emailSubject, html: emailBody },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`${data.sent}/${data.total} ইমেইল পাঠানো হয়েছে!`);
        if (data.sent < data.total) {
          const failed = data.results?.filter((r: any) => !r.success);
          console.error("Failed emails:", failed);
          toast.error(`${data.total - data.sent}টি ব্যর্থ হয়েছে`);
        }
      } else {
        toast.error(data?.error || "ইমেইল পাঠানো ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "ইমেইল পাঠানো ব্যর্থ");
    } finally {
      setSending(false);
    }
  };

  const testSmtp = async () => {
    const testEmail = getSettingValue("smtp_from_email") || getSettingValue("smtp_username");
    if (!testEmail) {
      toast.error("আগে SMTP সেটিংস সংরক্ষণ করুন");
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: [testEmail],
          subject: "SMTP টেস্ট মেইল",
          html: "<h2>SMTP সেটআপ সফল!</h2><p>এই মেইলটি আপনার SMTP কনফিগারেশন টেস্ট করার জন্য পাঠানো হয়েছে।</p>",
        },
      });
      if (error) throw error;
      if (data?.success && data.sent > 0) {
        toast.success(`টেস্ট মেইল ${testEmail} এ পাঠানো হয়েছে!`);
      } else {
        toast.error(data?.error || "টেস্ট ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "টেস্ট ব্যর্থ");
    } finally {
      setSending(false);
    }
  };

  if (isLoading) return <div className="text-center py-8">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Mail size={22} /> ইমেইল ম্যানেজমেন্ট
      </h1>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings" className="gap-1">
            <Settings size={14} /> SMTP সেটিংস
          </TabsTrigger>
          <TabsTrigger value="send" className="gap-1">
            <Send size={14} /> ইমেইল পাঠান
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SMTP কনফিগারেশন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                আপনার SMTP সার্ভারের তথ্য দিন। Gmail ব্যবহার করতে চাইলে App Password তৈরি করে ব্যবহার করুন।
              </p>
              {SMTP_KEYS.map((item) => (
                <div key={item.key}>
                  <Label className="mb-1 block font-semibold">{item.label}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={
                          item.type === "password" && !showPasswords[item.key]
                            ? "password"
                            : "text"
                        }
                        placeholder={item.placeholder}
                        value={getSettingValue(item.key)}
                        onChange={(e) =>
                          setSmtpValues({ ...smtpValues, [item.key]: e.target.value })
                        }
                      />
                      {item.type === "password" && (
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              [item.key]: !showPasswords[item.key],
                            })
                          }
                        >
                          {showPasswords[item.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button onClick={saveAllSmtp} disabled={saveMutation.isPending}>
                  সব সংরক্ষণ করুন
                </Button>
                <Button variant="outline" onClick={testSmtp} disabled={sending}>
                  {sending ? "পাঠানো হচ্ছে..." : "টেস্ট মেইল পাঠান"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ইমেইল পাঠান</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recipient source */}
              <div>
                <Label className="mb-2 block font-semibold">প্রাপক নির্বাচন</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={recipientSource === "manual" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRecipientSource("manual")}
                  >
                    ম্যানুয়াল ইনপুট
                  </Button>
                  <Button
                    variant={recipientSource === "contacts" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRecipientSource("contacts")}
                  >
                    <Users size={14} className="mr-1" />
                    সব কন্টাক্ট ({contacts?.length || 0})
                  </Button>
                </div>
              </div>

              {recipientSource === "manual" && (
                <div>
                  <Label className="mb-1 block">প্রাপকের ইমেইল (কমা বা নতুন লাইনে আলাদা করুন)</Label>
                  <Textarea
                    rows={3}
                    placeholder="email1@example.com, email2@example.com"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                  />
                </div>
              )}

              {recipientSource === "contacts" && (
                <div className="p-3 bg-muted rounded text-sm">
                  <strong>{contacts?.length || 0}</strong>টি কন্টাক্টের ইমেইলে পাঠানো হবে।
                  <div className="mt-1 max-h-24 overflow-y-auto text-xs text-muted-foreground">
                    {contacts?.map((c) => `${c.name} (${c.email})`).join(", ")}
                  </div>
                </div>
              )}

              <div>
                <Label className="mb-1 block">সাবজেক্ট</Label>
                <Input
                  placeholder="ইমেইলের বিষয়"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-1 block">বডি (HTML সমর্থিত)</Label>
                <Textarea
                  rows={8}
                  placeholder="<h2>শিরোনাম</h2><p>আপনার মেসেজ এখানে লিখুন...</p>"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  HTML ট্যাগ ব্যবহার করতে পারেন: &lt;h2&gt;, &lt;p&gt;, &lt;b&gt;, &lt;a href=""&gt; ইত্যাদি
                </p>
              </div>

              <Button onClick={sendEmail} disabled={sending} className="gap-2">
                <Send size={16} />
                {sending ? "পাঠানো হচ্ছে..." : "ইমেইল পাঠান"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEmail;
