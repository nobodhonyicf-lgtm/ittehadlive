import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Star, Lock, ChevronRight, Gamepad2, Medal, Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Breadcrumbs from "@/components/Breadcrumbs";

const QuizHome = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("categories");

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

  const { data: leaderboard } = useQuery({
    queryKey: ["quiz_leaderboard"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_quiz_leaderboard");
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
          <h1 className="text-2xl font-bold mb-3">কুইজ গেমে স্বাগতম!</h1>
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
    return progress?.filter((p) => catLevelIds.includes(p.level_id)).reduce((sum, p) => sum + (p.best_score || 0), 0) || 0;
  };

  const getCompletedLevels = (categoryId: string) => {
    const catLevels = levels?.filter((l) => l.category_id === categoryId) || [];
    const catLevelIds = catLevels.map((l) => l.id);
    return progress?.filter((p) => catLevelIds.includes(p.level_id) && p.is_completed).length || 0;
  };

  const getTotalLevels = (categoryId: string) => levels?.filter((l) => l.category_id === categoryId).length || 0;

  const myTotalScore = categories?.reduce((s, c) => s + getTotalScore(c.id), 0) || 0;

  const getRankIcon = (idx: number) => {
    if (idx === 0) return <Crown className="text-amber-500 fill-amber-500" size={20} />;
    if (idx === 1) return <Medal className="text-gray-400" size={20} />;
    if (idx === 2) return <Medal className="text-amber-700" size={20} />;
    return <span className="text-xs font-bold text-muted-foreground w-5 text-center">{idx + 1}</span>;
  };

  return (
    <Layout>
      <SEOHead title="কুইজ গেম" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "কুইজ গেম" }]} />
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-3">
            <Gamepad2 size={18} /> কুইজ গেম
          </div>
          <h1 className="text-3xl font-bold mb-2">শিখুন, খেলুন, জিতুন!</h1>
          <p className="text-muted-foreground text-sm">সাধারণ জ্ঞান, ইসলামী জ্ঞান ও ইংরেজি শিখুন</p>
        </div>

        {/* Total Score */}
        <Card className="mb-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-200">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Trophy className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">আপনার মোট স্কোর</p>
              <p className="text-2xl font-bold text-amber-600">{myTotalScore}</p>
            </div>
            <div className="ml-auto flex gap-1">
              {[1, 2, 3].map((i) => (
                <Star key={i} size={18} className={myTotalScore >= i * 100 ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="categories"><Gamepad2 size={14} className="mr-1" /> ক্যাটাগরি</TabsTrigger>
            <TabsTrigger value="leaderboard"><Trophy size={14} className="mr-1" /> লিডারবোর্ড</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <div className="grid gap-3">
              {categories?.map((cat) => {
                const completed = getCompletedLevels(cat.id);
                const total = getTotalLevels(cat.id);
                const pct = total > 0 ? (completed / total) * 100 : 0;
                const score = getTotalScore(cat.id);
                return (
                  <Card key={cat.id} className="cursor-pointer hover:shadow-lg transition-all group border-2 hover:border-primary/30" onClick={() => navigate(`/quiz/${cat.slug}`)}>
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{completed}/{total}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <Trophy size={12} className="text-amber-500" />
                          <span className="font-semibold">{score} পয়েন্ট</span>
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" size={22} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardContent className="py-4">
                {!leaderboard?.length ? (
                  <p className="text-center text-muted-foreground py-8">এখনো কেউ কুইজ খেলেনি</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry: any, idx: number) => {
                      const isMe = entry.user_id === user?.id;
                      return (
                        <div key={entry.user_id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isMe ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"}`}>
                          <div className="w-6 flex justify-center">{getRankIcon(idx)}</div>
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={entry.avatar_url || ""} />
                            <AvatarFallback className="text-xs">{(entry.full_name || "?")[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isMe ? "text-primary" : ""}`}>
                              {entry.full_name} {isMe && "(আমি)"}
                            </p>
                            <p className="text-xs text-muted-foreground">{entry.levels_completed} লেভেল সম্পন্ন</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-amber-600">{entry.total_score}</p>
                            <p className="text-[10px] text-muted-foreground">পয়েন্ট</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default QuizHome;
