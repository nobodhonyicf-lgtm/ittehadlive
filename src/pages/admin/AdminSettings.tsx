import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

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
  };

  if (isLoading) return <div className="text-center py-8">লোড হচ্ছে...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">সাইট সেটিংস</h1>
      <div className="space-y-4">
        {settings?.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <Label className="mb-2 block font-bold">{keyLabels[s.key] || s.key}</Label>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
