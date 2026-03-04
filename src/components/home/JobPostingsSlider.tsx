import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Clock, Building2, Briefcase, BookOpen, MapPin, Banknote, Megaphone, Timer, Phone, Mail, GraduationCap, Users, UserCircle } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { toBengaliNumber } from "@/lib/bengali";
import SectionHeader from "./SectionHeader";
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
    <div className={`flex items-center gap-1 mt-2 text-[10px] font-medium ${isExpired ? "text-muted-foreground line-through" : "text-destructive"}`}>
      <Timer size={10} className={isExpired ? "" : "animate-pulse"} />
      <span>{isExpired ? "সময় শেষ" : `বাকি: ${remaining}`}</span>
    </div>
  );
};

const JobPostingsSlider = () => {
  const { data: jobs } = useQuery({
    queryKey: ["public_job_postings_slider"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("is_active", true)
        .or(`deadline.is.null,deadline.gte.${today}`)
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
    <div className="relative rounded-2xl overflow-hidden">
      {/* Eye-catching gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-red-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-red-950/30 rounded-2xl" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      <div className="relative p-4 pb-3">
      <SectionHeader title="নিয়োগ বিজ্ঞপ্তি" linkUrl="/teachers" />
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="flex gap-3 pb-2" style={{ minWidth: "max-content" }}>
          {jobs.map((j) => {
            const branch = getBranch(j.branch_id);
            return (
              <Link
                key={j.id}
                to={`/job-apply/${j.id}`}
                className="block w-52 shrink-0 bg-card border border-primary/20 rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all group"
              >
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-1.5 flex items-center gap-1">
                  <Megaphone size={10} className="text-primary" />
                  <span className="text-[8px] font-medium text-primary uppercase tracking-wider">নিয়োগ</span>
                </div>
                <div className="p-3 pt-2">
                  <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {j.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-2 text-[9px] text-muted-foreground">
                    {j.subject && (
                      <span className="bg-muted px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <BookOpen size={8} /> {j.subject}
                      </span>
                    )}
                    {j.location && (
                      <span className="bg-muted px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <MapPin size={8} /> {j.location}
                      </span>
                    )}
                  </div>
                  {j.salary_range && (
                    <div className="mt-1.5 text-[10px] font-semibold text-primary flex items-center gap-0.5">
                      <Banknote size={10} /> {j.salary_range}
                    </div>
                  )}
                  {j.deadline && <JobCountdown deadline={j.deadline} />}
                  {branch && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <HoverCard openDelay={200}>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center gap-1.5 cursor-pointer" onClick={(e) => e.preventDefault()}>
                            {branch.image_url ? (
                              <img src={branch.image_url} alt="" className="w-4 h-4 rounded object-contain bg-muted" />
                            ) : (
                              <Building2 size={11} className="text-primary" />
                            )}
                            <span className="text-[10px] text-primary font-semibold line-clamp-1">{branch.name}</span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64 p-3 space-y-2" side="top">
                          <div className="flex items-center gap-2">
                            {branch.image_url ? (
                              <img src={branch.image_url} alt="" className="w-8 h-8 rounded-lg object-contain bg-muted border" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 size={16} className="text-primary" /></div>
                            )}
                            <div>
                              <h4 className="text-xs font-semibold">{branch.name}</h4>
                              {branch.code && <p className="text-[9px] text-muted-foreground">কোড: {branch.code}</p>}
                            </div>
                          </div>
                          {branch.address && <p className="text-[10px] text-muted-foreground flex items-start gap-1"><MapPin size={9} className="shrink-0 mt-0.5" /> {branch.address}</p>}
                          {branch.head_name && (
                            <div className="flex items-center gap-2 bg-muted/50 rounded-md p-1.5">
                              {branch.head_photo_url ? <img src={branch.head_photo_url} alt="" className="w-5 h-5 rounded-full object-cover" /> : <UserCircle size={12} className="text-primary" />}
                              <div><div className="text-[8px] text-muted-foreground">প্রধান</div><div className="text-[10px] font-medium">{branch.head_name}</div></div>
                            </div>
                          )}
                          <div className="flex gap-3 text-[9px] text-muted-foreground">
                            {branch.phone && <span className="flex items-center gap-0.5"><Phone size={8} /> {branch.phone}</span>}
                            {branch.email && <span className="flex items-center gap-0.5"><Mail size={8} /> {branch.email}</span>}
                          </div>
                          <div className="flex gap-3 text-[9px]">
                            {branch.total_teachers > 0 && <span className="flex items-center gap-0.5"><GraduationCap size={8} /> {toBengaliNumber(branch.total_teachers)} শিক্ষক</span>}
                            {branch.total_students > 0 && <span className="flex items-center gap-0.5"><Users size={8} /> {toBengaliNumber(branch.total_students)} ছাত্র</span>}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
};

export default JobPostingsSlider;
