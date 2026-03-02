import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import AppLayout from "@/components/app/AppLayout";
import { useIsApp } from "@/hooks/useIsApp";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Calculator, Coins, Building2, Banknote, HandCoins, Minus, Info, RotateCcw } from "lucide-react";

const toBn = (n: number | string) => {
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (x) => d[+x]);
};

const formatBDT = (amount: number) => {
  return toBn(Math.round(amount).toLocaleString("en-IN")) + " ৳";
};

// Current approx nisab values (BDT) - gold 87.48g, silver 612.36g
const GOLD_NISAB_GRAM = 87.48;
const SILVER_NISAB_GRAM = 612.36;
const GOLD_PRICE_PER_GRAM = 10500; // BDT approx
const SILVER_PRICE_PER_GRAM = 120; // BDT approx
const ZAKAT_RATE = 0.025;

interface Field {
  key: string;
  label: string;
  icon: typeof Coins;
  hint: string;
}

const assetFields: Field[] = [
  { key: "cash", label: "নগদ টাকা ও ব্যাংক ব্যালেন্স", icon: Banknote, hint: "হাতে, ব্যাংকে, মোবাইল ব্যাংকিং সব মিলিয়ে" },
  { key: "gold", label: "স্বর্ণের মূল্য", icon: Coins, hint: "সব ধরনের স্বর্ণ — গহনা, বার, কয়েন ইত্যাদি" },
  { key: "silver", label: "রূপার মূল্য", icon: Coins, hint: "রূপার গহনা, বার ইত্যাদি" },
  { key: "investment", label: "বিনিয়োগ ও শেয়ার", icon: Building2, hint: "ফিক্সড ডিপোজিট, শেয়ার, মিউচুয়াল ফান্ড, সঞ্চয়পত্র" },
  { key: "business", label: "ব্যবসায়িক পণ্যের মূল্য", icon: Building2, hint: "বিক্রয়যোগ্য পণ্য, কাঁচামাল, স্টক" },
  { key: "receivable", label: "পাওনা টাকা (ফেরত পাওয়ার সম্ভাবনা আছে)", icon: HandCoins, hint: "ধার দেওয়া টাকা যা ফেরত আসবে" },
  { key: "other", label: "অন্যান্য যাকাতযোগ্য সম্পদ", icon: Coins, hint: "ভাড়ার আয়, রেন্টাল ইনকাম ইত্যাদি" },
];

const debtFields: Field[] = [
  { key: "debt", label: "ঋণ ও দেনা", icon: Minus, hint: "ব্যক্তিগত ঋণ, ব্যাংক লোন, বকেয়া বিল" },
  { key: "expense", label: "তাৎক্ষণিক প্রয়োজনীয় খরচ", icon: Minus, hint: "চলতি মাসের ভাড়া, বিল, প্রয়োজনীয় খরচ" },
];

