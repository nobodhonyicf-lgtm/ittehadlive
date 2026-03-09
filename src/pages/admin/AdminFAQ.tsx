import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit, Save, X, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useSectionPermissions } from "@/hooks/useSectionPermissions";

export default function AdminFAQ() {
  const { canEdit, canDelete } = useSectionPermissions();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    sort_order: 0,
    is_active: true
  });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["admin_faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const generateFaqs = async () => {
    try {
      setIsGenerating(true);
      toast.info("এআই দিয়ে প্রশ্ন ও উত্তর তৈরি করা হচ্ছে...");
      
      const { data, error } = await supabase.functions.invoke("ai-seo-generate", {
        body: { mode: "faq" }
      });
      
      if (error) throw error;
      
      if (Array.isArray(data)) {
        const faqsToInsert = data.map((item: any, i: number) => ({
          question: item.question,
          answer: item.answer,
          category: item.category || "সাধারণ",
          sort_order: i,
          is_active: true
        }));
        
        const { error: insertError } = await supabase.from("faqs").insert(faqsToInsert);
        if (insertError) throw insertError;
        
        toast.success(`${faqsToInsert.length} টি FAQ সফলভাবে তৈরি করা হয়েছে!`);
        queryClient.invalidateQueries({ queryKey: ["admin_faqs"] });
      } else {
        toast.error("সঠিক ডাটা পাওয়া যায়নি");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("FAQ তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingId && editingId !== "new") {
        const { error } = await supabase.from("faqs").update(data).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("faqs").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("সফলভাবে সংরক্ষণ করা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin_faqs"] });
      setEditingId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "সংরক্ষণ করতে সমস্যা হয়েছে");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("সফলভাবে মুছে ফেলা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin_faqs"] });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase.from("faqs").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_faqs"] });
    }
  });

  const handleEdit = (faq: any) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "",
      sort_order: faq.sort_order || 0,
      is_active: faq.is_active
    });
    setEditingId(faq.id);
  };

  const handleAddNew = () => {
    setFormData({
      question: "",
      answer: "",
      category: "সাধারণ",
      sort_order: (faqs?.length || 0) + 1,
      is_active: true
    });
    setEditingId("new");
  };

  if (isLoading) return <div>লোড হচ্ছে...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">FAQ ব্যবস্থাপনা</h1>
        <div className="flex gap-2">
          {canEdit && (
            <Button onClick={generateFaqs} disabled={isGenerating} variant="outline" className="gap-2">
              <Wand2 size={16} className={isGenerating ? "animate-spin" : ""} />
              এআই দিয়ে তৈরি করুন
            </Button>
          )}
          {canEdit && (
            <Button onClick={handleAddNew} className="gap-2">
              <Plus size={16} /> নতুন যোগ করুন
            </Button>
          )}
        </div>
      </div>

      {editingId && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{editingId === "new" ? "নতুন FAQ" : "FAQ এডিট করুন"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">প্রশ্ন</label>
              <Input 
                value={formData.question} 
                onChange={(e) => setFormData({...formData, question: e.target.value})} 
                placeholder="প্রশ্ন লিখুন"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">উত্তর</label>
              <Textarea 
                value={formData.answer} 
                onChange={(e) => setFormData({...formData, answer: e.target.value})} 
                placeholder="উত্তর লিখুন"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ক্যাটাগরি</label>
                <Input 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  placeholder="যেমন: ভর্তি, শিক্ষা"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ক্রম (Sort Order)</label>
                <Input 
                  type="number"
                  value={formData.sort_order} 
                  onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} 
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.is_active}
                onCheckedChange={(c) => setFormData({...formData, is_active: c})}
              />
              <span className="text-sm font-medium">সক্রিয়</span>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending} className="gap-2">
                <Save size={16} /> সংরক্ষণ করুন
              </Button>
              <Button variant="ghost" onClick={() => setEditingId(null)} className="gap-2 text-muted-foreground">
                <X size={16} /> বাতিল
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {faqs?.map((faq) => (
          <Card key={faq.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                    {faq.category || "সাধারণ"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {canEdit && (
                  <div className="flex items-center gap-2 mr-2">
                    <span className="text-xs text-muted-foreground">সক্রিয়:</span>
                    <Switch 
                      checked={faq.is_active}
                      onCheckedChange={(c) => toggleStatusMutation.mutate({ id: faq.id, is_active: c })}
                    />
                  </div>
                )}
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(faq)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                    <Edit size={18} />
                  </Button>
                )}
                {canDelete && (
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm("আপনি কি নিশ্চিত?")) deleteMutation.mutate(faq.id);
                  }} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 size={18} />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {faqs?.length === 0 && (
          <div className="text-center p-8 text-muted-foreground border rounded-lg">
            কোনো FAQ পাওয়া যায়নি
          </div>
        )}
      </div>
    </div>
  );
}
