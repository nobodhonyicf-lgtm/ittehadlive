import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { BadgeCheck, BookOpen, MapPin, Star, Briefcase, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SectionHeader from "./SectionHeader";
import { toBengaliNumber } from "@/lib/bengali";

const getExperienceBadge = (years: number) => {
  if (years >= 10) return { label: "সিনিয়র", color: "bg-amber-500/10 text-amber-700 border-amber-200" };
  if (years >= 5) return { label: "অভিজ্ঞ", color: "bg-blue-500/10 text-blue-700 border-blue-200" };
  if (years >= 2) return { label: "মধ্যম", color: "bg-green-500/10 text-green-700 border-green-200" };
  return null;
};

const TeacherSlider = () => {
  const { data: teachers } = useQuery({
    queryKey: ["public_teachers_slider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  if (!teachers?.length) return null;

  return (
    <div>
      <SectionHeader title="আপনার মাদরাসার জন্য শিক্ষক খুঁজুন" linkUrl="/teachers" />
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="flex gap-3 pb-2" style={{ minWidth: "max-content" }}>
          {teachers.map((t) => {
            const expBadge = getExperienceBadge(t.experience_years || 0);
            return (
              <Link
                key={t.id}
                to={`/teachers?highlight=${t.id}`}
                className="block w-40 shrink-0 bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <div className="relative">
                  <div className="h-12 bg-gradient-to-br from-primary/15 to-primary/5" />
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-card group-hover:ring-primary/30 transition-colors" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-card ring-2 ring-card flex items-center justify-center"><UserCircle size={20} className="text-primary" /></div>
                    )}
                  </div>
                </div>
                <div className="pt-7 pb-3 px-2 text-center">
                  <h4 className="text-[11px] font-semibold line-clamp-1 flex items-center justify-center gap-0.5">
                    {t.name}
                    {t.is_verified && (
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex"><BadgeCheck size={11} className="text-blue-500 fill-blue-500 stroke-white shrink-0" /></span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1c1e21] text-white text-[10px] border-0 shadow-lg px-2 py-1 rounded-md">
                            যাচাইকৃত শিক্ষক
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </h4>
                  <p className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
                    <BookOpen size={8} /> {t.subject}
                  </p>
                  {t.district && (
                    <p className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5">
                      <MapPin size={8} /> {t.district}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={8} className={i <= (t.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
                    ))}
                    {(t.rating || 0) > 0 && <span className="text-[7px] text-muted-foreground ml-0.5">({toBengaliNumber(Number(t.rating).toFixed(1))})</span>}
                  </div>
                  {expBadge && (
                    <span className={`inline-block text-[8px] px-1.5 py-0.5 rounded-full border mt-1 ${expBadge.color}`}>
                      {expBadge.label}
                    </span>
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

export default TeacherSlider;
