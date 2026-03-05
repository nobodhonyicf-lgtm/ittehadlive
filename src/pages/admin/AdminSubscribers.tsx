import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Mail, Trash2, Search, Send, Users, CheckSquare } from "lucide-react";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";
import { toBengaliNumber } from "@/lib/bengali";

// ─── Email wrapper with institution header & footer ───
const wrapWithBranding = (body: string, siteName: string, siteUrl: string, logoUrl: string) => `
<!DOCTYPE html>
<html lang="bn" dir="ltr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  @import url('https://fonts.cdnfonts.com/css/solaimanlipi');
  body, td, th, p, h1, h2, h3, h4, a, span, div {
    font-family: 'SolaimanLipi', 'Noto Sans Bengali', 'Segoe UI', sans-serif !important;
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:'SolaimanLipi','Noto Sans Bengali','Segoe UI',sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f0;">
<tr><td align="center" style="padding:24px 12px;">

<!-- Main container -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#1a5632 0%,#2d7a4f 100%);padding:24px 32px;text-align:center;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">
      ${logoUrl ? `<img src="${logoUrl}" alt="${siteName}" width="64" height="64" style="width:64px;height:64px;border-radius:50%;border:3px solid rgba(255,255,255,0.3);margin-bottom:8px;display:block;margin-left:auto;margin-right:auto;" />` : ''}
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${siteName}</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">প্রাইভেট মাদরাসা সমন্বয় সংগঠন</p>
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- Decorative border -->
<tr><td style="height:4px;background:linear-gradient(90deg,#d4a853,#f0c674,#d4a853);"></td></tr>

<!-- Body content -->
<tr>
<td style="padding:28px 32px;">
  ${body}
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f8faf8;border-top:1px solid #e8efe8;padding:20px 32px;text-align:center;">
  <p style="margin:0 0 6px;color:#1a5632;font-size:14px;font-weight:600;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${siteName}</p>
  <p style="margin:0 0 4px;color:#666;font-size:12px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">এই ইমেইলটি পেয়েছেন কারণ আপনি আমাদের নিউজলেটারে সাবস্ক্রাইব করেছেন।</p>
  <p style="margin:0;color:#999;font-size:11px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">
    <a href="${siteUrl}" style="color:#1a5632;text-decoration:none;">${siteUrl}</a>
  </p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;

// ─── Bengali number converter for email templates ───
const bn = (n: number | string) => toBengaliNumber(n);

// ─── Template generators ───
const makePostBody = (post: any) => `
<h2 style="margin:0 0 12px;color:#1a5632;font-size:20px;border-bottom:2px solid #e8efe8;padding-bottom:10px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${post.title}</h2>
${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" style="max-width:100%;border-radius:8px;margin:12px 0;" />` : ''}
${post.image_caption ? `<p style="margin:0 0 12px;color:#888;font-size:12px;font-style:italic;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${post.image_caption}</p>` : ''}
<p style="color:#444;line-height:1.8;font-size:15px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${post.summary || ''}</p>
${post.author_name ? `<p style="color:#666;font-size:13px;margin:12px 0 0;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">✍️ ${post.author_name}</p>` : ''}
<div style="text-align:center;margin-top:20px;">
  <a href="https://ittehad.bd/post/${post.slug}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#1a5632,#2d7a4f);color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">বিস্তারিত পড়ুন →</a>
</div>`;

const makeNoticeBody = (notice: any) => `
<div style="background:#fffbeb;border-left:4px solid #d4a853;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:16px;">
  <p style="margin:0;color:#92400e;font-size:13px;font-weight:600;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">📋 নোটিশ</p>
</div>
<h2 style="margin:0 0 14px;color:#1a5632;font-size:20px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${notice.title}</h2>
<div style="color:#444;line-height:1.8;font-size:15px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${notice.content || ''}</div>
<div style="text-align:center;margin-top:20px;">
  <a href="https://ittehad.bd/notice/${notice.id}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#1a5632,#2d7a4f);color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">বিস্তারিত দেখুন →</a>
</div>`;

const makeNotificationBody = (notif: any) => `
<div style="background:#ecfdf5;border-left:4px solid #1a5632;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:16px;">
  <p style="margin:0;color:#1a5632;font-size:13px;font-weight:600;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">🔔 বিজ্ঞপ্তি</p>
</div>
<h2 style="margin:0 0 14px;color:#1a5632;font-size:20px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${notif.title}</h2>
<p style="color:#444;line-height:1.8;font-size:15px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${notif.body}</p>`;

const makeJobBody = (job: any, branchName?: string) => `
<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:16px;">
  <p style="margin:0;color:#dc2626;font-size:13px;font-weight:600;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">শিক্ষক নিয়োগ বিজ্ঞপ্তি</p>
</div>
<h2 style="margin:0 0 14px;color:#1a5632;font-size:20px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${job.title}</h2>
${branchName ? `<p style="margin:0 0 12px;color:#1a5632;font-size:14px;font-weight:600;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">প্রতিষ্ঠান: ${branchName}</p>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;border:1px solid #e8efe8;border-radius:8px;overflow:hidden;">
  ${job.location ? `<tr><td style="padding:10px 16px;background:#f8faf8;font-weight:600;color:#1a5632;font-size:14px;border-bottom:1px solid #e8efe8;width:120px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">অবস্থান</td><td style="padding:10px 16px;color:#444;font-size:14px;border-bottom:1px solid #e8efe8;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${job.location}</td></tr>` : ''}
  ${job.salary_range ? `<tr><td style="padding:10px 16px;background:#f8faf8;font-weight:600;color:#1a5632;font-size:14px;border-bottom:1px solid #e8efe8;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">বেতন</td><td style="padding:10px 16px;color:#444;font-size:14px;border-bottom:1px solid #e8efe8;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${job.salary_range}</td></tr>` : ''}
  ${job.qualification_required ? `<tr><td style="padding:10px 16px;background:#f8faf8;font-weight:600;color:#1a5632;font-size:14px;border-bottom:1px solid #e8efe8;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">যোগ্যতা</td><td style="padding:10px 16px;color:#444;font-size:14px;border-bottom:1px solid #e8efe8;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${job.qualification_required}</td></tr>` : ''}
  ${job.deadline ? `<tr><td style="padding:10px 16px;background:#f8faf8;font-weight:600;color:#1a5632;font-size:14px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">শেষ তারিখ</td><td style="padding:10px 16px;color:#dc2626;font-weight:600;font-size:14px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${new Date(job.deadline).toLocaleDateString('bn-BD')}</td></tr>` : ''}
</table>
<div style="color:#444;line-height:1.8;font-size:15px;margin-top:12px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${job.description || ''}</div>
<div style="text-align:center;margin-top:20px;">
  <a href="https://ittehad.bd/job-apply/${job.id}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#1a5632,#2d7a4f);color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">আবেদন করুন →</a>
</div>`;

const makeTeacherBody = (teacher: any) => `
<div style="text-align:center;margin-bottom:16px;">
  ${teacher.photo_url ? `<img src="${teacher.photo_url}" alt="${teacher.name}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #1a5632;margin-bottom:12px;" />` : ''}
  <h2 style="margin:0 0 4px;color:#1a5632;font-size:20px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${teacher.name}</h2>
  <p style="margin:0;color:#666;font-size:14px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${teacher.subject}</p>
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;border:1px solid #e8efe8;border-radius:8px;overflow:hidden;">
  ${teacher.qualification ? `<tr><td style="padding:10px 16px;background:#f8faf8;font-weight:600;color:#1a5632;font-size:14px;border-bottom:1px solid #e8efe8;width:120px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">যোগ্যতা</td><td style="padding:10px 16px;color:#444;font-size:14px;border-bottom:1px solid #e8efe8;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${teacher.qualification}</td></tr>` : ''}
  ${teacher.district ? `<tr><td style="padding:10px 16px;background:#f8faf8;font-weight:600;color:#1a5632;font-size:14px;border-bottom:1px solid #e8efe8;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">জেলা</td><td style="padding:10px 16px;color:#444;font-size:14px;border-bottom:1px solid #e8efe8;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${teacher.district}</td></tr>` : ''}
  ${teacher.experience_years ? `<tr><td style="padding:10px 16px;background:#f8faf8;font-weight:600;color:#1a5632;font-size:14px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">অভিজ্ঞতা</td><td style="padding:10px 16px;color:#444;font-size:14px;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">${bn(teacher.experience_years)} বছর</td></tr>` : ''}
</table>
<div style="text-align:center;margin-top:20px;">
  <a href="https://ittehad.bd/teachers" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#1a5632,#2d7a4f);color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;font-family:'SolaimanLipi','Noto Sans Bengali',sans-serif;">সব শিক্ষক দেখুন →</a>
</div>`;

const AdminSubscribers = () => {
  const { canEdit, canDelete } = useSectionPermissions();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sendOpen, setSendOpen] = useState(false);
  const [contentType, setContentType] = useState<string>("custom");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState("");

  // Site settings for branding
  const { data: siteSettings } = useQuery({
    queryKey: ["site_settings_email"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key, value").in("key", ["site_name", "site_url", "logo_url"]);
      const map: Record<string, string> = {};
      data?.forEach(s => { if (s.value) map[s.key] = s.value; });
      return map;
    },
  });

  const siteName = siteSettings?.site_name || "ইত্তেহাদ";
  const siteUrl = siteSettings?.site_url || "https://ittehad.bd";
  const logoUrl = siteSettings?.logo_url || "";

  // Subscribers
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["admin_subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Content sources
  const { data: posts } = useQuery({
    queryKey: ["admin_sub_posts"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("id, title, summary, slug, image_url, image_caption, author_name").eq("is_published", true).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: notices } = useQuery({
    queryKey: ["admin_sub_notices"],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("id, title, content").eq("is_active", true).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: notifications } = useQuery({
    queryKey: ["admin_sub_notifications"],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("id, title, body").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: jobPostings } = useQuery({
    queryKey: ["admin_sub_jobs"],
    queryFn: async () => {
      const { data } = await supabase.from("job_postings").select("id, title, description, location, salary_range, deadline, qualification_required, branch_id, branches(name)").eq("is_active", true).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: teachers } = useQuery({
    queryKey: ["admin_sub_teachers"],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("id, name, subject, qualification, district, photo_url, experience_years").eq("is_active", true).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const filtered = subscribers?.filter(s => s.email.toLowerCase().includes(search.toLowerCase())) || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("মুছে ফেলা হয়েছে"); qc.invalidateQueries({ queryKey: ["admin_subscribers"] }); },
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(s => s.id)));
  };

  const getSelectedEmails = () => filtered.filter(s => selected.has(s.id)).map(s => s.email);

  const applyContentTemplate = (type: string, id: string) => {
    if (type === "post") {
      const post = posts?.find(p => p.id === id);
      if (post) {
        setEmailSubject(post.title);
        setEmailBody(wrapWithBranding(makePostBody(post), siteName, siteUrl, logoUrl));
      }
    } else if (type === "notice") {
      const notice = notices?.find(n => n.id === id);
      if (notice) {
        setEmailSubject(`নোটিশ: ${notice.title}`);
        setEmailBody(wrapWithBranding(makeNoticeBody(notice), siteName, siteUrl, logoUrl));
      }
    } else if (type === "notification") {
      const notif = notifications?.find(n => n.id === id);
      if (notif) {
        setEmailSubject(notif.title);
        setEmailBody(wrapWithBranding(makeNotificationBody(notif), siteName, siteUrl, logoUrl));
      }
    } else if (type === "job") {
      const job = jobPostings?.find(j => j.id === id);
      if (job) {
        const branchName = (job as any).branches?.name || '';
        setEmailSubject(`শিক্ষক নিয়োগ বিজ্ঞপ্তি: ${job.title}`);
        setEmailBody(wrapWithBranding(makeJobBody(job, branchName), siteName, siteUrl, logoUrl));
      }
    } else if (type === "teacher") {
      const teacher = teachers?.find(t => t.id === id);
      if (teacher) {
        setEmailSubject(`শিক্ষক তথ্য: ${teacher.name}`);
        setEmailBody(wrapWithBranding(makeTeacherBody(teacher), siteName, siteUrl, logoUrl));
      }
    }
  };

  const sendBulkEmail = async () => {
    const emails = getSelectedEmails();
    if (!emails.length) { toast.error("কমপক্ষে একটি ইমেইল সিলেক্ট করুন"); return; }
    if (!emailSubject || !emailBody) { toast.error("সাবজেক্ট ও বডি দিন"); return; }

    // For custom type, wrap with branding
    const finalHtml = contentType === "custom"
      ? wrapWithBranding(emailBody, siteName, siteUrl, logoUrl)
      : emailBody;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { to: emails, subject: emailSubject, html: finalHtml },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`${toBengaliNumber(data.sent)}/${toBengaliNumber(data.total)} ইমেইল পাঠানো হয়েছে!`);
        setSendOpen(false);
        setSelected(new Set());
        setEmailSubject("");
        setEmailBody("");
      } else {
        toast.error(data?.error || "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "ইমেইল পাঠানো ব্যর্থ");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminPageWrapper
      title="নিউজলেটার সাবস্ক্রাইবার"
      icon={Users}
      action={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={selectAll}>
            <CheckSquare size={14} className="mr-1" />
            {selected.size === filtered.length ? "সব বাদ দিন" : "সব সিলেক্ট"}
          </Button>
          {selected.size > 0 && (
            <Button size="sm" onClick={() => setSendOpen(true)}>
              <Send size={14} className="mr-1" />
              মেইল পাঠান ({toBengaliNumber(selected.size)})
            </Button>
          )}
        </div>
      }
    >
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input placeholder="ইমেইল খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={selectAll}
                  />
                </TableHead>
                <TableHead>ইমেইল</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">কোনো সাবস্ক্রাইবার নেই</TableCell></TableRow>
              ) : (
                filtered.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <Checkbox checked={selected.has(sub.id)} onCheckedChange={() => toggleSelect(sub.id)} />
                    </TableCell>
                    <TableCell className="font-medium">{sub.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(sub.created_at).toLocaleDateString("bn-BD")}
                    </TableCell>
                    <TableCell className="text-right">
                      {canDelete && (
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(sub.id)}>
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        মোট সাবস্ক্রাইবার: <strong>{toBengaliNumber(subscribers?.length || 0)}</strong> | সিলেক্টেড: <strong>{toBengaliNumber(selected.size)}</strong>
      </p>

      {/* Send Email Dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail size={18} /> ইমেইল পাঠান ({toBengaliNumber(selected.size)} জনকে)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-1 block font-semibold">কন্টেন্ট টাইপ</Label>
              <Select value={contentType} onValueChange={(v) => { setContentType(v); setSelectedContentId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">কাস্টম HTML</SelectItem>
                  <SelectItem value="post">পোস্ট</SelectItem>
                  <SelectItem value="notice">নোটিশ</SelectItem>
                  <SelectItem value="notification">নোটিফিকেশন</SelectItem>
                  <SelectItem value="job">শিক্ষক নিয়োগ বিজ্ঞপ্তি</SelectItem>
                  <SelectItem value="teacher">শিক্ষক তথ্য</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {contentType !== "custom" && (
              <div>
                <Label className="mb-1 block font-semibold">কন্টেন্ট নির্বাচন করুন</Label>
                <Select value={selectedContentId} onValueChange={(id) => { setSelectedContentId(id); applyContentTemplate(contentType, id); }}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন করুন..." /></SelectTrigger>
                  <SelectContent>
                    {contentType === "post" && posts?.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    {contentType === "notice" && notices?.map(n => <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>)}
                    {contentType === "notification" && notifications?.map(n => <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>)}
                    {contentType === "job" && jobPostings?.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                    {contentType === "teacher" && teachers?.map(t => <SelectItem key={t.id} value={t.id}>{t.name} - {t.subject}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="mb-1 block font-semibold">সাবজেক্ট</Label>
              <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="ইমেইলের বিষয়" />
            </div>

            <div>
              <Label className="mb-1 block font-semibold">বডি (HTML সমর্থিত)</Label>
              <Textarea
                rows={contentType === "custom" ? 12 : 6}
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                placeholder={contentType === "custom" ? "<h2>শিরোনাম</h2><p>আপনার মেসেজ...</p>" : "কন্টেন্ট নির্বাচন করলে স্বয়ংক্রিয়ভাবে তৈরি হবে..."}
              />
              {contentType === "custom" && (
                <p className="text-xs text-muted-foreground mt-1">
                  কাস্টম HTML লিখুন — প্রতিষ্ঠানের হেডার ও ফুটার স্বয়ংক্রিয়ভাবে যুক্ত হবে।
                </p>
              )}
            </div>

            {/* Preview */}
            {emailBody && (
              <div>
                <Label className="mb-1 block font-semibold">প্রিভিউ</Label>
                <div className="border rounded-lg overflow-hidden bg-background max-h-96 overflow-y-auto">
                  <iframe
                    srcDoc={contentType === "custom" ? wrapWithBranding(emailBody, siteName, siteUrl, logoUrl) : emailBody}
                    style={{ width: "100%", minHeight: 300, border: "none" }}
                    title="Email Preview"
                  />
                </div>
              </div>
            )}

            <Button onClick={sendBulkEmail} disabled={sending} className="w-full gap-2">
              <Send size={16} />
              {sending ? "পাঠানো হচ্ছে..." : `${toBengaliNumber(selected.size)} জনকে ইমেইল পাঠান`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
};

export default AdminSubscribers;
