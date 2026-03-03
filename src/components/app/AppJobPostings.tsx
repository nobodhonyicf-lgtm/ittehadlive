import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Clock, Building2, Briefcase, BookOpen, MapPin, Banknote, Megaphone, Timer, Phone, Mail, GraduationCap, Users, UserCircle } from "lucide-react";
import { toBengali, toBengaliNumber } from "@/lib/bengali";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      if (days > 0) setRemaining(`${toBengali(days)} দিন ${toBengali(hours)}:${toBengali(String(mins).padStart(2, '0'))}:${toBengali(String(secs).padStart(2, '0'))}`);
      else setRemaining(`${toBengali(hours)}:${toBengali(String(mins).padStart(2, '0'))}:${toBengali(String(secs).padStart(2, '0'))}`);
      setIsExpired(false);
    };
    calc();
    const timer = setInterval(calc, 1000);
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
                to={`/job-apply/${j.id}`}
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
                    <div className="mt-1.5 pt-1.5 border-t border-border">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="flex items-center gap-1 cursor-pointer" onClick={(e) => e.preventDefault()}>
                            {branch.image_url ? (
                              <img src={branch.image_url} alt="" className="w-3.5 h-3.5 rounded object-contain bg-muted" />
                            ) : (
                              <Building2 size={10} className="text-primary" />
                            )}
                            <span className="text-[9px] text-primary font-semibold line-clamp-1">{branch.name}</span>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-2.5 space-y-1.5" side="top">
                          <div className="flex items-center gap-2">
                            {branch.image_url ? (
                              <img src={branch.image_url} alt="" className="w-7 h-7 rounded-lg object-contain bg-muted border" />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 size={14} className="text-primary" /></div>
                            )}
                            <div>
                              <h4 className="text-[11px] font-semibold">{branch.name}</h4>
                              {branch.code && <p className="text-[8px] text-muted-foreground">কোড: {branch.code}</p>}
                            </div>
                          </div>
                          {branch.address && <p className="text-[9px] text-muted-foreground flex items-start gap-1"><MapPin size={8} className="shrink-0 mt-0.5" /> {branch.address}</p>}
                          {branch.head_name && (
                            <div className="flex items-center gap-1.5 bg-muted/50 rounded-md p-1.5">
                              {branch.head_photo_url ? <img src={branch.head_photo_url} alt="" className="w-5 h-5 rounded-full object-cover" /> : <UserCircle size={10} className="text-primary" />}
                              <div><div className="text-[7px] text-muted-foreground">প্রধান</div><div className="text-[9px] font-medium">{branch.head_name}</div></div>
                            </div>
                          )}
                          <div className="flex gap-2 text-[8px] text-muted-foreground">
                            {branch.phone && <span className="flex items-center gap-0.5"><Phone size={7} /> {branch.phone}</span>}
                          </div>
                          <div className="flex gap-2 text-[8px]">
                            {branch.total_teachers > 0 && <span className="flex items-center gap-0.5"><GraduationCap size={7} /> {toBengaliNumber(branch.total_teachers)} শিক্ষক</span>}
                            {branch.total_students > 0 && <span className="flex items-center gap-0.5"><Users size={7} /> {toBengaliNumber(branch.total_students)} ছাত্র</span>}
                          </div>
                        </PopoverContent>
                      </Popover>
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
