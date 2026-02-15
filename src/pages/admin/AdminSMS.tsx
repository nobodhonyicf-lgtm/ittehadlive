import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { MessageSquare, Settings, Send, Users, Eye, EyeOff, Wallet, FileText, Plus, Trash2 } from "lucide-react";

const SMS_KEYS = [
  { key: "sms_api_key", label: "API Key", placeholder: "আপনার BulkSMSBD API Key", type: "password" },
  { key: "sms_sender_id", label: "Sender ID", placeholder: "আপনার অনুমোদিত Sender ID", type: "text" },
  { key: "sms_api_url", label: "API URL (ঐচ্ছিক)", placeholder: "https://bulksmsbd.net/api", type: "text" },
];

const AdminSMS = () => {
  const qc = useQueryClient();
  const [smsValues, setSmsValues] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [manualNumbers, setManualNumbers] = useState("");
  const [sending, setSending] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [recipientSource, setRecipientSource] = useState<"manual" | "branch" | "class" | "all">("manual");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState("");

  // Load SMS settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["sms_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", SMS_KEYS.map((k) => k.key));
      if (error) throw error;
      return data;
    },
  });

  // Load branches
  const { data: branches } = useQuery({
    queryKey: ["admin_branches_sms"],
    queryFn: async () => {
      const { data } = await supabase.from("branches").select("id, name").eq("is_active", true).order("sort_order");
      return data || [];
    },
  });

  // Load students for filtering
  const { data: students } = useQuery({
    queryKey: ["admin_students_sms"],
    queryFn: async () => {
      const { data } = await supabase
        .from("students")
        .select("id, name, phone, class_name, branch_id")
        .eq("is_active", true)
        .not("phone", "is", null);
      return data?.filter((s) => s.phone) || [];
    },
  });

  // Get unique class names
  const classNames = [...new Set(students?.map((s) => s.class_name) || [])].sort();

  // Load SMS templates
  const { data: templates } = useQuery({
    queryKey: ["sms_templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sms_templates").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addTemplateMutation = useMutation({
    mutationFn: async ({ name, content }: { name: string; content: string }) => {
      const { error } = await supabase.from("sms_templates").insert({ name, content });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sms_templates"] });
      setTemplateName("");
      setTemplateContent("");
      toast.success("টেমপ্লেট সংরক্ষিত");
    },
    onError: () => toast.error("টেমপ্লেট সংরক্ষণ ব্যর্থ"),
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sms_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sms_templates"] });
      toast.success("টেমপ্লেট মুছে ফেলা হয়েছে");
    },
  });

  // Save SMS setting
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
      qc.invalidateQueries({ queryKey: ["sms_settings"] });
      toast.success("সংরক্ষিত");
    },
    onError: () => toast.error("সংরক্ষণ ব্যর্থ"),
  });

  const saveAllSms = async () => {
    for (const item of SMS_KEYS) {
      const val = smsValues[item.key];
      if (val !== undefined) {
        await saveMutation.mutateAsync({ key: item.key, value: val });
      }
    }
    toast.success("সব SMS সেটিংস সংরক্ষিত!");
  };

  const getSettingValue = (key: string) => {
    return smsValues[key] ?? settings?.find((s) => s.key === key)?.value ?? "";
  };

  const checkBalance = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: { action: "balance" },
      });
      if (error) throw error;
      setBalance(data?.balance ?? JSON.stringify(data));
      toast.success("ব্যালেন্স লোড হয়েছে");
    } catch (err: any) {
      toast.error(err.message || "ব্যালেন্স চেক ব্যর্থ");
    }
  };

  const getRecipientNumbers = (): string[] => {
    if (recipientSource === "manual") {
      return manualNumbers.split(/[,;\n\s]+/).map((n) => n.trim()).filter(Boolean);
    }
    let filtered = students || [];
    if (recipientSource === "branch" && selectedBranch) {
      filtered = filtered.filter((s) => s.branch_id === selectedBranch);
    } else if (recipientSource === "class" && selectedClass) {
      filtered = filtered.filter((s) => s.class_name === selectedClass);
    }
    return filtered.map((s) => s.phone!).filter(Boolean);
  };

  const sendSMS = async () => {
    const numbers = getRecipientNumbers();
    if (!numbers.length) {
      toast.error("কমপক্ষে একটি নম্বর দিন");
      return;
    }
    if (!message) {
      toast.error("মেসেজ লিখুন");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: { numbers, message },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`${data.sent}/${data.total}টি SMS পাঠানো হয়েছে!`);
        if (data.sent < data.total) {
          toast.error(`${data.total - data.sent}টি ব্যর্থ হয়েছে`);
        }
      } else {
        toast.error(data?.error || "SMS পাঠানো ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "SMS পাঠানো ব্যর্থ");
    } finally {
      setSending(false);
    }
  };

  if (isLoading) return <div className="text-center py-8">লোড হচ্ছে...</div>;

  const recipientCount = getRecipientNumbers().length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare size={22} /> SMS ম্যানেজমেন্ট
      </h1>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings" className="gap-1">
            <Settings size={14} /> SMS সেটিংস
          </TabsTrigger>
          <TabsTrigger value="send" className="gap-1">
            <Send size={14} /> SMS পাঠান
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1">
            <FileText size={14} /> টেমপ্লেট
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">BulkSMSBD কনফিগারেশন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <a href="https://bulksmsbd.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  bulksmsbd.com
                </a>{" "}
                থেকে API Key ও Sender ID সংগ্রহ করে নিচে দিন।
              </p>
              {SMS_KEYS.map((item) => (
                <div key={item.key}>
                  <Label className="mb-1 block font-semibold">{item.label}</Label>
                  <div className="relative">
                    <Input
                      type={item.type === "password" && !showPasswords[item.key] ? "password" : "text"}
                      placeholder={item.placeholder}
                      value={getSettingValue(item.key)}
                      onChange={(e) => setSmsValues({ ...smsValues, [item.key]: e.target.value })}
                    />
                    {item.type === "password" && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPasswords({ ...showPasswords, [item.key]: !showPasswords[item.key] })}
                      >
                        {showPasswords[item.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button onClick={saveAllSms} disabled={saveMutation.isPending}>
                  সব সংরক্ষণ করুন
                </Button>
                <Button variant="outline" onClick={checkBalance} className="gap-1">
                  <Wallet size={14} /> ব্যালেন্স চেক
                </Button>
              </div>
              {balance !== null && (
                <div className="p-3 bg-muted rounded text-sm">
                  <strong>ব্যালেন্স:</strong> {balance}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SMS পাঠান</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recipient source */}
              <div>
                <Label className="mb-2 block font-semibold">প্রাপক নির্বাচন</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button variant={recipientSource === "manual" ? "default" : "outline"} size="sm" onClick={() => setRecipientSource("manual")}>
                    ম্যানুয়াল
                  </Button>
                  <Button variant={recipientSource === "all" ? "default" : "outline"} size="sm" onClick={() => setRecipientSource("all")}>
                    <Users size={14} className="mr-1" /> সব শিক্ষার্থী ({students?.length || 0})
                  </Button>
                  <Button variant={recipientSource === "branch" ? "default" : "outline"} size="sm" onClick={() => setRecipientSource("branch")}>
                    শাখা অনুযায়ী
                  </Button>
                  <Button variant={recipientSource === "class" ? "default" : "outline"} size="sm" onClick={() => setRecipientSource("class")}>
                    ক্লাস অনুযায়ী
                  </Button>
                </div>
              </div>

              {recipientSource === "manual" && (
                <div>
                  <Label className="mb-1 block">ফোন নম্বর (কমা বা নতুন লাইনে আলাদা করুন)</Label>
                  <Textarea
                    rows={3}
                    placeholder="01712345678, 01812345678"
                    value={manualNumbers}
                    onChange={(e) => setManualNumbers(e.target.value)}
                  />
                </div>
              )}

              {recipientSource === "branch" && (
                <div>
                  <Label className="mb-1 block">শাখা নির্বাচন করুন</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger><SelectValue placeholder="শাখা বাছুন" /></SelectTrigger>
                    <SelectContent>
                      {branches?.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {recipientSource === "class" && (
                <div>
                  <Label className="mb-1 block">ক্লাস নির্বাচন করুন</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger><SelectValue placeholder="ক্লাস বাছুন" /></SelectTrigger>
                    <SelectContent>
                      {classNames.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {recipientSource !== "manual" && (
                <div className="p-3 bg-muted rounded text-sm">
                  <strong>{recipientCount}</strong>টি নম্বরে পাঠানো হবে
                </div>
              )}

              {/* Template selection */}
              {templates && templates.length > 0 && (
                <div>
                  <Label className="mb-1 block">টেমপ্লেট থেকে বাছুন</Label>
                  <Select onValueChange={(val) => setMessage(val)}>
                    <SelectTrigger><SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" /></SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.content}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="mb-1 block">মেসেজ</Label>
                <Textarea
                  rows={4}
                  placeholder="আপনার মেসেজ এখানে লিখুন..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  বাংলা ইউনিকোড SMS এ ৭০ অক্ষর = ১ SMS, ইংরেজিতে ১৬০ অক্ষর = ১ SMS
                </p>
              </div>

              <Button onClick={sendSMS} disabled={sending} className="gap-2">
                <Send size={16} />
                {sending ? "পাঠানো হচ্ছে..." : `SMS পাঠান (${recipientCount}টি)`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">নতুন টেমপ্লেট তৈরি করুন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="mb-1 block">টেমপ্লেটের নাম</Label>
                <Input
                  placeholder="যেমন: রেজাল্ট প্রকাশ নোটিশ"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1 block">মেসেজ কন্টেন্ট</Label>
                <Textarea
                  rows={4}
                  placeholder="আপনার টেমপ্লেট মেসেজ লিখুন..."
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                />
              </div>
              <Button
                onClick={() => addTemplateMutation.mutate({ name: templateName, content: templateContent })}
                disabled={!templateName.trim() || !templateContent.trim() || addTemplateMutation.isPending}
                className="gap-1"
              >
                <Plus size={14} /> টেমপ্লেট সংরক্ষণ
              </Button>
            </CardContent>
          </Card>

          {templates && templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">সংরক্ষিত টেমপ্লেট ({templates.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.map((t) => (
                  <div key={t.id} className="flex items-start justify-between gap-3 p-3 bg-muted rounded">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{t.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{t.content}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setMessage(t.content); toast.success("টেমপ্লেট লোড হয়েছে — SMS পাঠান ট্যাবে যান"); }}
                      >
                        ব্যবহার
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteTemplateMutation.mutate(t.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSMS;
