import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X, Eye, EyeOff, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toBengali } from "@/lib/bengali";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

const AdminPolls = () => {
  const { toast } = useToast();
  const { canEdit, canDelete } = useSectionPermissions();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);
  const [expandedPoll, setExpandedPoll] = useState<string | null>(null);

  const { data: polls, isLoading } = useQuery({
    queryKey: ["admin_polls"],
    queryFn: async () => {
      const { data, error } = await supabase.from("polls").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: allVotes } = useQuery({
    queryKey: ["admin_all_poll_votes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("poll_votes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleAddOption = () => setOptions([...options, ""]);
  const handleRemoveOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));
  const handleOptionChange = (i: number, val: string) => { const newOpts = [...options]; newOpts[i] = val; setOptions(newOpts); };

  const handleCreate = async () => {
    const filtered = options.filter((o) => o.trim());
    if (!question.trim() || filtered.length < 2) {
      toast({ title: "ত্রুটি", description: "প্রশ্ন এবং কমপক্ষে ২টি অপশন দিন", variant: "destructive" });
      return;
    }
    setSaving(true);
    await supabase.from("polls").update({ is_active: false }).eq("is_active", true);
    const { error } = await supabase.from("polls").insert({ question: question.trim(), options: filtered, is_active: true });
    if (error) { toast({ title: "ত্রুটি", description: error.message, variant: "destructive" }); }
    else { toast({ title: "সফল", description: "পোল তৈরি হয়েছে" }); setQuestion(""); setOptions(["", ""]); }
    setSaving(false);
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    if (!currentActive) await supabase.from("polls").update({ is_active: false }).eq("is_active", true);
    await supabase.from("polls").update({ is_active: !currentActive }).eq("id", id);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("polls").delete().eq("id", id);
    toast({ title: "মুছে ফেলা হয়েছে" });
  };

  const getVotesForPoll = (pollId: string) => allVotes?.filter((v) => v.poll_id === pollId) || [];

  return (
    <AdminPageWrapper title="পোল ব্যবস্থাপনা" icon={BarChart3}>
      <Card>
        <CardHeader><CardTitle className="text-base">নতুন পোল তৈরি</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>প্রশ্ন</Label><Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="আপনার প্রশ্ন লিখুন..." /></div>
          <div className="space-y-2">
            <Label>অপশনসমূহ</Label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} placeholder={`অপশন ${toBengali(i + 1)}`} />
                {options.length > 2 && <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(i)}><X size={16} /></Button>}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddOption}><Plus size={14} className="mr-1" /> অপশন যোগ করুন</Button>
          </div>
          {canEdit && <Button onClick={handleCreate} disabled={saving}>{saving ? "তৈরি হচ্ছে..." : "পোল তৈরি করুন"}</Button>}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">সকল পোল</h2>
        {isLoading && <p className="text-muted-foreground">লোড হচ্ছে...</p>}
        {polls?.map((poll) => {
          const pollVotes = getVotesForPoll(poll.id);
          const pollOptions = (poll.options as string[]) || [];
          const totalVotes = pollVotes.length;
          const isExpanded = expandedPoll === poll.id;

          return (
            <Card key={poll.id} className={poll.is_active ? "border-primary" : ""}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium">{poll.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">মোট ভোট: {toBengali(totalVotes)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setExpandedPoll(isExpanded ? null : poll.id)}>{isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
                    <Button variant={poll.is_active ? "default" : "outline"} size="sm" onClick={() => handleToggle(poll.id, !!poll.is_active)}>{poll.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</Button>
                    {canDelete && <Button variant="ghost" size="icon" onClick={() => handleDelete(poll.id)}><Trash2 size={16} className="text-destructive" /></Button>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {pollOptions.map((opt, i) => {
                    const count = pollVotes.filter((v) => v.option_index === i).length;
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    return (
                      <div key={i} className="relative overflow-hidden rounded border text-sm">
                        <div className="absolute inset-y-0 left-0 bg-primary/10" style={{ width: `${pct}%` }} />
                        <div className="relative px-3 py-1.5 flex justify-between items-center">
                          <span>{opt}</span>
                          <span className="text-xs font-medium text-muted-foreground">{toBengali(count)} ({toBengali(pct)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {isExpanded && pollVotes.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold mb-2">ভোটদানকারীর তথ্য</h4>
                    <div className="max-h-60 overflow-auto border rounded">
                      <Table>
                        <TableHeader><TableRow><TableHead className="text-xs">ক্রম</TableHead><TableHead className="text-xs">ভোটার আইডি</TableHead><TableHead className="text-xs">নির্বাচিত অপশন</TableHead><TableHead className="text-xs">সময়</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {pollVotes.map((vote, i) => (
                            <TableRow key={vote.id}>
                              <TableCell className="text-xs">{toBengali(i + 1)}</TableCell>
                              <TableCell className="text-xs font-mono">{vote.voter_id?.slice(0, 8)}...</TableCell>
                              <TableCell className="text-xs">{pollOptions[vote.option_index] || `অপশন ${toBengali(vote.option_index + 1)}`}</TableCell>
                              <TableCell className="text-xs">{new Date(vote.created_at).toLocaleDateString("bn-BD")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AdminPageWrapper>
  );
};

export default AdminPolls;
