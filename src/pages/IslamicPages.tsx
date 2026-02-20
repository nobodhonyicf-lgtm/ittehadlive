import Layout from "@/components/layout/Layout";
import { useIsApp } from "@/hooks/useIsApp";
import AppLayout from "@/components/app/AppLayout";
import { useIslamicContents } from "@/hooks/useData";
import { useState } from "react";
import { Search, ChevronRight, X } from "lucide-react";

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
}

const ContentModal = ({ item, onClose }: { item: ContentItem; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-bold text-base">{item.title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl">
          <X size={18} />
        </button>
      </div>
      <div className="overflow-y-auto p-5 space-y-4">
        <p className="font-arabic text-2xl font-bold leading-[2.5] text-right" dir="rtl">
          {item.content}
        </p>
        {item.source && (
          <p className="text-sm text-muted-foreground italic text-right border-t border-border pt-3">— {item.source}</p>
        )}
      </div>
    </div>
  </div>
);

interface IslamicListContentProps {
  category: string;
  title: string;
  emoji: string;
  gradientClass: string;
  description: string;
}

const IslamicListContent = ({ category, title, emoji, gradientClass, description }: IslamicListContentProps) => {
  const { data: allContents } = useIslamicContents();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContentItem | null>(null);

  const items = allContents?.filter(c => c.category === category) || [];
  const filtered = items.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.content.includes(search)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className={`bg-gradient-to-br ${gradientClass} text-white p-6 text-center`}>
        <h1 className="text-2xl font-bold mb-1">{emoji} {title}</h1>
        <p className="text-sm opacity-80">{description}</p>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={`${title} খুঁজুন...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-border rounded-xl pl-9 pr-4 py-2.5 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

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
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        {toBengaliNum(idx + 1)}
                      </span>
                      <p className="text-sm font-bold truncate">{item.title}</p>
                    </div>
                    <p className="font-arabic text-lg font-bold text-right leading-[2] line-clamp-2" dir="rtl">
                      {item.content}
                    </p>
                    {item.source && (
                      <p className="text-[11px] text-muted-foreground mt-1 text-right italic">— {item.source}</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && <ContentModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

const makeIslamicPage = (category: string, title: string, emoji: string, gradientClass: string, description: string) => {
  return function IslamicPage() {
    const isApp = useIsApp();
    const content = <IslamicListContent category={category} title={title} emoji={emoji} gradientClass={gradientClass} description={description} />;
    if (isApp) return <AppLayout>{content}</AppLayout>;
    return <Layout>{content}</Layout>;
  };
};

export const HadithPage = makeIslamicPage("hadith", "হাদিস", "📿", "from-sky-800 to-blue-700", "নবীজি ﷺ এর বাণী ও সুন্নাহ");
export const DuaPage = makeIslamicPage("dua", "দোয়া", "🤲", "from-indigo-800 to-purple-700", "বিষয়ভিত্তিক দোয়া ও আমল — আরবি ও বাংলা অর্থসহ");
export const MasalaPage = makeIslamicPage("masala", "মাসআলা", "⚖️", "from-rose-800 to-red-700", "ইসলামী মাসআলা ও ফিকহ");
