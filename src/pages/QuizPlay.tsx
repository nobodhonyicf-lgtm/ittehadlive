import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Star,
  Trophy,
  RotateCcw,
  ChevronRight,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  points: number;
};

const QuizPlay = () => {
  const { slug, levelId } = useParams<{ slug: string; levelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);

  const { data: level } = useQuery({
    queryKey: ["quiz_level", levelId],
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_levels")
        .select("*, quiz_categories!inner(slug, name)")
        .eq("id", levelId)
        .single();
      return data;
    },
  });

  const { data: questions } = useQuery({
    queryKey: ["quiz_questions", levelId],
    enabled: !!levelId,
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("level_id", levelId!)
        .eq("is_active", true)
        .order("sort_order");
      return (data || []).map((q) => ({
        ...q,
        options: (typeof q.options === "string" ? JSON.parse(q.options) : q.options) as string[],
      })) as Question[];
    },
  });

  const currentQ = questions?.[currentIdx];
  const totalQ = questions?.length || 0;

  // Timer
  useEffect(() => {
    if (finished || isAnswered || !currentQ) return;
    setTimeLeft(15);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          // Time's up - auto answer wrong
          setIsAnswered(true);
          setSelectedAnswer(-1);
          setStreak(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIdx, finished, isAnswered, currentQ]);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (isAnswered || !currentQ) return;
      setSelectedAnswer(idx);
      setIsAnswered(true);
      if (idx === currentQ.correct_answer) {
        const bonus = streak >= 2 ? 5 : 0;
        setScore((s) => s + currentQ.points + bonus);
        setCorrectCount((c) => c + 1);
        setStreak((s) => s + 1);
        if (bonus > 0) toast.success(`🔥 স্ট্রিক বোনাস +${bonus}!`);
      } else {
        setStreak(0);
      }
    },
    [isAnswered, currentQ, streak]
  );

  const handleNext = async () => {
    if (currentIdx + 1 >= totalQ) {
      setFinished(true);
      // Save progress
      if (user && levelId) {
        const { data: existing } = await supabase
          .from("quiz_user_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("level_id", levelId)
          .maybeSingle();

        const payload = {
          user_id: user.id,
          level_id: levelId,
          score,
          total_questions: totalQ,
          correct_answers: correctCount,
          is_completed: correctCount >= Math.ceil(totalQ * 0.6),
          completed_at: correctCount >= Math.ceil(totalQ * 0.6) ? new Date().toISOString() : null,
          best_score: Math.max(score, existing?.best_score || 0),
          attempts: (existing?.attempts || 0) + 1,
          updated_at: new Date().toISOString(),
        };

        if (existing) {
          await supabase.from("quiz_user_progress").update(payload).eq("id", existing.id);
        } else {
          await supabase.from("quiz_user_progress").insert(payload);
        }
      }
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setCorrectCount(0);
    setFinished(false);
    setStreak(0);
  };

  const stars = totalQ > 0 ? Math.min(3, Math.floor((correctCount / totalQ) * 3 + 0.5)) : 0;
  const passed = correctCount >= Math.ceil(totalQ * 0.6);

  if (!questions || !level) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  // Result screen
  if (finished) {
    return (
      <Layout>
        <SEOHead title="কুইজ রেজাল্ট" />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-4">{passed ? "🎉" : "😔"}</div>
          <h1 className="text-2xl font-bold mb-2">
            {passed ? "অভিনন্দন!" : "আবার চেষ্টা করুন!"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {passed
              ? "আপনি সফলভাবে এই লেভেল পাস করেছেন!"
              : "৬০% সঠিক উত্তর দিলে লেভেল পাস হবে"}
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                size={40}
                className={cn(
                  "transition-all",
                  s <= stars ? "text-amber-500 fill-amber-500 scale-110" : "text-muted-foreground/20"
                )}
              />
            ))}
          </div>

          {/* Score Card */}
          <Card className="mb-6">
            <CardContent className="py-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <Trophy className="mx-auto text-amber-500 mb-1" size={24} />
                <p className="text-2xl font-bold">{score}</p>
                <p className="text-xs text-muted-foreground">পয়েন্ট</p>
              </div>
              <div>
                <CheckCircle2 className="mx-auto text-green-500 mb-1" size={24} />
                <p className="text-2xl font-bold">
                  {correctCount}/{totalQ}
                </p>
                <p className="text-xs text-muted-foreground">সঠিক</p>
              </div>
              <div>
                <Zap className="mx-auto text-blue-500 mb-1" size={24} />
                <p className="text-2xl font-bold">{Math.round((correctCount / totalQ) * 100)}%</p>
                <p className="text-xs text-muted-foreground">সঠিকতা</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-1" onClick={handleRetry}>
              <RotateCcw size={16} /> আবার খেলুন
            </Button>
            <Button className="flex-1 gap-1" onClick={() => navigate(`/quiz/${slug}`)}>
              <ChevronRight size={16} /> পরবর্তী লেভেল
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title={`কুইজ - ${level.name}`} />
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/quiz/${slug}`)}>
            <ArrowLeft size={16} />
          </Button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Trophy size={16} className="text-amber-500" /> {score}
          </div>
          {streak >= 2 && (
            <div className="flex items-center gap-1 text-orange-500 text-sm font-bold animate-pulse">
              <Zap size={14} /> {streak}x
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <Progress value={((currentIdx + 1) / totalQ) * 100} className="h-2.5 flex-1" />
          <span className="text-xs font-semibold text-muted-foreground">
            {currentIdx + 1}/{totalQ}
          </span>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div
            className={cn(
              "w-14 h-14 rounded-full border-4 flex items-center justify-center text-lg font-bold transition-colors",
              timeLeft <= 5
                ? "border-destructive text-destructive animate-pulse"
                : "border-primary text-primary"
            )}
          >
            {timeLeft}
          </div>
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <h2 className="text-lg font-bold text-center leading-relaxed">
              {currentQ?.question}
            </h2>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="grid gap-3 mb-6">
          {currentQ?.options.map((opt, idx) => {
            const isCorrect = idx === currentQ.correct_answer;
            const isSelected = selectedAnswer === idx;
            let variant: "default" | "outline" | "destructive" | "secondary" = "outline";
            let extraClass = "text-left justify-start h-auto py-3.5 px-4 text-base";

            if (isAnswered) {
              if (isCorrect) {
                extraClass += " border-green-500 bg-green-500/10 text-green-700";
              } else if (isSelected && !isCorrect) {
                extraClass += " border-destructive bg-destructive/10 text-destructive";
              } else {
                extraClass += " opacity-50";
              }
            } else {
              extraClass += " hover:border-primary hover:bg-primary/5";
            }

            return (
              <Button
                key={idx}
                variant={variant}
                className={extraClass}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
              >
                <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-bold mr-3 shrink-0">
                  {String.fromCharCode(2453 + idx)}
                </span>
                {opt}
                {isAnswered && isCorrect && <CheckCircle2 className="ml-auto text-green-500 shrink-0" size={20} />}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="ml-auto text-destructive shrink-0" size={20} />
                )}
              </Button>
            );
          })}
        </div>

        {/* Explanation + Next */}
        {isAnswered && (
          <div className="space-y-3">
            {currentQ?.explanation && (
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                <CardContent className="py-3 text-sm">
                  <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">💡 ব্যাখ্যা:</p>
                  <p className="text-blue-600 dark:text-blue-400">{currentQ.explanation}</p>
                </CardContent>
              </Card>
            )}
            <Button className="w-full gap-1" onClick={handleNext}>
              {currentIdx + 1 >= totalQ ? "ফলাফল দেখুন" : "পরবর্তী প্রশ্ন"}
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuizPlay;
