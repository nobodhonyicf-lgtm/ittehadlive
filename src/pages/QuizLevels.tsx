import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Lock, Star, CheckCircle2, Play, Trophy } from "lucide-react";

const QuizLevels = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: category } = useQuery({
    queryKey: ["quiz_category", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_categories")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();
      return data;
    },
  });

  const { data: levels } = useQuery({
    queryKey: ["quiz_levels", category?.id],
    enabled: !!category,
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_levels")
        .select("*")
        .eq("category_id", category!.id)
        .eq("is_active", true)
        .order("sort_order");
      return data || [];
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["quiz_progress", user?.id, category?.id],
    enabled: !!user && !!category,
    queryFn: async () => {
      const levelIds = levels?.map((l) => l.id) || [];
      if (!levelIds.length) return [];
      const { data } = await supabase
        .from("quiz_user_progress")
        .select("*")
        .eq("user_id", user!.id)
        .in("level_id", levelIds);
      return data || [];
    },
  });

  const totalScore = progress?.reduce((s, p) => s + (p.best_score || 0), 0) || 0;

  const isLevelUnlocked = (level: any) => {
    if (level.required_score === 0) return true;
    return totalScore >= level.required_score;
  };

  const getLevelProgress = (levelId: string) =>
    progress?.find((p) => p.level_id === levelId);

  if (!category) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title={`${category.name} - কুইজ`} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/quiz")} className="mb-4 gap-1">
          <ArrowLeft size={16} /> ফিরে যান
        </Button>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{category.icon}</div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
          <div className="inline-flex items-center gap-2 mt-3 bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full text-sm font-semibold">
            <Trophy size={16} /> মোট স্কোর: {totalScore}
          </div>
        </div>

        {/* Level Map - vertical path */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border z-0" />

          <div className="space-y-4 relative z-10">
            {levels?.map((level, idx) => {
              const unlocked = isLevelUnlocked(level);
              const prog = getLevelProgress(level.id);
              const completed = prog?.is_completed;
              const stars = prog ? Math.min(3, Math.floor((prog.best_score / (prog.total_questions * 10)) * 3)) : 0;

              return (
                <div key={level.id} className="flex items-start gap-4">
                  {/* Circle indicator */}
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-2xl border-4 ${
                      completed
                        ? "border-green-500 bg-green-500/10"
                        : unlocked
                        ? "border-primary bg-primary/10"
                        : "border-muted bg-muted/50"
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 className="text-green-500" size={28} />
                    ) : unlocked ? (
                      level.icon || `${idx + 1}`
                    ) : (
                      <Lock className="text-muted-foreground" size={20} />
                    )}
                  </div>

                  {/* Card */}
                  <Card
                    className={`flex-1 transition-all ${
                      unlocked
                        ? "cursor-pointer hover:shadow-md hover:border-primary/30"
                        : "opacity-60"
                    }`}
                    onClick={() => unlocked && navigate(`/quiz/${slug}/play/${level.id}`)}
                  >
                    <CardContent className="py-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">
                          লেভেল {idx + 1}: {level.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{level.description}</p>
                        {prog && (
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                className={
                                  s <= stars
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-muted-foreground/30"
                                }
                              />
                            ))}
                            <span className="text-xs ml-1 text-muted-foreground">
                              সর্বোচ্চ: {prog.best_score}
                            </span>
                          </div>
                        )}
                        {!unlocked && (
                          <p className="text-xs text-destructive mt-1">
                            🔒 {level.required_score} পয়েন্ট প্রয়োজন
                          </p>
                        )}
                      </div>
                      {unlocked && (
                        <Button size="sm" variant={completed ? "outline" : "default"} className="gap-1 shrink-0">
                          <Play size={14} /> {completed ? "আবার খেলুন" : "শুরু করুন"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizLevels;
