import Layout from "@/components/layout/Layout";
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
import { Phone, Mail, Send } from "lucide-react";
import { toBengali } from "@/lib/bengali";
import Sidebar from "@/components/home/Sidebar";

const contactSchema = z.object({
  name: z.string().trim().min(1, "নাম আবশ্যক").max(100),
  email: z.string().trim().email("সঠিক ইমেইল দিন").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1, "বার্তা আবশ্যক").max(2000),
});

const Contact = () => {
  const { data: settings } = useSiteSettings();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
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
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
