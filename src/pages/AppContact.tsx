import { useState } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { Send, MessageSquare, CheckCircle, Search, Reply, Clock } from "lucide-react";

const AppContact = () => {
  const [form, setForm] = useState({ name: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [lookupPhone, setLookupPhone] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [activeTab, setActiveTab] = useState<"form" | "replies">("form");

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
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("নাম ও বার্তা আবশ্যক");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_submissions").insert([{
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      subject: form.subject.trim() || null,
      message: form.message.trim(),
    }]);
    setLoading(false);
    if (error) {
      toast.error("বার্তা পাঠাতে সমস্যা হয়েছে");
    } else {
      setSent(true);
      setForm({ name: "", phone: "", subject: "", message: "" });
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-6 mb-6 shadow-lg text-center">
          <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={28} />
          </div>
          <h1 className="text-xl font-bold">যোগাযোগ করুন</h1>
          <p className="text-sm opacity-80 mt-1">আমাদের সাথে সরাসরি যোগাযোগ করুন</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "form" ? "default" : "outline"}
            className="flex-1 rounded-xl h-10 text-sm gap-1.5"
            onClick={() => setActiveTab("form")}
          >
            <Send size={14} /> বার্তা পাঠান
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
          <>
            {sent ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <CheckCircle size={48} className="mx-auto mb-3 text-emerald-500" />
                <h2 className="text-lg font-bold mb-1">বার্তা পাঠানো হয়েছে!</h2>
                <p className="text-sm text-muted-foreground mb-4">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব</p>
                <Button variant="outline" className="rounded-xl" onClick={() => setSent(false)}>
                  আরেকটি বার্তা পাঠান
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input placeholder="আপনার নাম *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="rounded-xl h-11" />
                <Input placeholder="ফোন নম্বর" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="rounded-xl h-11" />
                <Input placeholder="বিষয়" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="rounded-xl h-11" />
                <Textarea placeholder="আপনার বার্তা লিখুন *" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required className="rounded-xl" />
                <Button type="submit" disabled={loading} className="w-full rounded-xl h-11 gap-2">
                  <Send size={16} />
                  {loading ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
                </Button>
              </form>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {/* Phone lookup */}
            <form
              onSubmit={(e) => { e.preventDefault(); setSearchPhone(lookupPhone); }}
              className="flex gap-2"
            >
              <Input
                placeholder="আপনার ফোন নম্বর দিন"
                value={lookupPhone}
                onChange={e => setLookupPhone(e.target.value)}
                className="rounded-xl h-11 flex-1"
              />
              <Button type="submit" className="rounded-xl h-11 px-4" disabled={!lookupPhone.trim()}>
                <Search size={16} />
              </Button>
            </form>

            {searchPhone && messagesLoading && (
              <p className="text-center text-sm text-muted-foreground py-6">লোড হচ্ছে...</p>
            )}

            {searchPhone && !messagesLoading && myMessages?.length === 0 && (
              <div className="text-center py-8 bg-card rounded-2xl border border-border">
                <MessageSquare size={36} className="mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">এই নম্বরে কোনো বার্তা পাওয়া যায়নি</p>
              </div>
            )}

            {myMessages?.map((msg) => (
              <div key={msg.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                {/* User's message */}
                <div className="p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    {msg.subject && <span className="text-xs font-semibold text-foreground">{msg.subject}</span>}
                    <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                      <Clock size={10} /> {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{msg.message}</p>
                </div>

                {/* Admin reply */}
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
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AppContact;
