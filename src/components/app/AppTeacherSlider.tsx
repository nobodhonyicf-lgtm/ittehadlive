import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { BadgeCheck, BookOpen, MapPin, Star } from "lucide-react";

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

  if (!teachers?.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold flex items-center gap-1.5">👨‍🏫 শিক্ষক তথ্য</h3>
        <Link to="/teachers" className="text-xs text-primary font-medium">সব দেখুন →</Link>
      </div>
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-2.5 pb-1" style={{ minWidth: "max-content" }}>
          {teachers.map((t) => {
            const expBadge = getExperienceBadge(t.experience_years || 0);
            return (
              <Link
                key={t.id}
                to={`/teachers?highlight=${t.id}`}
                className="block w-36 shrink-0 bg-card border border-border rounded-xl overflow-hidden active:scale-95 transition-transform"
              >
                <div className="p-2.5 text-center">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.name} className="w-12 h-12 rounded-full object-cover mx-auto ring-2 ring-muted" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-lg mx-auto">👨‍🏫</div>
                  )}
                  <h4 className="text-[11px] font-semibold mt-1.5 line-clamp-1 flex items-center justify-center gap-0.5">
                    {t.name}
                    {t.is_verified && <BadgeCheck size={11} className="text-blue-500 fill-blue-500 stroke-white shrink-0" />}
                  </h4>
                  <p className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5">
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

export default AppTeacherSlider;
