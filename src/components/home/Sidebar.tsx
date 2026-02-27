import { useState, useEffect } from "react";
import { useLeaderProfiles, useNotices, useActivePoll, usePollVotes, usePrayerTimes } from "@/hooks/useData";
import { User, Bell, BarChart3, Clock } from "lucide-react";
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
    <div className="bg-card border border-border rounded-lg overflow-hidden">
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
                className={`w-full text-left rounded border text-sm transition-all relative overflow-hidden
                  ${selectedOption === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                  ${hasVoted ? "cursor-default" : "cursor-pointer"}
                `}
              >
                {hasVoted && (
                  <div className="absolute inset-y-0 left-0 bg-primary/10 transition-all" style={{ width: `${pct}%` }} />
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
    <div className="space-y-4">
      {/* Leader profiles */}
      {leaders?.map((leader) => (
        <div key={leader.id} className="bg-card border border-border rounded-lg overflow-hidden">
          <SectionHeader title={leader.title} linkUrl={`/leader/${leader.id}`} />
          <div className="px-4 pb-4 text-center">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center overflow-hidden">
              {leader.image_url ? (
                <img src={leader.image_url} alt={leader.name} className="w-full h-full object-cover" />
              ) : (
                <User className="text-muted-foreground" size={32} />
              )}
            </div>
            <h3 className="font-bold text-sm">{leader.name}</h3>
            {leader.bio && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-4 text-justify">{leader.bio}</p>
            )}
            <Link to={`/leader/${leader.id}`} className="inline-block mt-3 text-primary hover:underline font-bold text-sm">
              বিস্তারিত →
            </Link>
          </div>
        </div>
      ))}

      {/* Notices */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <SectionHeader title="নোটিশ" linkUrl="/posts" />
        <div className="divide-y divide-border">
          {notices?.slice(0, 8).map((notice) => (
            <Link
              key={notice.id}
              to={`/notice/${notice.id}`}
              className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-muted/50 transition-colors group"
            >
              <span className="w-6 h-6 rounded-md bg-destructive/15 text-destructive flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                <Bell size={13} />
              </span>
              <span className="text-sm line-clamp-2 group-hover:text-primary transition-colors">{notice.title}</span>
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
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Mosque dome header */}
      <div className="relative bg-gradient-to-b from-emerald-800 to-emerald-700 text-white overflow-hidden">
        {/* Mosque silhouette SVG */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
            {/* Central dome */}
            <ellipse cx="200" cy="80" rx="60" ry="50" fill="white" />
            <rect x="195" y="20" width="10" height="30" fill="white" />
            <ellipse cx="200" cy="20" rx="6" ry="8" fill="white" />
            {/* Left minaret */}
            <rect x="80" y="30" width="12" height="70" fill="white" />
            <ellipse cx="86" cy="30" rx="8" ry="10" fill="white" />
            <rect x="83" y="15" width="6" height="18" fill="white" />
            <ellipse cx="86" cy="15" rx="4" ry="5" fill="white" />
            {/* Right minaret */}
            <rect x="308" y="30" width="12" height="70" fill="white" />
            <ellipse cx="314" cy="30" rx="8" ry="10" fill="white" />
            <rect x="311" y="15" width="6" height="18" fill="white" />
            <ellipse cx="314" cy="15" rx="4" ry="5" fill="white" />
            {/* Base */}
            <rect x="60" y="95" width="280" height="25" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 text-center py-4 px-4">
          <p className="text-sm opacity-80 mb-1 font-serif">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h3 className="font-bold text-base flex items-center justify-center gap-2">
            <span className="text-lg">🕌</span>
            নামাজের সময়সূচি
          </h3>
        </div>
      </div>
      <div className="divide-y divide-border">
        {prayerTimes.map((pt, i) => {
          const isNext = i === nextPrayerIndex;
          const countdown = isNext ? getCountdown(i) : null;
          return (
            <div
              key={pt.id}
              className={`flex items-center justify-between px-4 py-3 text-sm transition-all ${isNext ? "bg-emerald-50 dark:bg-emerald-950/30 border-l-[3px] border-l-emerald-500" : "border-l-[3px] border-l-transparent"}`}
            >
              <div className="flex items-center gap-2">
                {isNext && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-400" />}
                <span className={`font-medium ${isNext ? "text-emerald-700 dark:text-emerald-400 font-bold" : ""}`}>{pt.name}</span>
              </div>
              <div className="text-right">
                <span className={`font-semibold text-[15px] ${isNext ? "text-emerald-700 dark:text-emerald-400" : "text-primary"}`}>{pt.time_text}</span>
                {countdown && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">⏳ আরও {countdown} বাকী</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white text-center py-2 text-xs font-medium tracking-wide">
        ☪ সময়মতো নামাজ আদায় করুন ☪
      </div>
    </div>
  );
};

export default Sidebar;
