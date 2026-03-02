import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toBengaliNumber } from "@/lib/bengali";
import { useSiteSettings } from "@/hooks/useData";
import { Megaphone, Monitor, Sidebar, FileText, LayoutTemplate, Phone, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const slotIcons: Record<string, any> = {
  header: Monitor,
  sidebar: Sidebar,
  in_post: FileText,
  footer: LayoutTemplate,
};

const Advertise = () => {
  const { data: settings } = useSiteSettings();
  const { data: pricing } = useQuery({
    queryKey: ["ad_pricing"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("ad_pricing").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  return (
    <Layout>
      <SEOHead title="বিজ্ঞাপন দিন" description="আমাদের ওয়েবসাইট ও অ্যাপে বিজ্ঞাপন দিন" />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-4 py-2 rounded-full mb-4">
            <Megaphone size={16} /> বিজ্ঞাপন সেবা
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">আমাদের প্ল্যাটফর্মে বিজ্ঞাপন দিন</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            হাজারো শিক্ষাপ্রতিষ্ঠান, শিক্ষক ও অভিভাবকদের কাছে আপনার প্রতিষ্ঠান বা সেবার প্রচার করুন
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-4 md:grid-cols-2 mb-10">
          {pricing?.map((slot: any) => {
            const Icon = slotIcons[slot.slot_key] || Monitor;
            return (
              <Card key={slot.id} className="hover:shadow-lg transition-shadow border-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{slot.slot_name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{slot.description}</p>
                      {slot.dimensions && (
                        <Badge variant="outline" className="mt-2 text-[10px]">সাইজ: {slot.dimensions}</Badge>
                      )}
                      <div className="flex gap-4 mt-4">
                        <div className="bg-muted/50 rounded-lg p-3 flex-1 text-center">
                          <div className="text-xs text-muted-foreground">মাসিক</div>
                          <div className="text-lg font-bold text-primary">৳{toBengaliNumber(slot.price_monthly)}</div>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-3 flex-1 text-center border border-primary/20">
                          <div className="text-xs text-muted-foreground">বার্ষিক</div>
                          <div className="text-lg font-bold text-primary">৳{toBengaliNumber(slot.price_yearly)}</div>
                          <div className="text-[10px] text-green-600 font-medium">সাশ্রয়ী!</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-3">বিজ্ঞাপনের জন্য যোগাযোগ করুন</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              বিজ্ঞাপন দিতে বা বিস্তারিত জানতে নিচের যেকোনো মাধ্যমে যোগাযোগ করুন
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {settings?.contact_phone && (
                <a href={`tel:${settings.contact_phone}`}>
                  <Button variant="outline" className="gap-2">
                    <Phone size={16} /> {settings.contact_phone}
                  </Button>
                </a>
              )}
              {settings?.contact_email && (
                <a href={`mailto:${settings.contact_email}?subject=বিজ্ঞাপন সংক্রান্ত`}>
                  <Button variant="outline" className="gap-2">
                    <Mail size={16} /> ইমেইল করুন
                  </Button>
                </a>
              )}
              <Link to="/contact">
                <Button className="gap-2">
                  <MessageSquare size={16} /> যোগাযোগ ফর্ম
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Advertise;
