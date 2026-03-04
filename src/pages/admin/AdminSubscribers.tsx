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

  // Content sources for email body
  const { data: posts } = useQuery({
    queryKey: ["admin_sub_posts"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("id, title, summary, slug, image_url").eq("is_published", true).order("created_at", { ascending: false }).limit(20);
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
      const { data } = await supabase.from("job_postings").select("id, title, description, location, salary_range, deadline").eq("is_active", true).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: teachers } = useQuery({
    queryKey: ["admin_sub_teachers"],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("id, name, subject, qualification, district, photo_url").eq("is_active", true).order("created_at", { ascending: false }).limit(20);
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
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(s => s.id)));
    }
  };

  const getSelectedEmails = () => {
    return filtered.filter(s => selected.has(s.id)).map(s => s.email);
  };

  const applyContentTemplate = (type: string, id: string) => {
    if (type === "post") {
      const post = posts?.find(p => p.id === id);
      if (post) {
        setEmailSubject(post.title);
        setEmailBody(`
<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a5632; border-bottom: 2px solid #1a5632; padding-bottom: 10px;">${post.title}</h2>
  ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" style="max-width: 100%; border-radius: 8px; margin: 10px 0;" />` : ''}
  <p style="color: #555; line-height: 1.6;">${post.summary || ''}</p>
  <a href="https://ittehad.bd/post/${post.slug}" style="display: inline-block; padding: 10px 24px; background: #1a5632; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px;">বিস্তারিত পড়ুন</a>
</div>`);
      }
    } else if (type === "notice") {
      const notice = notices?.find(n => n.id === id);
      if (notice) {
        setEmailSubject(`নোটিশ: ${notice.title}`);
        setEmailBody(`
<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a5632; border-bottom: 2px solid #1a5632; padding-bottom: 10px;">📋 ${notice.title}</h2>
  <div style="color: #555; line-height: 1.6;">${notice.content || ''}</div>
  <a href="https://ittehad.bd/notice/${notice.id}" style="display: inline-block; padding: 10px 24px; background: #1a5632; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px;">বিস্তারিত দেখুন</a>
</div>`);
      }
    } else if (type === "notification") {
      const notif = notifications?.find(n => n.id === id);
      if (notif) {
        setEmailSubject(notif.title);
        setEmailBody(`
<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a5632;">${notif.title}</h2>
  <p style="color: #555; line-height: 1.6;">${notif.body}</p>
</div>`);
      }
    } else if (type === "job") {
      const job = jobPostings?.find(j => j.id === id);
      if (job) {
        setEmailSubject(`শিক্ষক নিয়োগ বিজ্ঞপ্তি: ${job.title}`);
        setEmailBody(`
<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a5632; border-bottom: 2px solid #1a5632; padding-bottom: 10px;">📢 ${job.title}</h2>
  ${job.location ? `<p><strong>অবস্থান:</strong> ${job.location}</p>` : ''}
  ${job.salary_range ? `<p><strong>বেতন:</strong> ${job.salary_range}</p>` : ''}
  ${job.deadline ? `<p><strong>শেষ তারিখ:</strong> ${job.deadline}</p>` : ''}
  <div style="color: #555; line-height: 1.6; margin-top: 10px;">${job.description || ''}</div>
  <a href="https://ittehad.bd/job-apply/${job.id}" style="display: inline-block; padding: 10px 24px; background: #1a5632; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px;">আবেদন করুন</a>
</div>`);
      }
    } else if (type === "teacher") {
      const teacher = teachers?.find(t => t.id === id);
      if (teacher) {
        setEmailSubject(`শিক্ষক তথ্য: ${teacher.name}`);
        setEmailBody(`
<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a5632;">👨‍🏫 ${teacher.name}</h2>
  ${teacher.photo_url ? `<img src="${teacher.photo_url}" alt="${teacher.name}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 10px 0;" />` : ''}
  <p><strong>বিষয়:</strong> ${teacher.subject}</p>
  ${teacher.qualification ? `<p><strong>যোগ্যতা:</strong> ${teacher.qualification}</p>` : ''}
  ${teacher.district ? `<p><strong>জেলা:</strong> ${teacher.district}</p>` : ''}
  <a href="https://ittehad.bd/teachers" style="display: inline-block; padding: 10px 24px; background: #1a5632; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px;">সব শিক্ষক দেখুন</a>
</div>`);
      }
    }
  };

  const [selectedContentId, setSelectedContentId] = useState("");

  const sendBulkEmail = async () => {
    const emails = getSelectedEmails();
    if (!emails.length) { toast.error("কমপক্ষে একটি ইমেইল সিলেক্ট করুন"); return; }
    if (!emailSubject || !emailBody) { toast.error("সাবজেক্ট ও বডি দিন"); return; }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { to: emails, subject: emailSubject, html: emailBody },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`${data.sent}/${data.total} ইমেইল পাঠানো হয়েছে!`);
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
              মেইল পাঠান ({selected.size})
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
                      <Checkbox
                        checked={selected.has(sub.id)}
                        onCheckedChange={() => toggleSelect(sub.id)}
                      />
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
        মোট সাবস্ক্রাইবার: <strong>{subscribers?.length || 0}</strong> | সিলেক্টেড: <strong>{selected.size}</strong>
      </p>

      {/* Send Email Dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail size={18} /> ইমেইল পাঠান ({selected.size} জনকে)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Content type selector */}
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

            {/* Content selector for non-custom */}
            {contentType !== "custom" && (
              <div>
                <Label className="mb-1 block font-semibold">কন্টেন্ট নির্বাচন করুন</Label>
                <Select value={selectedContentId} onValueChange={(id) => { setSelectedContentId(id); applyContentTemplate(contentType, id); }}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন করুন..." /></SelectTrigger>
                  <SelectContent>
                    {contentType === "post" && posts?.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                    {contentType === "notice" && notices?.map(n => (
                      <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>
                    ))}
                    {contentType === "notification" && notifications?.map(n => (
                      <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>
                    ))}
                    {contentType === "job" && jobPostings?.map(j => (
                      <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                    ))}
                    {contentType === "teacher" && teachers?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name} - {t.subject}</SelectItem>
                    ))}
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
                rows={12}
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                placeholder="<h2>শিরোনাম</h2><p>আপনার মেসেজ...</p>"
              />
              <p className="text-xs text-muted-foreground mt-1">
                HTML ট্যাগ ব্যবহার করতে পারেন: &lt;h2&gt;, &lt;p&gt;, &lt;img&gt;, &lt;a&gt; ইত্যাদি
              </p>
            </div>

            {/* Preview */}
            {emailBody && (
              <div>
                <Label className="mb-1 block font-semibold">প্রিভিউ</Label>
                <div className="border rounded-lg p-4 bg-background max-h-60 overflow-y-auto" dangerouslySetInnerHTML={{ __html: emailBody }} />
              </div>
            )}

            <Button onClick={sendBulkEmail} disabled={sending} className="w-full gap-2">
              <Send size={16} />
              {sending ? "পাঠানো হচ্ছে..." : `${selected.size} জনকে ইমেইল পাঠান`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  );
};

export default AdminSubscribers;
