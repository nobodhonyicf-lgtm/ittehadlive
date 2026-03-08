import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import AppLayout from "@/components/app/AppLayout";
import { useIsApp } from "@/hooks/useIsApp";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Calculator, Info, RotateCcw, ChevronRight, ChevronLeft, Printer } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toBengali } from "@/lib/bengali";
import GoldSilverCalculator from "@/components/zakat/GoldSilverCalculator";
import { step1Fields, step2Fields } from "@/components/zakat/zakatFields";

const formatBDT = (amount: number) => {
  return "৳ " + toBengali(Math.round(amount).toLocaleString("en-IN"));
};

const ZAKAT_RATE = 0.025;
const DEFAULT_NISAB_BDT = 228375;
const DEFAULT_NISAB_DATE = "২৮/০২/২০২৬";

const ZakatContent = () => {
  const [values, setValues] = useState<Record<string, number>>({});
  const [step, setStep] = useState(1);
  const [nisabAmount, setNisabAmount] = useState(DEFAULT_NISAB_BDT);
  const [nisabDate, setNisabDate] = useState(DEFAULT_NISAB_DATE);
  const [zakatYearType, setZakatYearType] = useState("");
  const [zakatYearDate, setZakatYearDate] = useState("");
  const [calcModal, setCalcModal] = useState<"gold" | "silver" | null>(null);

  useEffect(() => {
    const fetchNisab = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["zakat_nisab_amount", "zakat_nisab_date"]);
      if (data) {
        const nisabVal = data.find(d => d.key === "zakat_nisab_amount");
        const nisabDt = data.find(d => d.key === "zakat_nisab_date");
        if (nisabVal?.value) setNisabAmount(Number(nisabVal.value));
        if (nisabDt?.value) setNisabDate(nisabDt.value);
      }
    };
    fetchNisab();
  }, []);

  const handleChange = (key: string, val: string) => {
    const num = parseFloat(val.replace(/,/g, "")) || 0;
    setValues(prev => ({ ...prev, [key]: num }));
  };

  const reset = () => { setValues({}); setStep(1); setZakatYearType(""); setZakatYearDate(""); };

  const totalAssets = useMemo(() => {
    return step1Fields.reduce((sum, f) => sum + (values[f.key] || 0), 0);
  }, [values]);

  const totalDebt = useMemo(() => {
    return step2Fields.reduce((sum, f) => sum + (values[f.key] || 0), 0);
  }, [values]);

  const zakatableWealth = Math.max(0, totalAssets - totalDebt);
  const isEligible = zakatableWealth >= nisabAmount;
  const zakatAmount = isEligible ? zakatableWealth * ZAKAT_RATE : 0;

  const currentFields = step === 1 ? step1Fields : step2Fields;

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-3 print:hidden">
        <Breadcrumbs items={[{ label: "যাকাত ক্যালকুলেটর" }]} />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-700 text-white p-6 md:p-10 text-center relative overflow-hidden print:bg-white print:text-foreground">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
        }} />
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">আপনার যাকাত সহজেই হিসাব করুন</h1>
          <p className="text-sm md:text-base opacity-90 leading-relaxed">
            আপনার যাকাতের হিসাব বের করার জন্য ধারাবাহিকভাবে সংশ্লিষ্ট ঘরগুলো বুঝে যত্নের সাথে পূরণ করুন, কোনো বিষয় না বুঝে পূরণ করবেন না। এতে যাকাতের প্রকৃত হিসাব করা সম্ভব হবে না।
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Form */}
          <div className="flex-1 space-y-5">
            {/* Info note */}
            <div className="bg-muted/50 border border-border rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
              যে সকল সম্পদ আপনার নেই এবং যে সকল প্রশ্ন আপনার ক্ষেত্রে প্রযোজ্য হবে না সেগুলো পূরণ করার প্রয়োজন নেই, অর্থাৎ সেগুলো সম্পূর্ণ খালি রাখবেন। আপনার যদি নগদ অর্থ বা ব্যবসা পণ্য না থাকে, শুধু স্বর্ণ অথবা শুধু রুপা থাকে—তাহলে আপনার জন্য এই ক্যালকুলেটর প্রযোজ্য নয়। শুধু স্বর্ণের ক্ষেত্রে ৭.৫ ভরি এবং শুধু রুপার ক্ষেত্রে ৫২.৫ ভরি থাকলে যাকাত ফরয হবে।
            </div>

            {/* Step header + indicator */}
            <div>
              <h2 className="text-lg font-bold text-primary mb-3">
                {step === 1 ? "ধাপ ১, যাকাতযোগ্য সম্পদ" : "ধাপ ২, দায় ও দেনা"}
              </h2>
              <div className="flex items-center gap-0">
                <button
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-l-xl text-sm font-bold transition-all border ${
                    step === 1
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step === 1 ? "bg-white/20" : "bg-muted-foreground/20"
                  }`}>১</span>
                  স্টেপ ১
                </button>
                <button
                  onClick={() => setStep(2)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-r-xl text-sm font-bold transition-all border border-l-0 ${
                    step === 2
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step === 2 ? "bg-white/20" : "bg-muted-foreground/20"
                  }`}>২</span>
                  স্টেপ ২
                </button>
              </div>
            </div>

            {/* Zakat Year fields (step 1 only) */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Zakat year type */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    যাকাত বর্ষের ধরণ: <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={zakatYearType}
                    onChange={e => { setZakatYearType(e.target.value); setZakatYearDate(""); }}
                    required
                    className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="hijri">হিজরি ক্যালেন্ডার</option>
                    <option value="english">ইংরেজি ক্যালেন্ডার</option>
                  </select>
                </div>

                {/* Zakat year completion date */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    যে তারিখে আপনার যাকাত বর্ষ পূর্ণ হবে: <span className="text-destructive">*</span>
                  </label>
                  {zakatYearType === "hijri" ? (
                    <div className="flex gap-2">
                      <select
                        value={zakatYearDate.split("-")[2] || ""}
                        onChange={e => {
                          const parts = (zakatYearDate || "--").split("-");
                          setZakatYearDate(`${parts[0] || ""}-${parts[1] || ""}-${e.target.value}`);
                        }}
                        className="flex-1 border border-border rounded-xl px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">দিন</option>
                        {Array.from({ length: 30 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1)}>{toBengali(i + 1)}</option>
                        ))}
                      </select>
                      <select
                        value={zakatYearDate.split("-")[1] || ""}
                        onChange={e => {
                          const parts = (zakatYearDate || "--").split("-");
                          setZakatYearDate(`${parts[0] || ""}-${e.target.value}-${parts[2] || ""}`);
                        }}
                        className="flex-1 border border-border rounded-xl px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">মাস</option>
                        {["মুহাররম","সফর","রবিউল আউয়াল","রবিউস সানি","জমাদিউল আউয়াল","জমাদিউস সানি","রজব","শাবান","রমজান","শাওয়াল","জিলক্বদ","জিলহজ্জ"].map((m, i) => (
                          <option key={i} value={String(i + 1)}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={zakatYearDate.split("-")[0] || ""}
                        onChange={e => {
                          const parts = (zakatYearDate || "--").split("-");
                          setZakatYearDate(`${e.target.value}-${parts[1] || ""}-${parts[2] || ""}`);
                        }}
                        className="flex-1 border border-border rounded-xl px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">বছর</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const y = 1446 + i;
                          return <option key={y} value={String(y)}>{toBengali(y)}</option>;
                        })}
                      </select>
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={zakatYearDate}
                      onChange={e => setZakatYearDate(e.target.value)}
                      required
                      className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-5">
              {currentFields.map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-foreground mb-1.5 block leading-relaxed">
                    {f.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="০"
                      value={values[f.key] || ""}
                      onChange={e => handleChange(f.key, e.target.value)}
                      className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">৳</span>
                  </div>
                  {f.hasCalculator && (
                    <button
                      onClick={() => setCalcModal(f.hasCalculator!)}
                      className="mt-1.5 inline-block text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-lg transition-colors"
                    >
                      👉 আজকের মূল্য হিসাব করতে এখানে ক্লিক করুন
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Step navigation */}
            <div className="flex justify-between pt-2 print:hidden">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <ChevronLeft size={14} /> পূর্ববর্তী ধাপে যান
                </button>
              )}
                {step === 1 && (
                <button
                  onClick={() => {
                    if (!zakatYearType || !zakatYearDate) {
                      alert("যাকাত বর্ষের ধরণ এবং যাকাত বর্ষ পূর্ণ হওয়ার তারিখ পূরণ করা আবশ্যক।");
                      return;
                    }
                    setStep(2);
                  }}
                  className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium ml-auto hover:opacity-90 transition-opacity"
                >
                  পরবর্তী ধাপে যান <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:w-80 space-y-5">
            {/* Nisab card */}
            <div className="bg-card border border-border rounded-2xl p-5 text-center sticky top-4">
              <h3 className="text-sm font-bold text-foreground mb-2">যাকাতের নিসাব</h3>
              <p className="text-3xl font-bold text-primary">{formatBDT(nisabAmount)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">সর্বশেষ হালনাগাদ {nisabDate}</p>
            </div>

            {/* Running totals */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">মোট সম্পদ:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatBDT(totalAssets)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">মোট দায়:</span>
                <span className="font-bold text-red-600">− {formatBDT(totalDebt)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">নিট যাকাতযোগ্য সম্পদ:</span>
                <span className="font-bold text-foreground">{formatBDT(zakatableWealth)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">নিসাব:</span>
                <span className="font-bold text-foreground">{formatBDT(nisabAmount)}</span>
              </div>

              {/* Result */}
              <div className="border-t border-border pt-3">
                {isEligible ? (
                  <div className="bg-emerald-700 text-white rounded-xl p-4 text-center">
                    <p className="text-xs mb-1 opacity-90">আপনার প্রদেয় যাকাত (২.৫%)</p>
                    <p className="text-3xl font-bold">{formatBDT(zakatAmount)}</p>
                    {zakatYearType === "hijri" && (
                      <p className="text-[10px] mt-1 opacity-70">হিজরি বর্ষ অনুসারে</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-sm text-muted-foreground">আপনার সম্পদ নিসাব পরিমাণে পৌঁছায়নি।</p>
                    <p className="text-xs text-muted-foreground mt-1">যাকাত ওয়াজিব নয়।</p>
                  </div>
                )}
              </div>
            </div>

            {/* Important info */}
            <div className="bg-card border border-border rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <Info size={13} /> এই ফরম সম্পর্কে কিছু জরুরি বিষয়:
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>এই ফরম এর কোন তথ্য সংরক্ষণ কিংবা পর্যবেক্ষণ করা হয়না।</li>
                <li>ব্যক্তিগত ও সীমিত আকারের ব্যবসায়িক হিসাবের জন্য এই ফরমই যথেষ্ট হবে ইনশাআল্লাহ। তবে যাদের পরিস্থিতি এর চেয়ে ভিন্নতর (যেমন - একাধিক, ব্যাপক আকারের ব্যবসা) তাদের জন্য পরামর্শ থাকবে সরাসরি নির্ভরযোগ্য আলেমের তত্ত্বাবধানে যাকাত হিসাব করার।</li>
                <li>নিজের কাছে রাখার জন্য ফরম পূরণ করার পর প্রিন্ট করে নিতে পারেন। প্রিন্টার না থাকলে প্রিন্ট অপশনে গিয়ে PDF হিসেবেও সংরক্ষণ করতে পারবেন।</li>
                <li>সবশেষে, প্রিন্টেড বা PDF ফরমটি একজন আলেমকে দিয়ে নিরীক্ষণ করিয়ে নিতে পারলে ভালো হয়।</li>
              </ul>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200">
              <h3 className="font-bold text-sm mb-1">⚠️ সতর্কতাবাণী:</h3>
              <p className="leading-relaxed">
                যাকাত একটি ফরয ইবাদত। সূক্ষ্ম ও যথাযথভাবে যাকাত হিসাব করা যাকাত প্রদানকারী প্রত্যেকের কর্তব্য। এই ওয়েবসাইটটি যাকাত হিসাব কার্যে সহায়তাকারী মাত্র। এটি চূড়ান্ত নির্ভুল হিসাবের নিশ্চয়তা প্রদানকারী নয়। চূড়ান্তভাবে সঠিক হিসাবের জন্য একজন অভিজ্ঞ মুফতি সাহেবের শরণাপন্ন হওয়ার পরামর্শ দেওয়া হচ্ছে।
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <Printer size={14} /> প্রিন্ট / PDF
              </button>
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <RotateCcw size={14} /> রিসেট
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gold/Silver Calculator Modal */}
      {calcModal && (
        <GoldSilverCalculator
          type={calcModal}
          onConfirm={(total) => {
            setValues(prev => ({ ...prev, [calcModal]: total }));
            setCalcModal(null);
          }}
          onClose={() => setCalcModal(null)}
        />
      )}
    </div>
  );
};

const ZakatCalculator = () => {
  const isApp = useIsApp();
  if (isApp) {
    return <AppLayout><ZakatContent /></AppLayout>;
  }
  return (
    <Layout>
      <SEOHead
        title="যাকাত ক্যালকুলেটর"
        description="ইসলামী যাকাত হিসাব করুন — স্বর্ণ, রৌপ্য, নগদ ও সম্পদের ওপর যাকাত নির্ণয় করুন।"
        keywords="যাকাত, ক্যালকুলেটর, ইসলাম, হিসাব"
      />
      <ZakatContent />
    </Layout>
  );
};

export default ZakatCalculator;
