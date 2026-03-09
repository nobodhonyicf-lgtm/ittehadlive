import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { useIsApp } from "@/hooks/useIsApp";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Search, CheckCircle, XCircle, Clock, Building2, GraduationCap, FileText, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toBengaliNumber } from "@/lib/bengali";

type VerifyType = "branch" | "result" | "certificate" | "teacher";
type VerifyStatus = "idle" | "searching" | "valid" | "invalid" | "pending" | "expired";

interface VerifyResult {
  status: VerifyStatus;
  data?: any;
  message?: string;
}

const statusConfig: Record<VerifyStatus, { icon: any; color: string; label: string }> = {
  idle: { icon: Search, color: "", label: "" },
  searching: { icon: Loader2, color: "", label: "অনুসন্ধান করা হচ্ছে..." },
  valid: { icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200", label: "যাচাইকৃত ✓" },
  invalid: { icon: XCircle, color: "text-red-600 bg-red-50 border-red-200", label: "যাচাই ব্যর্থ" },
  pending: { icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200", label: "অপেক্ষমান" },
  expired: { icon: XCircle, color: "text-gray-600 bg-gray-50 border-gray-200", label: "মেয়াদ উত্তীর্ণ" },
};

const verifyTypes: { key: VerifyType; label: string; icon: any; placeholder: string; description: string }[] = [
  { key: "branch", label: "শাখা যাচাই", icon: Building2, placeholder: "শাখা কোড লিখুন (যেমন: BR-001)", description: "ইত্তেহাদের অধিভুক্ত শাখার তথ্য যাচাই করুন।" },
  { key: "result", label: "রেজাল্ট যাচাই", icon: GraduationCap, placeholder: "রোল নম্বর বা রেজিস্ট্রেশন নম্বর", description: "পরীক্ষার ফলাফলের সত্যতা যাচাই করুন।" },
  { key: "certificate", label: "সনদ যাচাই", icon: FileText, placeholder: "সনদ/সার্টিফিকেট নম্বর", description: "প্রদত্ত সনদপত্রের সত্যতা যাচাই করুন।" },
  { key: "teacher", label: "শিক্ষক যাচাই", icon: User, placeholder: "শিক্ষক আইডি বা ফোন নম্বর", description: "নিবন্ধিত শিক্ষকের তথ্য যাচাই করুন।" },
];

const VerifyHub = () => {
  const isApp = useIsApp();
  const [searchParams] = useSearchParams();
  const defaultTab = (searchParams.get("type") as VerifyType) || "branch";
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState<VerifyResult>({ status: "idle" });

  const handleVerify = async (type: VerifyType) => {
    if (!searchQuery.trim()) return;
    setResult({ status: "searching" });

    try {
      if (type === "branch") {
        const { data } = await supabase
          .from("branches")
          .select("id, name, code, address, district, status, is_active, head_name, created_at")
          .or(`code.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
          .limit(1)
          .maybeSingle();

        if (data) {
          setResult({
            status: data.is_active ? "valid" : "pending",
            data,
            message: data.is_active
              ? `"${data.name}" ইত্তেহাদের অধিভুক্ত একটি সক্রিয় শাখা।`
              : `"${data.name}" বর্তমানে নিষ্ক্রিয় বা অনুমোদনাধীন।`,
          });
        } else {
          setResult({ status: "invalid", message: "এই কোড/নামে কোনো শাখা পাওয়া যায়নি। সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।" });
        }
      } else if (type === "teacher") {
        const { data } = await supabase
          .from("teachers")
          .select("id, name, subject, district, is_verified, is_active, photo_url, qualification")
          .or(`phone.eq.${searchQuery},name.ilike.%${searchQuery}%`)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        if (data) {
          setResult({
            status: data.is_verified ? "valid" : "pending",
            data,
            message: data.is_verified
              ? `"${data.name}" একজন যাচাইকৃত নিবন্ধিত শিক্ষক।`
              : `"${data.name}" নিবন্ধিত আছেন, তবে যাচাই প্রক্রিয়া চলমান।`,
          });
        } else {
          setResult({ status: "invalid", message: "এই তথ্যে কোনো নিবন্ধিত শিক্ষক পাওয়া যায়নি।" });
        }
      } else {
        // Result & certificate verification - placeholder
        setResult({
          status: "invalid",
          message: "এই ফিচারটি শীঘ্রই চালু হবে। অনুগ্রহ করে অফিসে যোগাযোগ করুন।",
        });
      }
    } catch {
      setResult({ status: "invalid", message: "অনুসন্ধানে সমস্যা হয়েছে। আবার চেষ্টা করুন।" });
    }
  };

  const resetSearch = () => {
    setSearchQuery("");
    setResult({ status: "idle" });
  };

  const PageContent = () => (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <SEOHead
        title="যাচাই কেন্দ্র | ইত্তেহাদুল মাদারিস"
        description="শাখা, রেজাল্ট, সনদ এবং শিক্ষকের তথ্য যাচাই করুন। ইত্তেহাদের অফিসিয়াল ভেরিফিকেশন সিস্টেম।"
      />

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">যাচাই কেন্দ্র</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          ইত্তেহাদুল মাদারিসের অধিভুক্ত শাখা, শিক্ষক, রেজাল্ট ও সনদপত্রের সত্যতা যাচাই করুন।
        </p>
      </div>

      <Tabs defaultValue={defaultTab} onValueChange={resetSearch}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6">
          {verifyTypes.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs md:text-sm gap-1">
              <t.icon size={14} />
              {t.label.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {verifyTypes.map((t) => (
          <TabsContent key={t.key} value={t.key}>
            <Card className="border shadow-sm">
              <CardContent className="p-5 md:p-6">
                <p className="text-sm text-muted-foreground mb-4">{t.description}</p>
                <div className="flex gap-2">
                  <Input
                    placeholder={t.placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify(t.key)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleVerify(t.key)}
                    disabled={!searchQuery.trim() || result.status === "searching"}
                    className="gap-1.5 shrink-0"
                  >
                    {result.status === "searching" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Search size={16} />
                    )}
                    যাচাই
                  </Button>
                </div>

                {/* Results */}
                {result.status !== "idle" && result.status !== "searching" && (
                  <div className={`mt-6 p-4 rounded-xl border ${statusConfig[result.status].color} animate-in fade-in duration-300`}>
                    <div className="flex items-start gap-3">
                      {(() => {
                        const Icon = statusConfig[result.status].icon;
                        return <Icon size={24} className="shrink-0 mt-0.5" />;
                      })()}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{statusConfig[result.status].label}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {new Date().toLocaleDateString("bn-BD")}
                          </Badge>
                        </div>
                        <p className="text-sm">{result.message}</p>

                        {/* Valid branch details */}
                        {result.data && t.key === "branch" && result.status === "valid" && (
                          <div className="mt-3 pt-3 border-t border-current/10 grid grid-cols-2 gap-2 text-xs">
                            <div><span className="opacity-60">শাখা কোড:</span> <strong>{result.data.code || "—"}</strong></div>
                            <div><span className="opacity-60">জেলা:</span> <strong>{result.data.district || "—"}</strong></div>
                            <div><span className="opacity-60">প্রধান:</span> <strong>{result.data.head_name || "—"}</strong></div>
                            <div><span className="opacity-60">ঠিকানা:</span> <strong>{result.data.address || "—"}</strong></div>
                          </div>
                        )}

                        {/* Valid teacher details */}
                        {result.data && t.key === "teacher" && result.status === "valid" && (
                          <div className="mt-3 pt-3 border-t border-current/10 grid grid-cols-2 gap-2 text-xs">
                            <div><span className="opacity-60">বিষয়:</span> <strong>{result.data.subject}</strong></div>
                            <div><span className="opacity-60">জেলা:</span> <strong>{result.data.district || "—"}</strong></div>
                            <div><span className="opacity-60">যোগ্যতা:</span> <strong>{result.data.qualification || "—"}</strong></div>
                            <div><span className="opacity-60">স্ট্যাটাস:</span> <strong>{result.data.is_verified ? "যাচাইকৃত" : "অপেক্ষমান"}</strong></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 text-right">
                      <Button variant="ghost" size="sm" onClick={resetSearch} className="text-xs">নতুন অনুসন্ধান</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Trust indicators */}
      <div className="mt-8 grid grid-cols-3 gap-3 text-center">
        {[
          { icon: Shield, label: "নিরাপদ যাচাই", desc: "এনক্রিপ্টেড" },
          { icon: CheckCircle, label: "অফিসিয়াল", desc: "প্রাতিষ্ঠানিক" },
          { icon: Clock, label: "তাৎক্ষণিক", desc: "রিয়েল-টাইম" },
        ].map((item) => (
          <div key={item.label} className="p-3 rounded-xl bg-muted/50">
            <item.icon size={18} className="text-primary mx-auto mb-1" />
            <p className="text-xs font-medium">{item.label}</p>
            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return isApp ? <AppLayout><PageContent /></AppLayout> : <Layout><PageContent /></Layout>;
};

export default VerifyHub;
