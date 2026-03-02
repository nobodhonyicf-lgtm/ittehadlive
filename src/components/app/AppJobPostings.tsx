import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Clock, Building2 } from "lucide-react";

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
        <h3 className="text-sm font-bold flex items-center gap-1.5">📋 নিয়োগ বিজ্ঞপ্তি</h3>
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
                className="block w-48 shrink-0 bg-card border border-primary/20 rounded-xl overflow-hidden active:scale-95 transition-transform"
              >
                <div className="p-2.5">
                  <h4 className="text-[11px] font-semibold line-clamp-2">{j.title}</h4>
                  {branch && (
                    <div className="flex items-center gap-1 mt-1">
                      {branch.image_url ? (
                        <img src={branch.image_url} alt="" className="w-3.5 h-3.5 rounded object-contain bg-muted" />
                      ) : (
                        <Building2 size={10} className="text-muted-foreground" />
                      )}
                      <span className="text-[9px] text-muted-foreground font-medium line-clamp-1">{branch.name}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1.5 text-[8px] text-muted-foreground">
                    {j.subject && <span className="bg-muted px-1.5 py-0.5 rounded-full">📚 {j.subject}</span>}
                  </div>
                  {j.deadline && (
                    <div className="flex items-center gap-1 mt-1.5 text-[9px] text-destructive">
                      <Clock size={9} />
                      <span>শেষ: {new Date(j.deadline).toLocaleDateString("bn-BD")}</span>
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
