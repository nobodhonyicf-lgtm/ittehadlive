import { useState, useEffect } from "react";
import { useLeaderProfiles, useNotices, useActivePoll, usePollVotes, usePrayerTimes } from "@/hooks/useData";
import { User, Bell, ChevronRight, Clock, Sunrise, Sun, CloudSun, Sunset, Moon, Coffee, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toBengali } from "@/lib/bengali";
import SectionHeader from "./SectionHeader";

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
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <SectionHeader title="মতামত জরিপ" />
      <div className="px-4 pb-4">
        <p className="text-sm font-semibold mb-3">{poll.question}</p>
        <div className="space-y-2">
          {options.map((option, i) => {
            const pct = totalVotes > 0 ? Math.round((voteCounts[i] / totalVotes) * 100) : 0;
            return (
              <button
                key={i}
                onClick={() => handleVote(i)}
                disabled={hasVoted || submitting}
                className={`w-full text-left rounded-lg border text-sm transition-all relative overflow-hidden
                  ${selectedOption === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                  ${hasVoted ? "cursor-default" : "cursor-pointer"}
                `}
              >
                {hasVoted && (
                  <div className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500" style={{ width: `${pct}%` }} />
                )}
                <div className="relative px-3 py-2.5 flex justify-between items-center">
                  <span>{option}</span>
                  {hasVoted && (
                    <span className="text-xs text-muted-foreground font-semibold">{toBengali(pct)}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {hasVoted && (
          <p className="text-xs text-muted-foreground mt-2 text-center">মোট ভোট: {toBengali(totalVotes)}</p>
        )}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { data: leaders } = useLeaderProfiles();
  const { data: notices } = useNotices();

  return (
    <div className="space-y-5">
      {/* Leader profiles - centered, no bio */}
      {leaders?.map((leader) => (
        <Link
          key={leader.id}
          to={`/leader/${leader.id}`}
          className="block bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="px-4 py-5 text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden ring-2 ring-primary/15 ring-offset-2 ring-offset-background group-hover:ring-primary/30 transition-colors">
              {leader.image_url ? (
                <img src={leader.image_url} alt={leader.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="text-muted-foreground" size={28} />
                </div>
              )}
            </div>
            <h3 className="font-bold text-sm text-foreground">{leader.name}</h3>
            <p className="text-xs text-primary font-medium mt-1">{leader.title}</p>
          </div>
        </Link>
      ))}

      {/* Notices */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="নোটিশ" linkUrl="/posts" />
        <div className="divide-y divide-border">
          {notices?.slice(0, 8).map((notice, i) => (
            <Link
              key={notice.id}
              to={`/notice/${notice.id}`}
              className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
            >
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-destructive/15 to-destructive/5 text-destructive text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                {toBengali(i + 1)}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-sm line-clamp-2 group-hover:text-primary transition-colors font-medium">{notice.title}</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">{new Date(notice.created_at).toLocaleDateString("bn-BD")}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Prayer Times */}
      <PrayerTimesSection />

      {/* Poll */}
      <PollSection />
    </div>
  );
};

const parseTimeToMinutes = (timeText: string): number | null => {
  const bengaliToEnglish = (s: string) =>
    s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
  const cleaned = bengaliToEnglish(timeText.trim());
  const match = cleaned.match(/(\d{1,2})[:\.](\d{2})/);
  if (!match) return null;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
};

const normalizePrayerMinutes = (prayerTimes: { time_text: string }[]): number[] => {
  const rawMinutes = prayerTimes.map(pt => parseTimeToMinutes(pt.time_text));
  const result: number[] = [];
  for (let i = 0; i < rawMinutes.length; i++) {
    let mins = rawMinutes[i];
    if (mins === null) { result.push(-1); continue; }
    if (i > 0 && result[i - 1] >= 0 && mins < result[i - 1]) {
      mins += 720;
    }
    result.push(mins);
  }
  return result;
};

// Prayer icons mapped to Lucide-compatible labels
const prayerIconMap: Record<string, string> = {
  "ফজর": "fajr", "যোহর": "dhuhr", "আসর": "asr", "মাগরিব": "maghrib", "ইশা": "isha",
  "সূর্যোদয়": "sunrise", "সেহরি": "sehri", "ইফতার": "iftar",
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
  const normalizedMins = normalizePrayerMinutes(prayerTimes);

  let nextPrayerIndex = -1;
  for (let i = 0; i < prayerTimes.length; i++) {
    if (normalizedMins[i] >= 0 && normalizedMins[i] > currentMinutes) {
      nextPrayerIndex = i;
      break;
    }
  }

  const getCountdown = (index: number): string | null => {
    const mins = normalizedMins[index];
    if (mins < 0) return null;
    const diff = mins - currentMinutes;
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h > 0) return `${toBengali(h)} ঘণ্টা ${toBengali(m)} মিনিট`;
    return `${toBengali(m)} মিনিট`;
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="text-center py-4 px-4">
          <p className="text-xs opacity-70 mb-1 font-serif">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h3 className="font-bold text-base flex items-center justify-center gap-2">
            <Clock size={16} />
            নামাজের সময়সূচি
          </h3>
          {nextPrayerIndex >= 0 && (
            <p className="text-[10px] opacity-80 mt-1">
              পরবর্তী: {prayerTimes[nextPrayerIndex].name}
            </p>
          )}
        </div>
      </div>

      {/* Prayer list */}
      <div className="divide-y divide-border">
        {prayerTimes.map((pt, i) => {
          const isNext = i === nextPrayerIndex;
          const countdown = isNext ? getCountdown(i) : null;
          const iconKey = prayerIconMap[pt.name] || "default";
          const PrayerIcon = {
            fajr: Sunrise, dhuhr: Sun, asr: CloudSun, maghrib: Sunset, isha: Moon,
            sunrise: Sunrise, sehri: Coffee, iftar: Timer,
          }[iconKey] || Clock;
          return (
            <div
              key={pt.id}
              className={`flex items-center justify-between px-4 py-3 text-sm transition-all ${isNext ? "bg-primary/5" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <PrayerIcon size={16} className={isNext ? "text-primary" : "text-muted-foreground"} />
                <span className={`font-medium ${isNext ? "text-primary font-bold" : ""}`}>{pt.name}</span>
                {isNext && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </div>
              <div className="text-right">
                <span className={`font-semibold text-[15px] ${isNext ? "text-primary" : "text-foreground"}`}>{pt.time_text}</span>
                {countdown && (
                  <p className="text-[10px] text-primary mt-0.5 font-medium">আরও {countdown}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-muted/50 text-center py-2 text-[10px] text-muted-foreground font-medium">
        সময়মতো নামাজ আদায় করুন
      </div>
    </div>
  );
};

export default Sidebar;
