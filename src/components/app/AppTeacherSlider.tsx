import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { BadgeCheck, BookOpen, MapPin, Star, Users, UserCircle } from "lucide-react";
import { toBengaliNumber } from "@/lib/bengali";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const getExperienceBadge = (years: number) => {
  if (years >= 10) return { label: "সিনিয়র", color: "bg-amber-500/10 text-amber-700 border-amber-200" };
  if (years >= 5) return { label: "অভিজ্ঞ", color: "bg-blue-500/10 text-blue-700 border-blue-200" };
  if (years >= 2) return { label: "মধ্যম", color: "bg-green-500/10 text-green-700 border-green-200" };
  return null;
};

const AppTeacherSlider = () => {
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

  // Fetch branch names for affiliate badges
  const branchIds = [...new Set((teachers || []).filter(t => t.institution_id).map(t => t.institution_id!))];
  const { data: branches } = useQuery({
    queryKey: ["teacher_slider_branches", branchIds],
    queryFn: async () => {
      const { data } = await supabase.from("branches").select("id, name, image_url").in("id", branchIds);
      return data || [];
    },
    enabled: branchIds.length > 0,
  });

  const branchMap = new Map((branches || []).map(b => [b.id, b]));

  if (!teachers?.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold flex items-center gap-1.5"><Users size={15} className="text-pink-600" /> আপনার মাদরাসার জন্য শিক্ষক খুঁজুন</h3>
        <Link to="/teachers" className="text-xs text-primary font-medium">সব দেখুন →</Link>
      </div>
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-2.5 pb-1" style={{ minWidth: "max-content" }}>
          {teachers.map((t) => {
            const expBadge = getExperienceBadge(t.experience_years || 0);
            const branch = t.institution_id ? branchMap.get(t.institution_id) : null;
            return (
              <Link
                key={t.id}
                to={`/teachers?highlight=${t.id}`}
                className="block w-32 shrink-0 bg-card border border-border rounded-xl overflow-hidden active:scale-95 transition-transform"
              >
                <div className="relative">
                  <div className="h-10 bg-gradient-to-br from-primary/15 to-primary/5" />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-card" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-card ring-2 ring-card flex items-center justify-center"><UserCircle size={18} className="text-primary" /></div>
                    )}
                  </div>
                  {/* Affiliate badge */}
                  {branch && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute top-1 right-1">
                          {branch.image_url ? (
                            <img src={branch.image_url} alt="" className="w-5 h-5 rounded-full object-contain bg-white ring-1 ring-border shadow-sm" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center ring-1 ring-white shadow-sm">
                              <BadgeCheck size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                        এই শিক্ষক {branch.name} এর সাথে যুক্ত
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="pt-6 pb-2.5 px-2 text-center">
                  <h4 className="text-[10px] font-semibold line-clamp-1 flex items-center justify-center gap-0.5">
                    {t.name}
                    {t.is_verified && <BadgeCheck size={10} className="text-blue-500 fill-blue-500 stroke-white shrink-0" />}
                  </h4>
                  <p className="text-[8px] text-muted-foreground flex items-center justify-center gap-0.5">
                    <BookOpen size={7} /> {t.subject}
                  </p>
                  {t.institution_id && branch ? (
                    <p className="text-[8px] text-blue-600 font-medium flex items-center justify-center gap-0.5 mt-0.5">
                      ✓ নিয়োগপ্রাপ্ত
                    </p>
                  ) : t.district ? (
                    <p className="text-[8px] text-muted-foreground flex items-center justify-center gap-0.5">
                      <MapPin size={7} /> {t.district}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={7} className={i <= (t.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
                    ))}
                    {(t.rating || 0) > 0 && <span className="text-[6px] text-muted-foreground ml-0.5">({toBengaliNumber(Number(t.rating).toFixed(1))})</span>}
                  </div>
                  {expBadge && (
                    <span className={`inline-block text-[7px] px-1 py-0.5 rounded-full border mt-0.5 ${expBadge.color}`}>
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

export default AppTeacherSlider;