const ZakatContent = () => {
  const [values, setValues] = useState<Record<string, number>>({});
  const [nisabType, setNisabType] = useState<"gold" | "silver">("silver");

  const handleChange = (key: string, val: string) => {
    const num = parseFloat(val.replace(/,/g, "")) || 0;
    setValues(prev => ({ ...prev, [key]: num }));
  };

  const reset = () => setValues({});

  const totalAssets = useMemo(() => {
    return assetFields.reduce((sum, f) => sum + (values[f.key] || 0), 0);
  }, [values]);

  const totalDebt = useMemo(() => {
    return debtFields.reduce((sum, f) => sum + (values[f.key] || 0), 0);
  }, [values]);

  const zakatableWealth = Math.max(0, totalAssets - totalDebt);

  const nisabAmount = nisabType === "gold"
    ? GOLD_NISAB_GRAM * GOLD_PRICE_PER_GRAM
    : SILVER_NISAB_GRAM * SILVER_PRICE_PER_GRAM;

  const isEligible = zakatableWealth >= nisabAmount;
  const zakatAmount = isEligible ? zakatableWealth * ZAKAT_RATE : 0;

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
        {/* Nisab type selector */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Info size={14} className="text-primary" /> নিসাব নির্ধারণ পদ্ধতি
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setNisabType("silver")}
              className={`p-3 rounded-xl border text-center transition-all text-sm ${nisabType === "silver" ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background"}`}
            >
              <p className="font-bold">রূপার নিসাব</p>
              <p className="text-[10px] opacity-80">{toBn(SILVER_NISAB_GRAM)} গ্রাম = {formatBDT(nisabAmount)}</p>
            </button>
            <button
              onClick={() => setNisabType("gold")}
              className={`p-3 rounded-xl border text-center transition-all text-sm ${nisabType === "gold" ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background"}`}
            >
              <p className="font-bold">স্বর্ণের নিসাব</p>
              <p className="text-[10px] opacity-80">{toBn(GOLD_NISAB_GRAM)} গ্রাম = {formatBDT(GOLD_NISAB_GRAM * GOLD_PRICE_PER_GRAM)}</p>
            </button>
          </div>
        </div>

        {/* Assets */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Coins size={14} /> সম্পদ (Assets)
          </h2>
          <div className="space-y-3">
            {assetFields.map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1">
                  <f.icon size={12} className="text-muted-foreground" /> {f.label}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="০"
                  value={values[f.key] || ""}
                  onChange={e => handleChange(f.key, e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">{f.hint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Debts */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
            <Minus size={14} /> দায় ও ঋণ (Liabilities)
          </h2>
          <div className="space-y-3">
            {debtFields.map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1">
                  <f.icon size={12} className="text-muted-foreground" /> {f.label}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="০"
                  value={values[f.key] || ""}
                  onChange={e => handleChange(f.key, e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">{f.hint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className={`rounded-2xl p-5 text-center border-2 ${isEligible ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700" : "bg-muted border-border"}`}>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>মোট সম্পদ:</span>
              <span className="font-bold">{formatBDT(totalAssets)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>মোট দায়:</span>
              <span className="font-bold text-red-600">− {formatBDT(totalDebt)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-sm">
              <span>যাকাতযোগ্য সম্পদ:</span>
              <span className="font-bold">{formatBDT(zakatableWealth)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>নিসাব ({nisabType === "gold" ? "স্বর্ণ" : "রূপা"}):</span>
              <span className="font-bold">{formatBDT(nisabAmount)}</span>
            </div>
          </div>

          {isEligible ? (
            <div className="bg-emerald-600 text-white rounded-xl p-4">
              <p className="text-xs mb-1">আপনার প্রদেয় যাকাত (২.৫%)</p>
              <p className="text-3xl font-bold">{formatBDT(zakatAmount)}</p>
              <p className="text-[10px] mt-1 opacity-80">আল্লাহ আপনার সম্পদে বরকত দিন</p>
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
          <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5"><Info size={13} /> যাকাত সম্পর্কে জানুন</h3>
          <p>• যাকাত ইসলামের ৫টি স্তম্ভের একটি। নিসাব পরিমাণ সম্পদ এক চান্দ্র বছর জমা থাকলে ২.৫% যাকাত ফরয।</p>
          <p>• স্বর্ণের নিসাব: {toBn(GOLD_NISAB_GRAM)} গ্রাম (সাড়ে ৭ ভরি)। রূপার নিসাব: {toBn(SILVER_NISAB_GRAM)} গ্রাম (সাড়ে ৫২ ভরি)।</p>
          <p>• ব্যক্তিগত ব্যবহারের জিনিস (বাড়ি, গাড়ি, পোশাক) যাকাতযোগ্য নয়।</p>
          <p>• সঠিক হিসাবের জন্য স্থানীয় আলেমের পরামর্শ নিন।</p>
          <p className="text-[10px] italic">⚠️ এই ক্যালকুলেটর একটি সাধারণ গাইডলাইন। চূড়ান্ত সিদ্ধান্তের জন্য বিশ্বস্ত আলেমের সাথে পরামর্শ করুন।</p>
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
  return <Layout><ZakatContent /></Layout>;
};

export default ZakatCalculator;
