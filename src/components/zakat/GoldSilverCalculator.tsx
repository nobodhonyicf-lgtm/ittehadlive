import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toBengali } from "@/lib/bengali";

type UnitType = "gram" | "vori" | "ana";
type CaratType = "22" | "21" | "18" | "traditional";

const BAJUS_URL = "https://www.bajus.org/gold-price";

// Approximate BDT per gram by carat (will be shown as reference)
const GOLD_RATE_PER_GRAM: Record<CaratType, number> = {
  "22": 10342,
  "21": 9880,
  "18": 8467,
  "traditional": 7583,
};

const SILVER_RATE_PER_GRAM = 165; // approx BDT per gram

const UNIT_TO_GRAM: Record<UnitType, number> = {
  gram: 1,
  vori: 11.664,
  ana: 0.7290,
};

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
      const rate = isGold ? GOLD_RATE_PER_GRAM[item.carat] : SILVER_RATE_PER_GRAM;
      // BAJUS sells at market rate, we use 80% for selling price
      return sum + Math.round(grams * rate * 0.80);
    }, 0);
  };

  const total = calculateTotal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">
            আজকের মূল্য হিসাব করুন
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* BAJUS reference */}
          <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground">
            <p>
              {isGold ? "স্বর্ণ" : "রৌপ্য"} এবং রূপার বর্তমান বাজার মূল্য{" "}
              <a href={BAJUS_URL} target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline">
                বাজুসের ওয়েবসাইট
              </a>{" "}
              থেকে নেওয়া। বাজার মূল্যের ৮০% ধরে আমরা আনুমানিক বিক্রয় মূল্য হিসাব করেছি।
            </p>
          </div>

          {/* Items */}
          {items.map((item, idx) => (
            <div key={item.id} className="border border-border rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {isGold ? "গহনা" : "রৌপ্য"} #{toBengali(idx + 1)}
                </span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} className="text-destructive p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">গহনার নাম:</label>
                <input
                  type="text"
                  placeholder="লিখুন"
                  value={item.name}
                  onChange={e => updateItem(item.id, "name", e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Amount + Unit */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">পরিমাণ:</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="০"
                    value={item.amount || ""}
                    onChange={e => updateItem(item.id, "amount", parseFloat(e.target.value) || 0)}
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">একক:</label>
                  <select
                    value={item.unit}
                    onChange={e => updateItem(item.id, "unit", e.target.value)}
                    className="w-full border border-border rounded-lg px-2 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="gram">গ্রাম</option>
                    <option value="vori">ভরি/তোলা</option>
                    <option value="ana">আনা</option>
                  </select>
                </div>

                {/* Carat (gold only) */}
                {isGold && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">ক্যারেট:</label>
                    <select
                      value={item.carat}
                      onChange={e => updateItem(item.id, "carat", e.target.value)}
                      className="w-full border border-border rounded-lg px-2 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="22">২২</option>
                      <option value="21">২১</option>
                      <option value="18">১৮</option>
                      <option value="traditional">সনাতনী</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add more */}
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-primary text-sm font-medium hover:underline"
          >
            <Plus size={14} /> আরও যোগ করুন
          </button>

          {/* Total */}
          <div className="text-center text-sm text-muted-foreground">
            আপনার মালিকানাধীন মোট {isGold ? "স্বর্ণের" : "রৌপ্যের"} বর্তমান বিক্রয় মূল্য:{" "}
            <span className="font-bold text-foreground">
              {toBengali(Math.round(total).toLocaleString("en-IN"))} (টাকা)
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
