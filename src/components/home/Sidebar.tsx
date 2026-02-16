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
              <p className="text-xs text-muted-foreground mt-2 line-clamp-4 text-justify">
                {leader.bio}
              </p>
            )}
            <Link
              to={`/leader/${leader.id}`}
              className="inline-block mt-3 text-primary hover:underline font-bold text-sm"
            >
              বিস্তারিত →
            </Link>
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

const parseTimeToMinutes = (timeText: string): number | null => {
  // Try parsing times like "৫:৩০", "5:30", "১২:১৫" etc.
  const bengaliToEnglish = (s: string) =>
    s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
  const cleaned = bengaliToEnglish(timeText.trim());
  const match = cleaned.match(/(\d{1,2})[:\.](\d{2})/);
  if (!match) return null;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
};

const PrayerTimesSection = () => {
  const { data: prayerTimes } = usePrayerTimes();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!prayerTimes?.length) return null;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find next prayer
  let nextPrayerIndex = -1;
  for (let i = 0; i < prayerTimes.length; i++) {
    const mins = parseTimeToMinutes(prayerTimes[i].time_text);
    if (mins !== null && mins > currentMinutes) {
      nextPrayerIndex = i;
      break;
    }
  }

  const getCountdown = (timeText: string): string | null => {
    const mins = parseTimeToMinutes(timeText);
    if (mins === null) return null;
    const diff = mins - currentMinutes;
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h > 0) return `${toBengali(h)} ঘণ্টা ${toBengali(m)} মিনিট`;
    return `${toBengali(m)} মিনিট`;
  };

  return (
    <Card className="border-t-4 border-t-emerald-600 overflow-hidden">
      {/* Islamic header */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white py-3 px-4">
        <div className="text-center">
          <p className="text-xs opacity-80 mb-0.5">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h3 className="font-bold text-sm flex items-center justify-center gap-2">
            <Clock size={14} />
            নামাজের সময়সূচি
          </h3>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {prayerTimes.map((pt, i) => {
            const isNext = i === nextPrayerIndex;
            const countdown = isNext ? getCountdown(pt.time_text) : null;
            return (
              <div
                key={pt.id}
                className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                  ${isNext ? "bg-emerald-50 dark:bg-emerald-950/30" : ""}
                `}
              >
                <div className="flex items-center gap-2">
                  {isNext && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  <span className={`font-medium ${isNext ? "text-emerald-700 dark:text-emerald-400" : ""}`}>
                    {pt.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${isNext ? "text-emerald-700 dark:text-emerald-400" : "text-primary"}`}>
                    {pt.time_text}
                  </span>
                  {countdown && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      আরও {countdown} বাকী
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Decorative footer */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white text-center py-1.5 text-[10px] opacity-90">
          ☪ সময়মতো নামাজ আদায় করুন ☪
        </div>
      </CardContent>
    </Card>
  );
};

export default Sidebar;
