import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { useIsApp } from "@/hooks/useIsApp";
import Breadcrumbs from "@/components/Breadcrumbs";
import { toBengali } from "@/lib/bengali";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, BookOpen, Clock, DollarSign, Award, Briefcase, Building2, Phone, Mail, Users, GraduationCap, FileText, Share2,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const isApp = useIsApp();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job_detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*, branches(*)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const branch = job?.branches as any;
  const isExpired = job?.deadline ? new Date(job.deadline) < new Date() : false;

  const loadingUI = (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  const notFoundUI = (
    <div className="text-center py-20">
      <FileText size={48} className="mx-auto text-muted-foreground/30 mb-3" />
      <p className="text-muted-foreground font-medium">নিয়োগ বিজ্ঞপ্তি পাওয়া যায়নি</p>
      <Link to="/teachers" className="text-primary text-sm mt-2 inline-block">← শিক্ষক তালিকায় ফিরুন</Link>
    </div>
  );

  const content = (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: "শিক্ষক", href: "/teachers" }, { label: job?.title || "নিয়োগ বিজ্ঞপ্তি" }]} />
      <SEOHead title={job ? `${job.title} - নিয়োগ বিজ্ঞপ্তি` : "নিয়োগ বিজ্ঞপ্তি"} description={job?.description || ""} />

      {isLoading ? loadingUI : !job ? notFoundUI : (
        <div className="space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold">{job.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {job.subject && (
                <Badge variant="outline" className="text-xs gap-1">
                  <BookOpen size={11} /> {job.subject}
                </Badge>
              )}
              {job.location && (
                <Badge variant="outline" className="text-xs gap-1">
                  <MapPin size={11} /> {job.location}
                </Badge>
              )}
              {job.salary_range && (
                <Badge variant="outline" className="text-xs gap-1">
                  <DollarSign size={11} /> {job.salary_range}
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive" className="text-xs">মেয়াদ শেষ</Badge>
              )}
            </div>
          </div>

          {/* Deadline */}
          {job.deadline && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${isExpired ? "bg-destructive/10 text-destructive" : "bg-primary/5 text-primary"}`}>
              <Clock size={15} />
              <span className="font-medium">আবেদনের শেষ তারিখ: {new Date(job.deadline).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">বিবরণ</h3>
              <p className="text-sm whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {job.qualification_required && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm">
                <Award size={15} className="text-primary shrink-0" />
                <div><div className="text-[10px] text-muted-foreground">যোগ্যতা</div><span className="text-xs font-medium">{job.qualification_required}</span></div>
              </div>
            )}
            {job.experience_required && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm">
                <Briefcase size={15} className="text-primary shrink-0" />
                <div><div className="text-[10px] text-muted-foreground">অভিজ্ঞতা</div><span className="text-xs font-medium">{job.experience_required}</span></div>
              </div>
            )}
          </div>

          {/* Branch Info */}
          {branch && (
            <div className="border border-border rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">প্রতিষ্ঠান</h3>
              <div className="flex items-center gap-3">
                {branch.image_url ? (
                  <img src={branch.image_url} alt="" className="w-12 h-12 rounded-lg object-contain bg-muted border" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 size={24} className="text-primary" /></div>
                )}
                <div>
                  <h4 className="font-semibold text-sm">{branch.name}</h4>
                  {branch.address && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10} /> {branch.address}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                {branch.phone && <span className="flex items-center gap-1"><Phone size={10} /> {toBengali(branch.phone)}</span>}
                {branch.email && <span className="flex items-center gap-1"><Mail size={10} /> {branch.email}</span>}
                {branch.total_teachers > 0 && <span className="flex items-center gap-1"><GraduationCap size={10} /> {toBengali(branch.total_teachers)} জন শিক্ষক</span>}
                {branch.total_students > 0 && <span className="flex items-center gap-1"><Users size={10} /> {toBengali(branch.total_students)} জন ছাত্র</span>}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!isExpired && (
              <Link to={`/job-apply/${job.id}`} className="flex-1">
                <Button className="w-full gap-2">
                  <FileText size={14} /> আবেদন করুন
                </Button>
              </Link>
            )}
            <Button variant="outline" className="gap-2" onClick={() => {
              const shareUrl = `https://ittehad.bd/job/${job.id}`;
              if (typeof navigator.share === "function") {
                navigator.share({ title: job.title, text: `নিয়োগ বিজ্ঞপ্তি: ${job.title}`, url: shareUrl });
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

export default JobDetail;
