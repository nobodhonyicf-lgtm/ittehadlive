import { useState } from "react";
import AppLayout from "@/components/app/AppLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Send, MessageSquare, CheckCircle } from "lucide-react";

const AppContact = () => {
  const [form, setForm] = useState({ name: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
            <Input
              placeholder="আপনার নাম *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="rounded-xl h-11"
            />
            <Input
              placeholder="ফোন নম্বর"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="rounded-xl h-11"
            />
            <Input
              placeholder="বিষয়"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="rounded-xl h-11"
            />
            <Textarea
              placeholder="আপনার বার্তা লিখুন *"
              rows={5}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              required
              className="rounded-xl"
            />
            <Button type="submit" disabled={loading} className="w-full rounded-xl h-11 gap-2">
              <Send size={16} />
              {loading ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
            </Button>
          </form>
        )}
      </div>
    </AppLayout>
  );
};

export default AppContact;
