import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Clock, Building2, Briefcase, BookOpen, MapPin, Banknote, Megaphone, Timer } from "lucide-react";
import { toBengali } from "@/lib/bengali";
import { useState, useEffect } from "react";

const useCountdown = (deadline: string | null) => {
  const [remaining, setRemaining] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!deadline) return;
    const calc = () => {
      const now = new Date().getTime();
      const end = new Date(deadline + "T23:59:59").getTime();
      const diff = end - now;
      if (diff <= 0) { setIsExpired(true); setRemaining("সময় শেষ"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) setRemaining(`${toBengali(days)} দিন ${toBengali(hours)} ঘণ্টা`);
      else {
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setRemaining(`${toBengali(hours)} ঘণ্টা ${toBengali(mins)} মিনিট`);
      }
      setIsExpired(false);
    };
    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, [deadline]);

  return { remaining, isExpired };
};

const JobCountdown = ({ deadline }: { deadline: string }) => {
  const { remaining, isExpired } = useCountdown(deadline);
  return (
    <div className={`flex items-center gap-1 mt-1.5 text-[9px] font-medium ${isExpired ? "text-muted-foreground" : "text-destructive"}`}>
      <Timer size={9} className={isExpired ? "" : "animate-pulse"} />
      <span>{isExpired ? "সময় শেষ" : `বাকি: ${remaining}`}</span>
    </div>
  );
};

const AppJobPostings = () => {
  const { data: jobs } = useQuery({
    queryKey: ["public_job_postings_slider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: branches } = useQuery({
    queryKey: ["public_branches_for_jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_branches_public");
      if (error) throw error;
      return data;
    },
  });

  if (!jobs?.length) return null;

  const getBranch = (id: string | null) => branches?.find((b: any) => b.id === id);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold flex items-center gap-1.5"><Briefcase size={15} className="text-orange-600" /> নিয়োগ বিজ্ঞপ্তি</h3>
        <Link to="/teachers" className="text-xs text-primary font-medium">সব দেখুন →</Link>
      </div>
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-2.5 pb-1" style={{ minWidth: "max-content" }}>
          {jobs.map((j) => {
            const branch = getBranch(j.branch_id);
            return (
              <Link
                key={j.id}
                to={`/teachers?job=${j.id}`}
                className="block w-44 shrink-0 bg-card border border-primary/20 rounded-xl overflow-hidden active:scale-95 transition-transform"
              >
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-2.5 py-1 flex items-center gap-1">
                  <Megaphone size={9} className="text-primary" />
                  <span className="text-[7px] font-medium text-primary uppercase tracking-wider">নিয়োগ</span>
                </div>
                <div className="p-2.5 pt-1.5">
                  <h4 className="text-[11px] font-semibold line-clamp-2">{j.title}</h4>
                  <div className="flex flex-wrap gap-1 mt-1.5 text-[8px] text-muted-foreground">
                    {j.subject && (
                      <span className="bg-muted px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <BookOpen size={7} /> {j.subject}
                      </span>
                    )}
                  </div>
                  {j.salary_range && (
                    <div className="mt-1 text-[9px] font-semibold text-primary flex items-center gap-0.5">
                      <Banknote size={9} /> {j.salary_range}
                    </div>
                  )}
                  {j.deadline && <JobCountdown deadline={j.deadline} />}
                  {branch && (
                    <div className="mt-1.5 pt-1.5 border-t border-border flex items-center gap-1">
                      {branch.image_url ? (
                        <img src={branch.image_url} alt="" className="w-3.5 h-3.5 rounded object-contain bg-muted" />
                      ) : (
                        <Building2 size={10} className="text-primary" />
                      )}
                      <span className="text-[9px] text-primary font-semibold line-clamp-1">{branch.name}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppJobPostings;
