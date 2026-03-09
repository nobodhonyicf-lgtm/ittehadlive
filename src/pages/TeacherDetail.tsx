import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { useIsApp } from "@/hooks/useIsApp";
import Breadcrumbs from "@/components/Breadcrumbs";
import { toBengali, toBengaliNumber } from "@/lib/bengali";
import { generateTeacherCV } from "@/lib/teacherCV";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  MapPin, BookOpen, Award, Phone, Mail, Star, GraduationCap, Briefcase, BadgeCheck, UserCircle, Download, Share2,
} from "lucide-react";

const getExperienceBadge = (years: number) => {
  if (years >= 10) return { label: "সিনিয়র", color: "bg-amber-500/10 text-amber-700 border-amber-200" };
  if (years >= 5) return { label: "অভিজ্ঞ", color: "bg-blue-500/10 text-blue-700 border-blue-200" };
  if (years >= 2) return { label: "মধ্যম", color: "bg-green-500/10 text-green-700 border-green-200" };
  return null;
};

const renderStars = (rating: number | null) => {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={12} className={s <= Math.round(Number(rating)) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"} />
      ))}
      <span className="text-[10px] text-muted-foreground ml-1">{toBengali(Number(rating).toFixed(1))}</span>
    </div>
  );
};

const TeacherDetail = () => {
  const { id } = useParams<{ id: string }>();
  const isApp = useIsApp();

  const { data: teacher, isLoading } = useQuery({
    queryKey: ["teacher_detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const expBadge = teacher ? getExperienceBadge(teacher.experience_years || 0) : null;

  const loadingUI = (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  const notFoundUI = (
    <div className="text-center py-20">
      <UserCircle size={48} className="mx-auto text-muted-foreground/30 mb-3" />
      <p className="text-muted-foreground font-medium">শিক্ষক পাওয়া যায়নি</p>
      <Link to="/teachers" className="text-primary text-sm mt-2 inline-block">← শিক্ষক তালিকায় ফিরুন</Link>
    </div>
  );

  const content = (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: "শিক্ষক", href: "/teachers" }, { label: teacher?.name || "বিস্তারিত" }]} />
      <SEOHead title={teacher ? `${teacher.name} - শিক্ষক প্রোফাইল` : "শিক্ষক প্রোফাইল"} description={teacher ? `${teacher.name}, ${teacher.subject} বিষয়ে শিক্ষক` : ""} />

      {isLoading ? loadingUI : !teacher ? notFoundUI : (
        <div className="space-y-5">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            {teacher.photo_url ? (
              <img src={teacher.photo_url} alt={teacher.name} className="w-24 h-24 rounded-2xl object-cover ring-2 ring-primary/10" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <UserCircle size={48} className="text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold flex items-center gap-1.5">
                {teacher.name}
                {(teacher as any).is_verified && <BadgeCheck size={18} className="text-blue-500 fill-blue-500 stroke-white" />}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <BookOpen size={13} /> {teacher.subject}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge
                  variant={(teacher as any).institution_id ? "default" : teacher.is_available ? "default" : "secondary"}
                  className={`text-[11px] ${(teacher as any).institution_id ? "bg-blue-500/10 text-blue-700 border-blue-200" : teacher.is_available ? "bg-green-500/10 text-green-700 border-green-200" : ""}`}
                >
                  {(teacher as any).institution_id ? "✓ নিয়োগপ্রাপ্ত" : teacher.is_available ? "✓ উপলব্ধ" : "অনুপলব্ধ"}
                </Badge>
                {expBadge && (
                  <Badge variant="outline" className={`text-[11px] ${expBadge.color}`}>
                    <Briefcase size={10} className="mr-0.5" /> {expBadge.label}
                  </Badge>
                )}
              </div>
              {renderStars(teacher.rating)}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {teacher.qualification && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm">
                <Award size={15} className="text-primary shrink-0" />
                <div><div className="text-[10px] text-muted-foreground">যোগ্যতা</div><span className="text-xs font-medium">{teacher.qualification}</span></div>
              </div>
            )}
            {(teacher.experience_years || 0) > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm">
                <Briefcase size={15} className="text-primary shrink-0" />
                <div><div className="text-[10px] text-muted-foreground">অভিজ্ঞতা</div><span className="text-xs font-medium">{toBengaliNumber(teacher.experience_years || 0)} বছর</span></div>
              </div>
            )}
            {teacher.district && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm">
                <MapPin size={15} className="text-primary shrink-0" />
                <div><div className="text-[10px] text-muted-foreground">জেলা</div><span className="text-xs font-medium">{teacher.district}</span></div>
              </div>
            )}
            {teacher.specialization && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm">
                <BookOpen size={15} className="text-primary shrink-0" />
                <div><div className="text-[10px] text-muted-foreground">বিশেষ দক্ষতা</div><span className="text-xs font-medium">{teacher.specialization}</span></div>
              </div>
            )}
            {(teacher as any).exam_result && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm">
                <GraduationCap size={15} className="text-primary shrink-0" />
                <div><div className="text-[10px] text-muted-foreground">পরীক্ষার ফলাফল</div><span className="text-xs font-medium">{(teacher as any).exam_result}</span></div>
              </div>
            )}
            {(teacher as any).grade_obtained && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm">
                <Award size={15} className="text-primary shrink-0" />
                <div><div className="text-[10px] text-muted-foreground">গ্রেড</div><span className="text-xs font-medium">{(teacher as any).grade_obtained}</span></div>
              </div>
            )}
          </div>

          {/* Previous Institution */}
          {(teacher as any).previous_institution && (
            <div className="text-sm bg-muted/50 rounded-xl p-4">
              <strong className="text-xs">পূর্ববর্তী প্রতিষ্ঠান:</strong>
              <p className="mt-1 text-muted-foreground">{(teacher as any).previous_institution}</p>
            </div>
          )}

          {/* Contact */}
          {(teacher.phone || teacher.email) && (
            <div className="border-t border-border pt-4 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">যোগাযোগ</h3>
              {teacher.phone && (
                <a href={`tel:${teacher.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Phone size={14} /> {toBengali(teacher.phone)}
                </a>
              )}
              {teacher.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail size={14} /> {teacher.email}
                </div>
              )}
            </div>
          )}

          {teacher.certification && <div className="text-sm bg-muted/50 rounded-xl p-4"><strong className="text-xs">সার্টিফিকেশন:</strong><br />{teacher.certification}</div>}
          {teacher.preferred_area && <div className="text-sm bg-muted/50 rounded-xl p-4"><strong className="text-xs">পছন্দের এলাকা:</strong><br />{teacher.preferred_area}</div>}
          {teacher.expected_salary && <div className="text-sm bg-muted/50 rounded-xl p-4"><strong className="text-xs">প্রত্যাশিত বেতন:</strong><br />{teacher.expected_salary}</div>}
          {teacher.bio && (
            <div className="text-sm bg-muted/50 rounded-xl p-4">
              <strong className="text-xs">জীবনবৃত্তান্ত:</strong>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{teacher.bio}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2" onClick={async () => {
              toast.info("সিভি তৈরি হচ্ছে...");
              try {
                await generateTeacherCV(teacher);
                toast.success("সিভি ডাউনলোড হয়েছে!");
              } catch { toast.error("সিভি তৈরিতে সমস্যা হয়েছে"); }
            }}>
              <Download size={14} /> সিভি ডাউনলোড
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {
              const shareUrl = `https://ittehad.bd/teacher/${teacher.id}`;
              if (typeof navigator.share === "function") {
                navigator.share({ title: teacher.name, text: `শিক্ষক: ${teacher.name} - ${teacher.subject}`, url: shareUrl });
              } else {
                navigator.clipboard.writeText(shareUrl);
                toast.success("লিংক কপি হয়েছে!");
              }
            }}>
              <Share2 size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return isApp ? <AppLayout>{content}</AppLayout> : <Layout>{content}</Layout>;
};

export default TeacherDetail;
