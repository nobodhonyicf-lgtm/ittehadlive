import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { BadgeCheck, BookOpen, MapPin, Star, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SectionHeader from "./SectionHeader";

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
      <SectionHeader title="শিক্ষক তথ্য" linkUrl="/teachers" />
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="flex gap-3 pb-2" style={{ minWidth: "max-content" }}>
          {teachers.map((t) => {
            const expBadge = getExperienceBadge(t.experience_years || 0);
            return (
              <Link
                key={t.id}
                to={`/teachers?highlight=${t.id}`}
                className="block w-44 shrink-0 bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="p-3 text-center">
                  {t.photo_url ? (
                    <img
                      src={t.photo_url}
                      alt={t.name}
                      className="w-14 h-14 rounded-full object-cover mx-auto ring-2 ring-muted group-hover:ring-primary/20 transition-colors"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xl mx-auto">
                      👨‍🏫
                    </div>
                  )}
                  <h4 className="text-xs font-semibold mt-2 line-clamp-1 flex items-center justify-center gap-0.5">
                    {t.name}
                    {t.is_verified && (
                      <BadgeCheck size={12} className="text-blue-500 fill-blue-500 stroke-white shrink-0" />
                    )}
                  </h4>
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
                    <BookOpen size={9} /> {t.subject}
                  </p>
                  {t.district && (
                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                      <MapPin size={9} /> {t.district}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={9} className={i <= (t.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"} />
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    {expBadge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${expBadge.color}`}>
                        {expBadge.label}
                      </span>
                    )}
                  </div>
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
