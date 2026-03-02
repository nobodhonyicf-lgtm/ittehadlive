import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Clock, Building2 } from "lucide-react";
import SectionHeader from "./SectionHeader";

const JobPostingsSlider = () => {
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
      <SectionHeader title="নিয়োগ বিজ্ঞপ্তি" linkUrl="/teachers" />
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="flex gap-3 pb-2" style={{ minWidth: "max-content" }}>
          {jobs.map((j) => {
            const branch = getBranch(j.branch_id);
            return (
              <Link
                key={j.id}
                to={`/teachers?job=${j.id}`}
                className="block w-52 shrink-0 bg-card border border-primary/20 rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all group"
              >
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-1.5">
                  <span className="text-[8px] font-medium text-primary uppercase tracking-wider">📢 নিয়োগ</span>
                </div>
                <div className="p-3 pt-2">
                  <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {j.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-2 text-[9px] text-muted-foreground">
                    {j.subject && <span className="bg-muted px-1.5 py-0.5 rounded-full">📚 {j.subject}</span>}
                    {j.location && <span className="bg-muted px-1.5 py-0.5 rounded-full">📍 {j.location}</span>}
                  </div>
                  {j.salary_range && (
                    <div className="mt-1.5 text-[10px] font-semibold text-primary">
                      💰 {j.salary_range}
                    </div>
                  )}
                  {j.deadline && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-destructive">
                      <Clock size={10} />
                      <span>শেষ: {new Date(j.deadline).toLocaleDateString("bn-BD")}</span>
                    </div>
                  )}
                  {branch && (
                    <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5">
                      {branch.image_url ? (
                        <img src={branch.image_url} alt="" className="w-4 h-4 rounded object-contain bg-muted" />
                      ) : (
                        <Building2 size={11} className="text-primary" />
                      )}
                      <span className="text-[10px] text-primary font-semibold line-clamp-1">{branch.name}</span>
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

export default JobPostingsSlider;
