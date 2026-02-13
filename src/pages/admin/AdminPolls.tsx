import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPolls = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);

  const { data: polls, isLoading } = useQuery({
    queryKey: ["admin_polls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleAddOption = () => setOptions([...options, ""]);
  const handleRemoveOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));
  const handleOptionChange = (i: number, val: string) => {
    const newOpts = [...options];
    newOpts[i] = val;
    setOptions(newOpts);
  };

  const handleCreate = async () => {
    const filtered = options.filter((o) => o.trim());
    if (!question.trim() || filtered.length < 2) {
      toast({ title: "ত্রুটি", description: "প্রশ্ন এবং কমপক্ষে ২টি অপশন দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    // Deactivate existing polls
    await supabase.from("polls").update({ is_active: false }).eq("is_active", true);
    const { error } = await supabase.from("polls").insert({
      question: question.trim(),
      options: filtered,
      is_active: true,
    });
    if (error) {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "সফল", description: "পোল তৈরি হয়েছে" });
      setQuestion("");
      setOptions(["", ""]);
      queryClient.invalidateQueries({ queryKey: ["admin_polls"] });
      queryClient.invalidateQueries({ queryKey: ["active_poll"] });
    }
    setSaving(false);
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    if (!currentActive) {
      await supabase.from("polls").update({ is_active: false }).eq("is_active", true);
    }
    await supabase.from("polls").update({ is_active: !currentActive }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin_polls"] });
    queryClient.invalidateQueries({ queryKey: ["active_poll"] });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("polls").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin_polls"] });
    toast({ title: "মুছে ফেলা হয়েছে" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">পোল ব্যবস্থাপনা</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">নতুন পোল তৈরি</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>প্রশ্ন</Label>
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="আপনার প্রশ্ন লিখুন..." />
          </div>
          <div className="space-y-2">
            <Label>অপশনসমূহ</Label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`অপশন ${i + 1}`}
                />
                {options.length > 2 && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(i)}>
                    <X size={16} />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddOption}>
              <Plus size={14} className="mr-1" /> অপশন যোগ করুন
            </Button>
          </div>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? "তৈরি হচ্ছে..." : "পোল তৈরি করুন"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">সকল পোল</h2>
        {isLoading && <p>লোড হচ্ছে...</p>}
        {polls?.map((poll) => (
          <Card key={poll.id} className={poll.is_active ? "border-primary" : ""}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-medium">{poll.question}</p>
                  <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                    {(poll.options as string[])?.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant={poll.is_active ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggle(poll.id, !!poll.is_active)}
                  >
                    {poll.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(poll.id)}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPolls;
