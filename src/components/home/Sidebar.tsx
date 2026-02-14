import { useState, useEffect } from "react";
import { useLeaderProfiles, useNotices, useActivePoll, usePollVotes, usePrayerTimes } from "@/hooks/useData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, BarChart3, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toBengali } from "@/lib/bengali";

const getVoterId = () => {
  let id = localStorage.getItem("poll_voter_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("poll_voter_id", id);
  }
  return id;
};

const PollSection = () => {
  const { data: poll } = useActivePoll();
  const { data: votes } = usePollVotes(poll?.id);
  const queryClient = useQueryClient();
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const voterId = getVoterId();
  const options = (poll?.options as string[]) || [];

  useEffect(() => {
    if (!poll?.id) return;
    supabase
      .from("poll_votes")
      .select("option_index")
      .eq("poll_id", poll.id)
      .eq("voter_id", voterId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setHasVoted(true);
          setSelectedOption(data.option_index);
        }
      });
  }, [poll?.id, voterId]);

  const handleVote = async (index: number) => {
    if (!poll || hasVoted || submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from("poll_votes").insert({
      poll_id: poll.id,
      option_index: index,
      voter_id: voterId,
    });
    if (!error) {
      setHasVoted(true);
      setSelectedOption(index);
      queryClient.invalidateQueries({ queryKey: ["poll_votes", poll.id] });
    }
    setSubmitting(false);
  };

  if (!poll) return null;

  const totalVotes = votes?.length || 0;
  const voteCounts = options.map(
    (_, i) => votes?.filter((v) => v.option_index === i).length || 0
  );

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-primary text-base bg-primary/10 rounded py-2 text-center flex items-center justify-center gap-2">
          <BarChart3 size={16} />
          মতামত জরিপ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold mb-3">{poll.question}</p>
        <div className="space-y-2">
          {options.map((option, i) => {
            const pct = totalVotes > 0 ? Math.round((voteCounts[i] / totalVotes) * 100) : 0;
            return (
              <button
                key={i}
                onClick={() => handleVote(i)}
                disabled={hasVoted || submitting}
                className={`w-full text-left rounded border text-sm transition-all relative overflow-hidden
                  ${selectedOption === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                  ${hasVoted ? "cursor-default" : "cursor-pointer"}
                `}
              >
                {hasVoted && (
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/10 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                )}
                <div className="relative px-3 py-2 flex justify-between items-center">
                  <span>{option}</span>
                  {hasVoted && (
                    <span className="text-xs text-muted-foreground font-medium">{toBengali(pct)}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {hasVoted && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            মোট ভোট: {toBengali(totalVotes)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const Sidebar = () => {
  const { data: leaders } = useLeaderProfiles();
  const { data: notices } = useNotices();

  return (
    <div className="space-y-4">
      {/* Leader profiles */}
      {leaders?.map((leader) => (
        <Card key={leader.id} className="border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary text-center text-base bg-primary/10 rounded py-2">
              {leader.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center overflow-hidden">
              {leader.image_url ? (
                <img src={leader.image_url} alt={leader.name} className="w-full h-full object-cover" />
              ) : (
                <User className="text-muted-foreground" size={32} />
              )}
            </div>
            <h3 className="font-bold text-sm">{leader.name}</h3>
            {leader.bio && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-6 text-justify">
                {leader.bio}
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Notices */}
      <Card className="border-t-4 border-t-accent">
        <CardHeader className="pb-2">
          <CardTitle className="text-accent text-base bg-accent/10 rounded py-2 text-center flex items-center justify-center gap-2">
            <Bell size={16} />
            নোটিশ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {notices?.slice(0, 8).map((notice) => (
              <li key={notice.id} className="border-b border-border pb-2 last:border-0">
                <Link
                  to={`/notice/${notice.id}`}
                  className="text-sm hover:text-primary transition-colors flex items-start gap-2"
                >
                  <span className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                    ৪
                  </span>
                  <span className="line-clamp-2">{notice.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Prayer Times */}
      <PrayerTimesSection />

      {/* Poll */}
      <PollSection />
    </div>
  );
};

const PrayerTimesSection = () => {
  const { data: prayerTimes } = usePrayerTimes();

  if (!prayerTimes?.length) return null;

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-primary text-base bg-primary/10 rounded py-2 text-center flex items-center justify-center gap-2">
          <Clock size={16} />
          নামাজের সময়সূচি
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {prayerTimes.map((pt) => (
            <div key={pt.id} className="flex justify-between items-center border-b border-border pb-1.5 last:border-0 text-sm">
              <span className="font-medium">{pt.name}</span>
              <span className="text-primary font-semibold">{pt.time_text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Sidebar;
