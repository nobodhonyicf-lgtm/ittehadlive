import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Bell, Send, Users, Trash2, ImagePlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminPushNotifications = () => {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const { data: subCount } = useQuery({
    queryKey: ["push_sub_count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("push_subscriptions")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: history } = useQuery({
    queryKey: ["push_history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("category", "push")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { data: notif, error: insertErr } = await supabase
        .from("notifications")
        .insert({
          title,
          body,
          link: url || null,
          image_url: imageUrl || null,
          category: "push",
          target: "all",
          is_sent: false,
        })
        .select()
        .single();
      if (insertErr) throw insertErr;

      // Fetch app icon for push notification
      const { data: iconSetting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "app_icon_url")
        .maybeSingle();

      const { data, error } = await supabase.functions.invoke("send-push", {
        body: { title, body, url, icon: iconSetting?.value || undefined, image: imageUrl || undefined, notificationId: notif.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`পুশ নোটিফিকেশন পাঠানো হয়েছে! (${data.sent}/${data.total} সফল)`);
      setTitle("");
      setBody("");
      setUrl("");
      setImageUrl("");
      qc.invalidateQueries({ queryKey: ["push_history"] });
    },
    onError: (err: any) => {
      toast.error("পাঠানো ব্যর্থ: " + err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("নোটিফিকেশন ডিলিট করা হয়েছে");
      qc.invalidateQueries({ queryKey: ["push_history"] });
    },
    onError: (err: any) => {
      toast.error("ডিলিট ব্যর্থ: " + err.message);
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <Bell size={22} /> পুশ নোটিফিকেশন
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={18} /> সাবস্ক্রাইবার
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{subCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">জন পুশ নোটিফিকেশন সাবস্ক্রাইব করেছে</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send size={18} /> নতুন পুশ নোটিফিকেশন পাঠান
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>শিরোনাম *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="নোটিফিকেশনের শিরোনাম" />
          </div>
          <div>
            <Label>বিস্তারিত *</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="নোটিফিকেশনের বিস্তারিত" rows={3} />
          </div>
          <div>
            <Label>লিংক (ঐচ্ছিক)</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/notices বা https://..." />
          </div>
          <div>
            <Label className="flex items-center gap-1"><ImagePlus size={14} /> ছবি URL (ঐচ্ছিক)</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
            <p className="text-[11px] text-muted-foreground mt-1">নোটিফিকেশনে বড় ছবি দেখাবে (Android/Chrome)</p>
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border max-w-xs">
                <img src={imageUrl} alt="Preview" className="w-full h-auto max-h-32 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={!title || !body || sendMutation.isPending}
          >
            {sendMutation.isPending ? "পাঠানো হচ্ছে..." : "পুশ নোটিফিকেশন পাঠান"}
          </Button>
        </CardContent>
      </Card>

      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">সাম্প্রতিক পুশ নোটিফিকেশন</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((n) => (
                <div key={n.id} className="p-3 bg-muted rounded flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                    {n.image_url && (
                      <img src={n.image_url} alt="" className="mt-2 rounded-md max-w-[200px] h-auto max-h-20 object-cover" />
                    )}
                  </div>
                  <div className="flex items-start gap-2 ml-4">
                    <div className="text-xs text-muted-foreground whitespace-nowrap text-right">
                      {n.is_sent ? "পাঠানো হয়েছে" : "অপেক্ষমাণ"}
                      <br />
                      {new Date(n.created_at).toLocaleDateString("bn-BD")}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>নোটিফিকেশন ডিলিট করুন</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{n.title}" নোটিফিকেশনটি ডিলিট করতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(n.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            ডিলিট করুন
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPushNotifications;
