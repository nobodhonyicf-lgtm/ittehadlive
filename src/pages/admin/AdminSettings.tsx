import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Settings, Palette, Image } from "lucide-react";

const AdminSettings = () => {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").order("key");
      if (error) throw error;
      return data;
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});

  const updateMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      const { error } = await supabase.from("site_settings").update({ value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_settings"] });
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("সংরক্ষিত");
    },
  });

  const keyLabels: Record<string, string> = {
    site_name: "সাইটের নাম",
    site_description: "সাইটের বিবরণ",
    about_text: "সম্পর্কে লেখা",
    contact_phone: "ফোন নম্বর",
    contact_email: "ইমেইল",
    copyright_text: "কপিরাইট লেখা",
    update_ticker: "আপডেট টিকার",
    logo_url: "লোগো URL",
    favicon_url: "ফেভিকন URL",
    primary_color: "প্রাইমারি কালার",
  };

  const keyIcons: Record<string, any> = {
    logo_url: Image,
    favicon_url: Image,
    primary_color: Palette,
  };

  const brandingKeys = ["logo_url", "favicon_url", "primary_color"];

  if (isLoading) return <div className="text-center py-8">লোড হচ্ছে...</div>;

  const brandingSettings = settings?.filter(s => brandingKeys.includes(s.key));
  const generalSettings = settings?.filter(s => !brandingKeys.includes(s.key));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2"><Settings size={22} /> সাইট সেটিংস</h1>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Palette size={18} /> ব্র্যান্ডিং</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {brandingSettings?.map((s) => (
            <div key={s.id}>
              <Label className="mb-1 block font-semibold">{keyLabels[s.key] || s.key}</Label>
              <div className="flex gap-2">
                <Input
                  type={s.key === "primary_color" ? "color" : "text"}
                  defaultValue={s.value || ""}
                  onChange={(e) => setValues({ ...values, [s.id]: e.target.value })}
                  className={s.key === "primary_color" ? "w-20 h-10 p-1" : ""}
                />
                <Button
                  onClick={() => updateMutation.mutate({ id: s.id, value: values[s.id] ?? s.value ?? "" })}
                  disabled={updateMutation.isPending}
                  size="sm"
                >
                  সংরক্ষণ
                </Button>
              </div>
              {s.key === "logo_url" && s.value && (
                <img src={s.value} alt="Logo preview" className="h-12 mt-2 rounded" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">সাধারণ সেটিংস</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {generalSettings?.map((s) => (
            <div key={s.id}>
              <Label className="mb-1 block font-semibold">{keyLabels[s.key] || s.key}</Label>
              <div className="flex gap-2">
                <Input
                  defaultValue={s.value || ""}
                  onChange={(e) => setValues({ ...values, [s.id]: e.target.value })}
                />
                <Button
                  onClick={() => updateMutation.mutate({ id: s.id, value: values[s.id] ?? s.value ?? "" })}
                  disabled={updateMutation.isPending}
                  size="sm"
                >
                  সংরক্ষণ
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
