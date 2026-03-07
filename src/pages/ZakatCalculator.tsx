import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import AppLayout from "@/components/app/AppLayout";
import { useIsApp } from "@/hooks/useIsApp";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Calculator, Coins, Building2, Banknote, HandCoins, Minus, Info, RotateCcw, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const toBn = (n: number | string) => {
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (x) => d[+x]);
};

const formatBDT = (amount: number) => {
  return toBn(Math.round(amount).toLocaleString("en-IN")) + " ৳";
};

const ZAKAT_RATE = 0.025;

// Default nisab (silver-based: 612.36g × approx market rate)
// Will be overridden by site_settings if available
const DEFAULT_NISAB_BDT = 228375;
const DEFAULT_NISAB_DATE = "২৮/০২/২০২৬";

interface Field {
  key: string;
  label: string;
  hint: string;
  step?: number;
}

const step1Fields: Field[] = [
  { key: "gold", label: "১। আপনার মালিকানাধীন মোট স্বর্ণের বর্তমান বিক্রয় মূল্য", hint: "গহনা, বার, কয়েন সব ধরনের স্বর্ণ" },
  { key: "silver", label: "২। আপনার মালিকানাধীন মোট রৌপ্যের বর্তমান বিক্রয় মূল্য", hint: "রূপার গহনা, বার ইত্যাদি" },
  { key: "cash", label: "৩। নিজের কাছে রাখা নগদ অর্থ", hint: "হজ, বিবাহ, গৃহ-নির্মাণ ইত্যাদি যে উদ্দেশ্যেই রাখা হোক" },
  { key: "foreign_currency", label: "৪। বৈদেশিক মুদ্রার বিক্রয় মূল্য", hint: "ডলার, রিয়াল, পাউন্ড ইত্যাদি" },
  { key: "bank", label: "৫। ব্যাংক বা আর্থিক প্রতিষ্ঠানে জমাকৃত অর্থ", hint: "সুদ বাদ দিয়ে মূল অংশ" },
  { key: "savings_cert", label: "৬। সঞ্চয়পত্র, বন্ড, ডিবেঞ্চার ও ট্রেজারি বিল", hint: "প্রকৃত ক্রয় মূল্য" },
  { key: "insurance", label: "৭। ফেরতযোগ্য বীমা পলিসিতে জমাকৃত প্রিমিয়াম", hint: "ফেরতযোগ্য অংশ" },
  { key: "provident", label: "৮। ঐচ্ছিক প্রভিডেন্ট ফান্ডে জমানো অর্থ", hint: "বাধ্যতামূলক অংশ বাদ দিয়ে" },
  { key: "receivable", label: "৯। প্রদত্ত ঋণের সম্পূর্ণ অর্থ (ফেরত পাওয়ার সম্ভাবনা আছে)", hint: "ঋণগ্রহীতা স্বীকার করে ও আদায়ের ওয়াদা দিয়েছে" },
  { key: "deposit", label: "১০। আমানত হিসেবে কারো কাছে রাখা টাকা", hint: "বিশ্বস্ত ব্যক্তির কাছে গচ্ছিত" },
  { key: "security_money", label: "১১। সিকিউরিটি মানি / জামানত", hint: "ভাড়ার সিকিউরিটি ও অন্যান্য ফেরতযোগ্য জামানত" },
  { key: "business_cash", label: "১২। ব্যবসার নগদ টাকা", hint: "ব্যাংক/ড্রয়ার/আলমারিতে রক্ষিত ব্যবসার নগদ" },
  { key: "business_receivable", label: "১৩। ব্যবসায়িক পণ্য বিক্রিবাবদ বকেয়া মূল্য", hint: "ক্রেতাদের থেকে পাওনা" },
  { key: "business_stock", label: "১৪। বিক্রয়ের উদ্দেশ্যে স্টকে রাখা পণ্যের মূল্য", hint: "রেডি পণ্য, কাঁচামাল, প্রক্রিয়াধীন পণ্য" },
  { key: "trading_assets", label: "১৫। লাভে বিক্রয়ের উদ্দেশ্যে ক্রয়কৃত সম্পদের বিক্রয় মূল্য", hint: "জমি, প্লট, ফ্ল্যাট, গাড়ি ইত্যাদি (বিক্রির ইচ্ছা বিদ্যমান)" },
  { key: "partnership", label: "১৬। মুদারাবা / অংশীদারি কারবারে যাকাতযোগ্য অংশ", hint: "নিজের মালিকানার আনুপাতিক অংশ" },
  { key: "shares_capital", label: "১৭। শেয়ার মার্কেট — Capital Gain শেয়ারের বাজারমূল্য", hint: "লাভে বিক্রয়ের উদ্দেশ্যে ক্রয়কৃত শেয়ার" },
  { key: "shares_dividend", label: "১৮। শেয়ার মার্কেট — Dividend শেয়ারের যাকাতযোগ্য সম্পদ", hint: "বাৎসরিক মুনাফা অর্জনের উদ্দেশ্যে ক্রয়কৃত শেয়ার" },
  { key: "other", label: "১৯। অন্যান্য যাকাতযোগ্য সম্পদ", hint: "উপরে উল্লেখ হয়নি এমন যাকাতযোগ্য সম্পদ" },
];

