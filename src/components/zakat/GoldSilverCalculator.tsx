import { useState, useEffect } from "react";
import { X, Plus, Trash2, RefreshCw } from "lucide-react";
import { toBengali } from "@/lib/bengali";
import { supabase } from "@/integrations/supabase/client";

type UnitType = "gram" | "vori" | "ana" | "tola";
type CaratType = "22" | "21" | "18" | "traditional";

const BAJUS_URL = "https://www.bajus.org/gold-price";

// Fallback rates (will be overridden by live data)
const DEFAULT_GOLD_RATE: Record<CaratType, number> = {
  "22": 22995,
  "21": 21950,
  "18": 18815,
  "traditional": 15360,
};

const DEFAULT_SILVER_RATE: Record<CaratType, number> = {
  "22": 560,
  "21": 535,
  "18": 460,
  "traditional": 345,
};

const UNIT_TO_GRAM: Record<UnitType, number> = {
  gram: 1,
  vori: 11.664,
  ana: 0.7290,
  tola: 11.664,
};

const SELLING_RATE = 0.83; // 83% of market price

interface JewelryItem {
  id: number;
  name: string;
  amount: number;
  unit: UnitType;
  carat: CaratType;
}

interface Props {
  type: "gold" | "silver";
  onConfirm: (totalBDT: number) => void;
  onClose: () => void;
}

