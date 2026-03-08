import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useIsApp } from "@/hooks/useIsApp";
import AppLayout from "@/components/app/AppLayout";
import { useIslamicContents, useSiteSettings } from "@/hooks/useData";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ChevronRight, X, Plus, Minus, BookOpen, HelpCircle, Filter, HandHelping, Scale, PenLine, CheckCircle, Languages, Share2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SeasonalIslamicCards } from "@/components/home/SeasonalIslamicCards";

const toBengaliNum = (n: number | string) => {
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (x) => d[+x]);
};

interface ContentItem {
  id: string;
  title: string;
  content: string;
  source?: string | null;
  category: string;
  subcategory?: string | null;
  transliteration?: string | null;
  meaning?: string | null;
  reference?: string | null;
  question?: string | null;
}

// ===== SHARED MODAL =====
const ContentModal = ({ item, onClose, fontSize, category }: { item: ContentItem; onClose: () => void; fontSize: number; category: string }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-card w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <h3 className="font-bold text-base flex-1 pr-3">{item.title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl flex-shrink-0">
          <X size={18} />
        </button>
      </div>
      <div className="overflow-y-auto p-5 space-y-4">
        {/* Q&A format for masala */}
        {item.question && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-xs font-bold text-primary mb-1 flex items-center gap-1"><HelpCircle size={14} /> প্রশ্ন</p>
            <p className="text-sm font-medium">{item.question}</p>
          </div>
        )}

        {/* Arabic content */}
        {item.content && (
          <div>
            {(category === "hadith" || category === "dua" || category === "quran") && (
              <p className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1"><BookOpen size={14} /> আরবি</p>
            )}
            <p className="font-arabic font-bold leading-[2.5] text-right text-foreground" dir="rtl" style={{ fontSize: `${fontSize + 4}px` }}>
              {item.content}
            </p>
          </div>
        )}

        {/* Transliteration */}
        {item.transliteration && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-bold text-muted-foreground mb-1 flex items-center gap-1"><Languages size={14} /> উচ্চারণ</p>
            <p className="text-sm italic text-foreground">{item.transliteration}</p>
          </div>
        )}

        {/* Meaning/Answer */}
        {item.meaning && (
          <div className="border-t border-border pt-3">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
              {category === "masala" ? <><CheckCircle size={14} /> উত্তর</> : <><PenLine size={14} /> অর্থ</>}
            </p>
            <p className="text-sm text-foreground leading-relaxed">{item.meaning}</p>
          </div>
        )}

        {/* Source/Reference */}
        {(item.source || item.reference) && (
          <p className="text-xs text-muted-foreground italic border-t border-border pt-3 flex items-center gap-1">
            <BookOpen size={12} /> সূত্র: {item.reference || item.source}
          </p>
        )}

        {/* Share button */}
        <div className="border-t border-border pt-3">
          <button
            onClick={() => {
              const catLabels: Record<string, string> = { hadith: "হাদিস", dua: "দোয়া", masala: "মাসআলা", quran: "কুরআন" };
              const catLabel = catLabels[category] || category;
              const shareUrl = `https://ittehad.bd/share/islamic/${category}/${item.id}`;
              const shareText = `${catLabel}: ${item.title}\n${item.meaning || item.content?.substring(0, 100) || ""}`;
              if (typeof navigator.share === "function") {
                navigator.share({ title: `${catLabel}: ${item.title}`, text: shareText, url: shareUrl });
              } else {
                navigator.clipboard.writeText(shareUrl);
                toast.success("লিংক কপি হয়েছে!");
              }
            }}
            className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            <Share2 size={14} /> শেয়ার করুন
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ===== WEB: LIST CONTENT =====
const IslamicListContent = ({
  category, title, emoji, gradientClass, description,
}: {
  category: string; title: string; emoji: string; gradientClass: string; description: string;
}) => {
  const { data: allContents } = useIslamicContents();
  const { data: siteSettings } = useSiteSettings();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [activeSubcat, setActiveSubcat] = useState<string>("all");
  const [fontSize, setFontSize] = useState(18);

  const showSeasonal = siteSettings?.["section_seasonal_islamic"] !== "false";

  const items = (allContents as ContentItem[] | undefined)?.filter(c => c.category === category) || [];

  // Auto-open highlighted content from push notification deep link
  useEffect(() => {
    const highlightId = searchParams.get("highlight");
    if (highlightId && items.length > 0 && !selected) {
      const item = items.find(i => i.id === highlightId);
      if (item) setSelected(item);
    }
  }, [searchParams, items, selected]);

  const subcategories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(i => { if (i.subcategory) cats.add(i.subcategory); });
    return Array.from(cats);
  }, [items]);

  const filtered = items.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.content.includes(search) ||
      (c.meaning || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.question || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = activeSubcat === "all" || c.subcategory === activeSubcat;
    return matchSearch && matchCat;
  });

  const isMasala = category === "masala";

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-3">
        <Breadcrumbs items={[{ label: title }]} />
      </div>
      <div className={`bg-gradient-to-br ${gradientClass} text-white p-6 text-center`}>
        <h1 className="text-2xl font-bold mb-1">{emoji} {title}</h1>
        <p className="text-sm opacity-80">{description}</p>
      </div>

      <div className="p-4 space-y-3">
        {showSeasonal && allContents && <SeasonalIslamicCards contents={allContents as any} />}
        {/* Font size + Search row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`${title} খুঁজুন...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-border rounded-xl pl-9 pr-4 py-2.5 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-1 border border-border rounded-xl px-2 py-1 bg-card">
            <button onClick={() => setFontSize(f => Math.max(13, f - 1))} className="p-1 hover:bg-muted rounded"><Minus size={12} /></button>
            <span className="text-xs w-4 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(f => Math.min(28, f + 1))} className="p-1 hover:bg-muted rounded"><Plus size={12} /></button>
          </div>
        </div>

        {/* Subcategory chips */}
        {subcategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveSubcat("all")}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${activeSubcat === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
            >
              সব
            </button>
            {subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubcat(sub)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${activeSubcat === sub ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">মোট {toBengaliNum(filtered.length)}টি {title}</p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">{emoji}</p>
            <p className="text-sm">কোনো কন্টেন্ট পাওয়া যায়নি</p>
            <p className="text-xs mt-1">অ্যাডমিন প্যানেল থেকে {title} যোগ করুন</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item, idx) => (
              <Link
                key={item.id}
                to={`/${category}/${item.id}`}
                className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary hover:shadow-md transition-all active:scale-[0.99] block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex-shrink-0">
                        {toBengaliNum(idx + 1)}
                      </span>
                      {item.subcategory && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                          {item.subcategory}
                        </span>
                      )}
                      <p className="text-sm font-bold truncate">{item.title}</p>
                    </div>

                    {/* Q&A for masala */}
                    {isMasala && item.question ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.question}</p>
                    ) : (
                      <p className="font-arabic font-bold text-right leading-[2] line-clamp-2" dir="rtl" style={{ fontSize: `${fontSize}px` }}>
                        {item.content}
                      </p>
                    )}

                    {item.meaning && (
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 flex items-center gap-1"><PenLine size={10} /> {item.meaning}</p>
                    )}
                    {item.source && (
                      <p className="text-[11px] text-muted-foreground mt-1 text-right italic">— {item.source}</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== APP: PROFESSIONAL ISLAMIC PAGE =====
const AppIslamicListContent = ({
  category, title, emoji, gradientClass, description,
}: {
  category: string; title: string; emoji: string; gradientClass: string; description: string;
}) => {
  const { data: allContents } = useIslamicContents();
  const { data: siteSettings } = useSiteSettings();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [activeSubcat, setActiveSubcat] = useState<string>("all");
  const [fontSize, setFontSize] = useState(17);

  const showSeasonal = siteSettings?.["section_seasonal_islamic"] !== "false";

  const items = (allContents as ContentItem[] | undefined)?.filter(c => c.category === category) || [];

  // Auto-open highlighted content from push notification deep link
  useEffect(() => {
    const highlightId = searchParams.get("highlight");
    if (highlightId && items.length > 0 && !selected) {
      const item = items.find(i => i.id === highlightId);
      if (item) setSelected(item);
    }
  }, [searchParams, items, selected]);

  const subcategories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(i => { if (i.subcategory) cats.add(i.subcategory); });
    return Array.from(cats);
  }, [items]);

  const filtered = items.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.content.includes(search) ||
      (c.meaning || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.question || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = activeSubcat === "all" || c.subcategory === activeSubcat;
    return matchSearch && matchCat;
  });

  const isMasala = category === "masala";

  return (
    <div className="min-h-screen bg-background">
      {/* App-style gradient header with pattern */}
      <div className={`bg-gradient-to-br ${gradientClass} text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
        }} />
        <div className="relative p-5 pb-6">
          <div className="text-3xl mb-2">{emoji}</div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-xs opacity-75 mt-0.5">{description}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs bg-white/20 rounded-full px-3 py-1">
              {toBengaliNum(items.length)}টি {title}
            </span>
          </div>
        </div>
      </div>

      {/* Search + controls */}
      <div className="px-3 py-3 bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="flex gap-2 items-center mb-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`${title} খুঁজুন...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-border rounded-xl pl-8 pr-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-0.5 border border-border rounded-xl px-2 py-1.5 bg-background">
            <button onClick={() => setFontSize(f => Math.max(13, f - 1))} className="p-0.5 hover:bg-muted rounded"><Minus size={11} /></button>
            <span className="text-[10px] w-4 text-center font-bold">{fontSize}</span>
            <button onClick={() => setFontSize(f => Math.min(26, f + 1))} className="p-0.5 hover:bg-muted rounded"><Plus size={11} /></button>
          </div>
        </div>

        {/* Subcategory chips */}
        {subcategories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveSubcat("all")}
              className={`flex-shrink-0 text-[11px] px-3 py-1 rounded-full border transition-colors ${activeSubcat === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground bg-background"}`}
            >
              সব
            </button>
            {subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubcat(sub)}
                className={`flex-shrink-0 text-[11px] px-3 py-1 rounded-full border transition-colors ${activeSubcat === sub ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground bg-background"}`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content list */}
      <div className="p-3 space-y-2 pb-20">
        {showSeasonal && allContents && <SeasonalIslamicCards contents={allContents as any} isApp />}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">{emoji}</p>
            <p className="text-sm font-medium">কোনো কন্টেন্ট পাওয়া যায়নি</p>
            <p className="text-xs mt-1 opacity-70">অ্যাডমিন প্যানেল থেকে {title} যোগ করুন</p>
          </div>
        ) : (
          filtered.map((item, idx) => (
            <Link
              key={item.id}
              to={`/${category}/${item.id}`}
              className="w-full text-left bg-card border border-border/60 rounded-2xl overflow-hidden active:scale-[0.98] transition-all shadow-sm block"
            >
              {/* Top accent bar */}
              <div className={`h-0.5 w-full bg-gradient-to-r ${gradientClass}`} />
              <div className="p-3.5">
                <div className="flex items-start gap-2.5">
                  {/* Number badge */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br ${gradientClass} text-white text-[11px] font-bold flex items-center justify-center mt-0.5`}>
                    {toBengaliNum(idx + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <p className="text-sm font-bold leading-tight">{item.title}</p>
                      {item.subcategory && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {item.subcategory}
                        </span>
                      )}
                    </div>

                    {isMasala && item.question ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.question}</p>
                    ) : (
                      <p className="font-arabic font-bold text-right leading-[2] line-clamp-2 text-foreground" dir="rtl" style={{ fontSize: `${fontSize}px` }}>
                        {item.content}
                      </p>
                    )}

                    {item.meaning && (
                      <p className="text-[9px] text-muted-foreground mt-1 line-clamp-1 flex items-center gap-0.5"><PenLine size={9} /> {item.meaning}</p>
                    )}
                    {item.source && (
                      <p className="text-[10px] text-muted-foreground mt-1 text-right italic">— {item.source}</p>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

// ===== FACTORY =====
const makeIslamicPage = (
  category: string, title: string, emoji: string, gradientClass: string, description: string
) => {
  return function IslamicPage() {
    const isApp = useIsApp();
    if (isApp) {
      return (
        <AppLayout>
          <AppIslamicListContent category={category} title={title} emoji={emoji} gradientClass={gradientClass} description={description} />
        </AppLayout>
      );
    }
    return (
      <Layout>
        <SEOHead title={title} description={description} keywords={`${title}, ইসলাম, ইসলামী, ${category}, বাংলা`} />
        <IslamicListContent category={category} title={title} emoji={emoji} gradientClass={gradientClass} description={description} />
      </Layout>
    );
  };
};

// HadithPage is now in its own file: src/pages/HadithPage.tsx
export const DuaPage = makeIslamicPage("dua", "দোয়া", "🤲", "from-indigo-800 to-purple-700", "বিষয়ভিত্তিক দোয়া ও আমল — আরবি, উচ্চারণ ও অর্থসহ");
export const MasalaPage = makeIslamicPage("masala", "মাসআলা", "⚖", "from-rose-800 to-red-700", "ইসলামী মাসআলা ও ফিকহ — প্রশ্নোত্তর ও বিষয়ভিত্তিক");