const step2Fields: Field[] = [
  { key: "personal_debt", label: "১। ব্যক্তিগত ঋণ / দেনা", hint: "ব্যাংক লোন, ব্যক্তিগত ঋণ, বকেয়া বিল" },
  { key: "business_debt", label: "২। ব্যবসায়িক ঋণ / দেনা", hint: "ব্যবসায়িক ঋণ, সরবরাহকারীদের বকেয়া" },
  { key: "expense", label: "৩। তাৎক্ষণিক প্রয়োজনীয় খরচ", hint: "চলতি মাসের ভাড়া, বিল, প্রয়োজনীয় খরচ" },
  { key: "installment", label: "৪। চলতি কিস্তি বকেয়া", hint: "যাকাত বর্ষ পূর্তির দিন পর্যন্ত বকেয়া কিস্তি" },
  { key: "advance_salary", label: "৫। অগ্রিম বেতন / ভাতা ফেরতযোগ্য", hint: "যা ফেরত দিতে হবে" },
  { key: "other_debt", label: "৬। অন্যান্য দায় / দেনা", hint: "উপরে উল্লেখ হয়নি এমন দায়" },
];

const ZakatContent = () => {
  const [values, setValues] = useState<Record<string, number>>({});
  const [step, setStep] = useState(1);
  const [nisabAmount, setNisabAmount] = useState(DEFAULT_NISAB_BDT);
  const [nisabDate, setNisabDate] = useState(DEFAULT_NISAB_DATE);

  // Try to fetch nisab from site_settings
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

  const reset = () => { setValues({}); setStep(1); };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-3">
        <Breadcrumbs items={[{ label: "যাকাত ক্যালকুলেটর" }]} />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-700 text-white p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
        }} />
        <div className="relative">
          <Calculator size={36} className="mx-auto mb-2" />
          <h1 className="text-2xl font-bold mb-1">যাকাত ক্যালকুলেটর</h1>
          <p className="text-sm opacity-80">আপনার সম্পদের উপর যাকাত হিসাব করুন সহজেই</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-5">
        {/* Nisab display */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center">
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-1">যাকাতের নিসাব</p>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{formatBDT(nisabAmount)}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1">সর্বশেষ হালনাগাদ {nisabDate}</p>
        </div>

        {/* Info note */}
        <div className="bg-card border border-border rounded-2xl p-4 text-xs text-muted-foreground">
          <p>যে সকল সম্পদ আপনার নেই সেগুলো পূরণ করার প্রয়োজন নেই, খালি রাখুন। আপনার যদি শুধু স্বর্ণ থাকে (নগদ বা ব্যবসা পণ্য ছাড়া) তাহলে ৭.৫ ভরি হলে যাকাত ফরয। শুধু রূপা থাকলে ৫২.৫ ভরি হলে যাকাত ফরয।</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${step === 1 ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground"}`}
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">১</span>
            সম্পদ
          </button>
          <ArrowRight size={16} className="text-muted-foreground" />
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${step === 2 ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground"}`}
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">২</span>
            দায়
          </button>
        </div>

        {/* Fields */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            {step === 1 ? (
              <><Coins size={14} className="text-emerald-600" /> ধাপ ১: যাকাতযোগ্য সম্পদ</>
            ) : (
              <><Minus size={14} className="text-red-600" /> ধাপ ২: দায় ও ঋণ</>
            )}
          </h2>
          <div className="space-y-4">
            {currentFields.map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium text-foreground mb-1 block">{f.label}</label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="০"
                    value={values[f.key] || ""}
                    onChange={e => handleChange(f.key, e.target.value)}
                    className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{f.hint}</p>
              </div>
            ))}
          </div>

          {/* Step navigation */}
          <div className="flex justify-between mt-5">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                <ChevronLeft size={14} /> পূর্ববর্তী ধাপ
              </button>
            )}
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium ml-auto hover:opacity-90 transition-opacity"
              >
                পরবর্তী ধাপ <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Running totals */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>মোট সম্পদ (ধাপ ১):</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatBDT(totalAssets)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>মোট দায় (ধাপ ২):</span>
            <span className="font-bold text-red-600">− {formatBDT(totalDebt)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm">
            <span>যাকাতযোগ্য সম্পদ:</span>
            <span className="font-bold">{formatBDT(zakatableWealth)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>নিসাব:</span>
            <span className="font-bold">{formatBDT(nisabAmount)}</span>
          </div>
        </div>

        {/* Result */}
        <div className={`rounded-2xl p-5 text-center border-2 ${isEligible ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700" : "bg-muted border-border"}`}>
          {isEligible ? (
            <div className="bg-emerald-600 text-white rounded-xl p-5">
              <p className="text-xs mb-1">আপনার প্রদেয় যাকাত (২.৫%)</p>
              <p className="text-4xl font-bold">{formatBDT(zakatAmount)}</p>
              <p className="text-[10px] mt-2 opacity-80">আল্লাহ আপনার সম্পদে বরকত দিন</p>
            </div>
          ) : (
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm text-muted-foreground">আপনার সম্পদ নিসাব পরিমাণে পৌঁছায়নি।</p>
              <p className="text-xs text-muted-foreground mt-1">যাকাত ওয়াজিব নয়।</p>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="bg-card border border-border rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5"><Info size={13} /> গুরুত্বপূর্ণ তথ্য</h3>
          <p>• যাকাত ইসলামের ৫টি স্তম্ভের একটি। নিসাব পরিমাণ সম্পদ এক চান্দ্র বছর জমা থাকলে ২.৫% যাকাত ফরয।</p>
          <p>• ব্যক্তিগত ব্যবহারের জিনিস (বাড়ি, গাড়ি, পোশাক) যাকাতযোগ্য নয়।</p>
          <p>• এই ক্যালকুলেটর একটি সাধারণ গাইডলাইন। চূড়ান্ত সিদ্ধান্তের জন্য বিশ্বস্ত আলেমের সাথে পরামর্শ করুন।</p>
          <p className="text-[10px] italic mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">⚠️ সতর্কতা: যাকাত একটি ফরয ইবাদত। সূক্ষ ও যথাযথভাবে যাকাত হিসাব করা প্রত্যেকের কর্তব্য। এই ক্যালকুলেটর সহায়তাকারী মাত্র, চূড়ান্ত নির্ভুল হিসাবের নিশ্চয়তা প্রদানকারী নয়।</p>
        </div>

        {/* Reset button */}
        <button
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <RotateCcw size={14} /> রিসেট করুন
        </button>
      </div>
    </div>
  );
};

const ZakatCalculator = () => {
  const isApp = useIsApp();
  if (isApp) {
    return <AppLayout><ZakatContent /></AppLayout>;
  }
  return <Layout><SEOHead title="যাকাত ক্যালকুলেটর" description="ইসলামী যাকাত হিসাব করুন — স্বর্ণ, রৌপ্য, নগদ ও সম্পদের ওপর যাকাত নির্ণয় করুন।" keywords="যাকাত, ক্যালকুলেটর, ইসলাম, হিসাব" /><ZakatContent /></Layout>;
};

export default ZakatCalculator;
