import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GraduationCap, MapPin, BookOpen, Users, UserCircle, Phone, Mail, Star, BadgeCheck } from "lucide-react";
import { toBengaliNumber } from "@/lib/bengali";

const AssignedTeachers = () => {
  const { data: teachers, isLoading } = useQuery({
    queryKey: ["assigned_teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("is_active", true)
        .not("institution_id", "is", null)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: branches } = useQuery({
    queryKey: ["branches_for_assigned"],
    queryFn: async () => {
      const { data } = await supabase.from("branches").select("id, name, image_url, code").eq("status", "active");
      return data || [];
    },
  });

  const getBranch = (id: string | null) => branches?.find(b => b.id === id);

  return (
    <Layout>
      <SEOHead title="খেদমতপ্রাপ্ত শিক্ষক" description="প্রতিষ্ঠানে খেদমতরত শিক্ষকগণ" />
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-3">
            <BadgeCheck size={14} /> খেদমতপ্রাপ্ত
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">খেদমতপ্রাপ্ত শিক্ষকগণ</h1>
          <p className="text-muted-foreground text-sm mt-2">যেসকল শিক্ষক কোনো প্রতিষ্ঠানে খেদমতরত আছেন</p>
          {teachers && (
            <Badge variant="outline" className="mt-3">{toBengaliNumber(teachers.length)} জন শিক্ষক</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-20 bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : !teachers?.length ? (
          <div className="text-center py-16">
            <Users size={48} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">এখনো কোনো শিক্ষক খেদমতপ্রাপ্ত হননি</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map(t => {
              const branch = getBranch((t as any).institution_id);
              return (
                <Card key={t.id} className="hover:shadow-lg hover:border-primary/20 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {t.photo_url ? (
                        <img src={t.photo_url} alt={t.name} className="w-14 h-14 rounded-xl object-cover ring-2 ring-muted" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <UserCircle size={28} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm flex items-center gap-1.5">
                          {t.name}
                          {(t as any).is_verified && (
                            <BadgeCheck size={14} className="text-blue-500 fill-blue-500 stroke-white shrink-0" />
                          )}
                          {/* Institution affiliate badge - like X.com */}
                          {branch?.image_url && (
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <img src={branch.image_url} alt="" className="w-4 h-4 rounded-sm object-contain shrink-0 ring-1 ring-border" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#1c1e21] text-white text-[10px] border-0 shadow-lg px-2 py-1 rounded-md">
                                  {branch.name}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <BookOpen size={11} /> {t.subject}
                        </p>
                        {t.district && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin size={11} /> {t.district}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Institution info */}
                    {branch && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 bg-muted/30 rounded-md p-2 -mx-1">
                        {branch.image_url ? (
                          <img src={branch.image_url} alt="" className="w-6 h-6 rounded object-contain bg-white" />
                        ) : (
                          <GraduationCap size={14} className="text-primary" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-primary truncate">{branch.name}</p>
                          {branch.code && <p className="text-[9px] text-muted-foreground">কোড: {branch.code}</p>}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 text-[10px] text-muted-foreground">
                      {t.experience_years > 0 && <span>{toBengaliNumber(t.experience_years)} বছর অভিজ্ঞতা</span>}
                      {t.qualification && <span>· {t.qualification}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AssignedTeachers;
