import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { BarChart3 } from "lucide-react";

const AppPollWidget = () => {
  const [voted, setVoted] = useState<string | null>(null);

  const { data: poll } = useQuery({
    queryKey: ["active_poll_app"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: votes, refetch: refetchVotes } = useQuery({
    queryKey: ["poll_votes_app", poll?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("poll_votes")
        .select("option_index")
        .eq("poll_id", poll!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!poll?.id,
  });

  if (!poll) return null;

  const options = (poll.options as string[]) || [];
  const voterId = localStorage.getItem("poll_voter_id") || crypto.randomUUID();
  if (!localStorage.getItem("poll_voter_id")) {
    localStorage.setItem("poll_voter_id", voterId);
  }

  const alreadyVoted = localStorage.getItem(`poll_voted_${poll.id}`);
  const showResults = !!alreadyVoted || !!voted;

  const voteCounts = options.map((_, i) =>
    (votes || []).filter((v) => v.option_index === i).length
  );
  const totalVotes = voteCounts.reduce((a, b) => a + b, 0);

  const handleVote = async (index: number) => {
    try {
      const { error } = await supabase.from("poll_votes").insert({
        poll_id: poll.id,
        option_index: index,
        voter_id: voterId,
      });
      if (error) throw error;
      localStorage.setItem(`poll_voted_${poll.id}`, "true");
      setVoted(poll.id);
      refetchVotes();
      toast.success("ভোট দেওয়া হয়েছে!");
    } catch {
      toast.error("ভোট দিতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
      <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <BarChart3 size={16} className="text-primary" />
        মতামত জরিপ
      </h2>
      <p className="text-sm font-semibold text-foreground mb-3">{poll.question}</p>
      <div className="space-y-2">
        {options.map((option, i) => {
          const pct = totalVotes > 0 ? Math.round((voteCounts[i] / totalVotes) * 100) : 0;
          return (
            <div key={i}>
              {showResults ? (
                <div className="relative bg-muted rounded-lg overflow-hidden h-9 flex items-center">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                  <span className="relative z-10 text-xs font-medium px-3 text-foreground truncate flex-1">
                    {option}
                  </span>
                  <span className="relative z-10 text-xs font-bold px-3 text-primary">
                    {pct}%
                  </span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-9"
                  onClick={() => handleVote(i)}
                >
                  {option}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {showResults && (
        <p className="text-[10px] text-muted-foreground mt-2 text-right">
          মোট ভোট: {totalVotes}
        </p>
      )}
    </div>
  );
};

export default AppPollWidget;