const GoldSilverCalculator = ({ type, onConfirm, onClose }: Props) => {
  const isGold = type === "gold";
  const [items, setItems] = useState<JewelryItem[]>([
    { id: 1, name: "", amount: 0, unit: "gram", carat: "22" },
  ]);
  const [goldRates, setGoldRates] = useState(DEFAULT_GOLD_RATE);
  const [silverRates, setSilverRates] = useState(DEFAULT_SILVER_RATE);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [
          "bajus_gold_22k", "bajus_gold_21k", "bajus_gold_18k", "bajus_gold_traditional",
          "bajus_silver_22k", "bajus_silver_21k", "bajus_silver_18k", "bajus_silver_traditional",
          "bajus_last_updated",
        ]);

      if (data && data.length > 0) {
        const get = (k: string) => {
          const found = data.find(d => d.key === k);
          return found?.value ? Number(found.value) : 0;
        };

        const g22 = get("bajus_gold_22k");
        if (g22 > 0) {
          setGoldRates({
            "22": g22,
            "21": get("bajus_gold_21k") || DEFAULT_GOLD_RATE["21"],
            "18": get("bajus_gold_18k") || DEFAULT_GOLD_RATE["18"],
            "traditional": get("bajus_gold_traditional") || DEFAULT_GOLD_RATE["traditional"],
          });
        }

        const s22 = get("bajus_silver_22k");
        if (s22 > 0) {
          setSilverRates({
            "22": s22,
            "21": get("bajus_silver_21k") || DEFAULT_SILVER_RATE["21"],
            "18": get("bajus_silver_18k") || DEFAULT_SILVER_RATE["18"],
            "traditional": get("bajus_silver_traditional") || DEFAULT_SILVER_RATE["traditional"],
          });
        }

        const updated = data.find(d => d.key === "bajus_last_updated");
        if (updated?.value) {
          const d = new Date(updated.value);
          setLastUpdated(d.toLocaleDateString("bn-BD"));
        }
      }
      setLoading(false);
    };
    fetchRates();
  }, []);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), name: "", amount: 0, unit: "gram", carat: "22" }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: number, field: keyof JewelryItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const grams = item.amount * UNIT_TO_GRAM[item.unit];
      const rate = isGold ? goldRates[item.carat] : silverRates[item.carat];
      return sum + Math.round(grams * rate * SELLING_RATE);
    }, 0);
  };

  const total = calculateTotal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-xl font-bold text-foreground">
            আজকের মূল্য হিসাব করুন
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* BAJUS reference */}
          <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              {isGold ? "স্বর্ণ" : "রৌপ্য"} এবং রূপার বর্তমান বাজার মূল্য{" "}
              <a href={BAJUS_URL} target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline">
                বাজুসের ওয়েবসাইট
              </a>{" "}
              থেকে অটো সিংক করা। বাজার মূল্যের ৮৩% ধরে আমরা আনুমানিক বিক্রয় মূল্য হিসাব করেছি।
              {lastUpdated && (
                <span className="block mt-1 text-xs">
                  <RefreshCw size={10} className="inline mr-1" />
                  সর্বশেষ আপডেট: {lastUpdated}
                </span>
              )}
            </p>
          </div>

          {/* Rate display */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {isGold ? (
              <>
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2 text-center">
                  <span className="font-bold">২২ ক্যারেট:</span> ৳{toBengali(goldRates["22"].toLocaleString("en-IN"))}/গ্রাম
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2 text-center">
                  <span className="font-bold">২১ ক্যারেট:</span> ৳{toBengali(goldRates["21"].toLocaleString("en-IN"))}/গ্রাম
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2 text-center">
                  <span className="font-bold">১৮ ক্যারেট:</span> ৳{toBengali(goldRates["18"].toLocaleString("en-IN"))}/গ্রাম
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2 text-center">
                  <span className="font-bold">সনাতনী:</span> ৳{toBengali(goldRates["traditional"].toLocaleString("en-IN"))}/গ্রাম
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-100 dark:bg-gray-800/30 rounded-lg p-2 text-center">
                  <span className="font-bold">২২ ক্যারেট:</span> ৳{toBengali(silverRates["22"].toLocaleString("en-IN"))}/গ্রাম
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/30 rounded-lg p-2 text-center">
                  <span className="font-bold">২১ ক্যারেট:</span> ৳{toBengali(silverRates["21"].toLocaleString("en-IN"))}/গ্রাম
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/30 rounded-lg p-2 text-center">
                  <span className="font-bold">১৮ ক্যারেট:</span> ৳{toBengali(silverRates["18"].toLocaleString("en-IN"))}/গ্রাম
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/30 rounded-lg p-2 text-center">
                  <span className="font-bold">সনাতনী:</span> ৳{toBengali(silverRates["traditional"].toLocaleString("en-IN"))}/গ্রাম
                </div>
              </>
            )}
          </div>

          {/* Items */}
          {items.map((item, idx) => (
            <div key={item.id} className="space-y-3">
              {idx > 0 && <hr className="border-border" />}
              
              <div className="flex items-center justify-between">
                {items.length > 1 && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {isGold ? "গহনা" : "রৌপ্য"} #{toBengali(idx + 1)}
                  </span>
                )}
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} className="text-destructive p-1 hover:bg-destructive/10 rounded">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Row 1: Name */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">গহনার নাম:</label>
                <input
                  type="text"
                  placeholder="লিখুন"
                  value={item.name}
                  onChange={e => updateItem(item.id, "name", e.target.value)}
                  className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Row 2: Amount + Carat side by side */}
              <div className={`grid gap-4 ${isGold ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {/* Amount + Unit */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">পরিমাণ:</label>
                  <div className="flex">
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="০"
                      value={item.amount || ""}
                      onChange={e => updateItem(item.id, "amount", parseFloat(e.target.value) || 0)}
                      className="flex-1 border border-border rounded-l-xl px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary border-r-0 min-w-0"
                    />
                    <select
                      value={item.unit}
                      onChange={e => updateItem(item.id, "unit", e.target.value)}
                      className="border border-border rounded-r-xl px-2 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[80px]"
                    >
                      <option value="gram">গ্রাম</option>
                      <option value="vori">ভরি</option>
                      <option value="ana">আনা</option>
                      <option value="tola">তোলা</option>
                    </select>
                  </div>
                </div>

                {/* Carat */}
                {isGold && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">ক্যারেট:</label>
                    <div className="flex">
                      <span className="border border-border rounded-l-xl px-3 py-2.5 bg-muted text-sm text-muted-foreground border-r-0 whitespace-nowrap">ক্যারেট</span>
                      <select
                        value={item.carat}
                        onChange={e => updateItem(item.id, "carat", e.target.value)}
                        className="flex-1 border border-border rounded-r-xl px-2 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="22">২২</option>
                        <option value="21">২১</option>
                        <option value="18">১৮</option>
                        <option value="traditional">সনাতনী</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add more */}
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-primary text-sm font-medium hover:underline border border-primary/30 rounded-xl px-4 py-2"
          >
            <Plus size={14} /> আরও যোগ করুন
          </button>

          {/* Total */}
          <div className="text-center text-sm text-foreground pt-2">
            আপনার মালিকানাধীন মোট {isGold ? "স্বর্ণের" : "রৌপ্যের"} বর্তমান বিক্রয় মূল্য:{" "}
            <span className="font-bold">
              ৳{toBengali(Math.round(total).toLocaleString("en-IN"))} (টাকা)
            </span>
          </div>

          {/* Confirm */}
          <button
            onClick={() => onConfirm(total)}
            className="w-full py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-800 transition-colors"
          >
            বিক্রয় মূল্য নিশ্চিত করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoldSilverCalculator;
