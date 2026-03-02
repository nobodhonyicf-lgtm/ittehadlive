import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Lock, ChevronRight, Gamepad2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const QuizHome = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const { data: categories } = useQuery({
    queryKey: ["quiz_categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return data || [];
    },
  });

  const { data: levels } = useQuery({
    queryKey: ["quiz_levels"],
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_levels")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return data || [];
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["quiz_progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_user_progress")
        .select("*")
        .eq("user_id", user!.id);
      return data || [];
    },
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <SEOHead title="কুইজ গেম" />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="text-primary" size={36} />
          </div>
          <h1 className="text-2xl font-bold mb-3">কুইজ গেমে স্বাগতম! 🎮</h1>
          <p className="text-muted-foreground mb-6">
            কুইজ খেলতে ও আপনার স্কোর সেভ করতে লগইন করুন
          </p>
          <Button onClick={() => navigate("/login?returnUrl=/quiz")} size="lg">
            লগইন করুন
          </Button>
        </div>
      </Layout>
    );
  }

  const getTotalScore = (categoryId: string) => {
    const catLevels = levels?.filter((l) => l.category_id === categoryId) || [];
    const catLevelIds = catLevels.map((l) => l.id);
    return (
      progress
        ?.filter((p) => catLevelIds.includes(p.level_id))
        .reduce((sum, p) => sum + (p.best_score || 0), 0) || 0
    );
  };

  const getCompletedLevels = (categoryId: string) => {
    const catLevels = levels?.filter((l) => l.category_id === categoryId) || [];
    const catLevelIds = catLevels.map((l) => l.id);
    return progress?.filter((p) => catLevelIds.includes(p.level_id) && p.is_completed).length || 0;
  };

  const getTotalLevels = (categoryId: string) =>
    levels?.filter((l) => l.category_id === categoryId).length || 0;

  return (
    <Layout>
      <SEOHead title="কুইজ গেম" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Gamepad2 size={18} /> কুইজ গেম
          </div>
          <h1 className="text-3xl font-bold mb-2">শিখুন, খেলুন, জিতুন! 🏆</h1>
          <p className="text-muted-foreground">
            বাংলা ও ইংরেজি কুইজ খেলে আপনার জ্ঞান বাড়ান
          </p>
        </div>

        {/* Total Score Card */}
        <Card className="mb-8 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-200">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Trophy className="text-amber-600" size={28} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">মোট স্কোর</p>
              <p className="text-3xl font-bold text-amber-600">
                {categories?.reduce((s, c) => s + getTotalScore(c.id), 0) || 0}
              </p>
            </div>
            <div className="ml-auto flex gap-1">
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    (categories?.reduce((s, c) => s + getTotalScore(c.id), 0) || 0) >= i * 100
                      ? "text-amber-500 fill-amber-500"
                      : "text-muted-foreground/30"
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Cards */}
        <div className="grid gap-4">
          {categories?.map((cat) => {
            const completed = getCompletedLevels(cat.id);
            const total = getTotalLevels(cat.id);
            const pct = total > 0 ? (completed / total) * 100 : 0;
            const score = getTotalScore(cat.id);

            return (
              <Card
                key={cat.id}
                className="cursor-pointer hover:shadow-lg transition-all group border-2 hover:border-primary/30"
                onClick={() => navigate(`/quiz/${cat.slug}`)}
              >
                <CardContent className="flex items-center gap-4 py-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{cat.description}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {completed}/{total} লেভেল
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <Trophy size={12} className="text-amber-500" />
                      <span className="font-semibold">{score} পয়েন্ট</span>
                    </div>
                  </div>
                  <ChevronRight
                    className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                    size={24}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default QuizHome;
