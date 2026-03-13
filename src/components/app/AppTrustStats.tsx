import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toBengali } from "@/lib/bengali";
import { Building2, Users, GraduationCap, Bell } from "lucide-react";

const AppTrustStats = () => {
  const { data: branchCount } = useQuery({
    queryKey: ["branch_count"],
    queryFn: async () => {
      const { count } = await supabase.from("branches").select("id", { count: "exact", head: true }).eq("is_active", true);
      return count || 0;
    },
  });
  const { data: teacherCount } = useQuery({
    queryKey: ["teacher_count"],
    queryFn: async () => {
      const { count } = await supabase.from("teachers").select("id", { count: "exact", head: true }).eq("is_active", true);
      return count || 0;
    },
  });
  const { data: studentCount } = useQuery({
    queryKey: ["student_count"],
    queryFn: async () => {
      const { count } = await supabase.from("students").select("id", { count: "exact", head: true }).eq("is_active", true);
      return count || 0;
    },
  });
  const { data: noticeCount } = useQuery({
    queryKey: ["notice_count"],
    queryFn: async () => {
      const { count } = await supabase.from("notices").select("id", { count: "exact", head: true }).eq("is_active", true);
      return count || 0;
    },
  });

  const stats = [
    { value: branchCount || 0, label: "শাখা", icon: Building2 },
    { value: studentCount || 0, label: "শিক্ষার্থী", icon: Users },
    { value: teacherCount || 0, label: "শিক্ষক", icon: GraduationCap },
    { value: noticeCount || 0, label: "নোটিশ", icon: Bell },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-2.5 text-center">
          <stat.icon size={14} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground leading-tight">{toBengali(stat.value)}</p>
          <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AppTrustStats;
