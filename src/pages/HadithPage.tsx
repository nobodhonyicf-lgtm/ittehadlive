import Layout from "@/components/layout/Layout";
import { useIsApp } from "@/hooks/useIsApp";
import AppLayout from "@/components/app/AppLayout";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, Plus, Minus, Loader2, Copy, Share2, Check, BookOpen } from "lucide-react";
import { translateSectionName } from "@/lib/hadithSectionsBn";

const toBengaliNum = (n: number | string) => {
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (x) => d[+x]);
};

const GRADE_MAP: Record<string, string> = {
  "sahih": "সহীহ",
  "hasan": "হাসান",
  "hasan sahih": "হাসান সহীহ",
  "da'if": "দুর্বল (যঈফ)",
  "daif": "দুর্বল (যঈফ)",
  "maudu": "জাল (মওযু)",
  "maudu'": "জাল (মওযু)",
  "munkar": "মুনকার",
  "mursal": "মুরসাল",
  "isnad sahih": "সনদ সহীহ",
  "isnad hasan": "সনদ হাসান",
};

const getBengaliGrade = (grade: string) => {
  if (!grade) return "";
  const lower = grade.toLowerCase().trim();
  for (const [key, val] of Object.entries(GRADE_MAP)) {
    if (lower.includes(key)) return val;
  }
  return grade;
};

const HADITH_BOOKS = [
  { id: "ben-bukhari", arabicId: "ara-bukhari", name: "সহীহ বুখারী", icon: "📗", totalHadith: 7563, color: "from-emerald-700 to-green-600" },
  { id: "ben-muslim", arabicId: "ara-muslim", name: "সহীহ মুসলিম", icon: "📘", totalHadith: 7563, color: "from-sky-700 to-blue-600" },
  { id: "ben-abudawud", arabicId: "ara-abudawud", name: "সুনানে আবু দাউদ", icon: "📙", totalHadith: 5274, color: "from-amber-700 to-orange-600" },
  { id: "ben-tirmidhi", arabicId: "ara-tirmidhi", name: "জামে আত-তিরমিযী", icon: "📕", totalHadith: 3956, color: "from-rose-700 to-red-600" },
  { id: "ben-nasai", arabicId: "ara-nasai", name: "সুনানে আন-নাসাঈ", icon: "📓", totalHadith: 5758, color: "from-purple-700 to-violet-600" },
  { id: "ben-ibnmajah", arabicId: "ara-ibnmajah", name: "সুনানে ইবনে মাজাহ", icon: "📔", totalHadith: 4341, color: "from-indigo-700 to-blue-600" },
];

interface HadithItem {
  hadithnumber: number;
  arabicnumber: number;
  text: string;
  grades: { name: string; grade: string }[];
  reference: { book: number; hadith: number };
}

interface SectionMeta {
  [key: string]: string;
}

type ViewState = "books" | "sections" | "hadiths";

const HadithContent = () => {
  const [view, setView] = useState<ViewState>("books");
  const [selectedBook, setSelectedBook] = useState<typeof HADITH_BOOKS[0] | null>(null);
  const [sections, setSections] = useState<SectionMeta>({});
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [arabicHadiths, setArabicHadiths] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [arabicSize, setArabicSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";

  const loadBookSections = async (book: typeof HADITH_BOOKS[0]) => {
    setLoading(true);
    setSelectedBook(book);
    setSections({});
    try {
      // Load English edition for metadata (sections are always in English in API)
      const res = await fetch(`${BASE}/editions/${book.id}.json`).then(r => r.json()).catch(() => null);
      const secs = res?.metadata?.sections || {};
      // Translate section names to Bengali
      const bnSecs: Record<string, string> = {};
      for (const [key, val] of Object.entries(secs)) {
        bnSecs[key] = translateSectionName(val as string);
      }
      setSections(bnSecs);
      setView("sections");
    } catch {
      setSections({});
      setView("sections");
    }
    setLoading(false);
  };

  const loadSection = async (sectionNum: number) => {
    if (!selectedBook) return;
    setLoading(true);
    setSelectedSection(sectionNum);
    setHadiths([]);
    setArabicHadiths({});
    try {
      const [benRes, araRes] = await Promise.all([
        fetch(`${BASE}/editions/${selectedBook.id}/sections/${sectionNum}.json`).then(r => r.json()),
        fetch(`${BASE}/editions/${selectedBook.arabicId}/sections/${sectionNum}.json`).then(r => r.json()).catch(() => null),
      ]);
      setHadiths(benRes.hadiths || []);
      if (araRes?.hadiths) {
        const araMap: Record<number, string> = {};
        araRes.hadiths.forEach((h: any) => { araMap[h.hadithnumber] = h.text; });
        setArabicHadiths(araMap);
      }
      setView("hadiths");
    } catch {
      setHadiths([]);
    }
    setLoading(false);
  };

  const goBack = () => {
    if (view === "hadiths") { setView("sections"); setHadiths([]); setSelectedSection(null); }
    else if (view === "sections") { setView("books"); setSelectedBook(null); setSections({}); }
  };

  const copyHadith = useCallback(async (hadith: HadithItem) => {
    const arabicText = arabicHadiths[hadith.hadithnumber] || "";
    const grade = hadith.grades?.[0]?.grade ? getBengaliGrade(hadith.grades[0].grade) : "";
    const text = [
      arabicText ? `${arabicText}\n` : "",
      hadith.text,
      "",
      `📖 ${selectedBook?.name} — হাদিস নং ${toBengaliNum(hadith.hadithnumber)}`,
      grade ? `মান: ${grade}` : "",
    ].filter(Boolean).join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(hadith.hadithnumber);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* ignore */ }
  }, [arabicHadiths, selectedBook]);

  const shareHadith = useCallback(async (hadith: HadithItem) => {
    const arabicText = arabicHadiths[hadith.hadithnumber] || "";
    const grade = hadith.grades?.[0]?.grade ? getBengaliGrade(hadith.grades[0].grade) : "";
    const text = [
      arabicText ? `${arabicText}\n` : "",
      hadith.text,
      "",
      `📖 ${selectedBook?.name} — হাদিস নং ${toBengaliNum(hadith.hadithnumber)}`,
      grade ? `মান: ${grade}` : "",
    ].filter(Boolean).join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: `${selectedBook?.name} — হাদিস ${toBengaliNum(hadith.hadithnumber)}`, text });
      } catch { /* cancelled */ }
    } else {
      copyHadith(hadith);
    }
  }, [arabicHadiths, selectedBook, copyHadith]);

  const sectionEntries = useMemo(() => {
    return Object.entries(sections)
      .filter(([k]) => k !== "0")
      .filter(([, v]) => !sectionSearch || v.toLowerCase().includes(sectionSearch.toLowerCase()) || toBengaliNum(Number(v)).includes(sectionSearch));
  }, [sections, sectionSearch]);

  const filteredHadiths = useMemo(() => {
    if (!searchQuery) return hadiths;
    return hadiths.filter(h =>
      h.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toBengaliNum(h.hadithnumber).includes(searchQuery) ||
      String(h.hadithnumber).includes(searchQuery)
    );
  }, [hadiths, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-800 to-blue-700 text-white p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
        }} />
        <div className="relative">
          <h1 className="text-2xl font-bold mb-1">📿 হাদিস শরীফ</h1>
          <p className="text-sm opacity-80">
            {view === "books" ? "সহীহ হাদিস গ্রন্থসমূহ — আরবি ও বাংলা" :
              view === "sections" ? `${selectedBook?.name} — অধ্যায়সমূহ` :
                `${selectedBook?.name} — অধ্যায় ${toBengaliNum(selectedSection || 0)}`}
          </p>
        </div>
      </div>

      {/* Back button for sub-views */}
      {view !== "books" && (
        <div className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={goBack} className="p-2 hover:bg-muted rounded-xl transition-colors flex-shrink-0">
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">
                {view === "sections" ? selectedBook?.name : `অধ্যায় ${toBengaliNum(selectedSection || 0)}: ${sections[String(selectedSection)] || ""}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {view === "sections" ? `${toBengaliNum(Object.keys(sections).filter(k => k !== "0").length)}টি অধ্যায়` : `${toBengaliNum(filteredHadiths.length)}টি হাদিস`}
              </p>
            </div>
            {view === "hadiths" && (
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5 border border-border rounded-lg px-1.5 py-0.5">
                  <span className="text-[8px] text-muted-foreground">আরবি</span>
                  <button onClick={() => setArabicSize(s => Math.max(14, s - 2))} className="p-0.5 hover:bg-muted rounded"><Minus size={10} /></button>
                  <span className="text-[9px] w-4 text-center">{arabicSize}</span>
                  <button onClick={() => setArabicSize(s => Math.min(32, s + 2))} className="p-0.5 hover:bg-muted rounded"><Plus size={10} /></button>
                </div>
                <div className="flex items-center gap-0.5 border border-border rounded-lg px-1.5 py-0.5">
                  <span className="text-[8px] text-muted-foreground">বাংলা</span>
                  <button onClick={() => setFontSize(s => Math.max(11, s - 1))} className="p-0.5 hover:bg-muted rounded"><Minus size={10} /></button>
                  <span className="text-[9px] w-4 text-center">{fontSize}</span>
                  <button onClick={() => setFontSize(s => Math.min(22, s + 1))} className="p-0.5 hover:bg-muted rounded"><Plus size={10} /></button>
                </div>
              </div>
            )}
          </div>
          {/* Search */}
          {(view === "sections" || view === "hadiths") && (
            <div className="px-4 pb-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={view === "sections" ? "অধ্যায় খুঁজুন..." : "হাদিস খুঁজুন..."}
                  value={view === "sections" ? sectionSearch : searchQuery}
                  onChange={e => view === "sections" ? setSectionSearch(e.target.value) : setSearchQuery(e.target.value)}
                  className="w-full border border-border rounded-xl pl-8 pr-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">লোড হচ্ছে...</span>
        </div>
      )}

      {/* Book selection */}
      {view === "books" && !loading && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">একটি হাদিস গ্রন্থ নির্বাচন করুন</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HADITH_BOOKS.map(book => (
              <button
                key={book.id}
                onClick={() => loadBookSections(book)}
                className="text-left bg-card border border-border rounded-2xl p-4 hover:border-sky-500 hover:shadow-lg transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${book.color} flex items-center justify-center text-2xl`}>
                    {book.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base">{book.name}</p>
                    <p className="text-xs text-muted-foreground">{toBengaliNum(book.totalHadith)}টি হাদিস</p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground group-hover:text-sky-600 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sections list */}
      {view === "sections" && !loading && (
        <div className="p-4 space-y-2 pb-20">
          {sectionEntries.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">কোনো অধ্যায় পাওয়া যায়নি</p>
            </div>
          ) : (
            sectionEntries.map(([num, name]) => (
              <button
                key={num}
                onClick={() => loadSection(Number(num))}
                className="w-full text-left bg-card border border-border rounded-xl p-3 hover:border-sky-500 hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-3"
              >
                <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-sky-700 to-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {toBengaliNum(num)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{name}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
              </button>
            ))
          )}
        </div>
      )}

      {/* Hadiths list */}
      {view === "hadiths" && !loading && (
        <div className="divide-y divide-border pb-20">
          {filteredHadiths.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">কোনো হাদিস পাওয়া যায়নি</p>
            </div>
          ) : (
            filteredHadiths.map(hadith => {
              const bengaliGrade = hadith.grades?.[0]?.grade ? getBengaliGrade(hadith.grades[0].grade) : "";
              const isCopied = copiedId === hadith.hadithnumber;
              
              return (
                <div key={hadith.hadithnumber} className="p-4 hover:bg-muted/30 transition-colors">
                  {/* Header row */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-700 text-white text-[10px] font-bold flex items-center justify-center">
                      {toBengaliNum(hadith.hadithnumber)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      হাদিস নং {toBengaliNum(hadith.hadithnumber)}
                    </span>
                    {bengaliGrade && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        bengaliGrade.includes("সহীহ") ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        bengaliGrade.includes("হাসান") ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        bengaliGrade.includes("দুর্বল") ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {bengaliGrade}
                      </span>
                    )}
                    {/* Action buttons */}
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => copyHadith(hadith)}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                        title="কপি করুন"
                      >
                        {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => shareHadith(hadith)}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                        title="শেয়ার করুন"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Arabic text */}
                  {arabicHadiths[hadith.hadithnumber] && (
                    <p
                      className="font-arabic font-bold text-right leading-[2.4] mb-3 text-foreground"
                      dir="rtl"
                      style={{ fontSize: `${arabicSize}px` }}
                    >
                      {arabicHadiths[hadith.hadithnumber]}
                    </p>
                  )}

                  {/* Bengali text */}
                  <div className={arabicHadiths[hadith.hadithnumber] ? "border-t border-border pt-3" : ""}>
                    <p className="text-foreground leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
                      {hadith.text}
                    </p>
                  </div>

                  {/* Reference & grader */}
                  <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                    <p className="text-[10px] text-muted-foreground italic">
                      📖 {selectedBook?.name} — বই {toBengaliNum(hadith.reference?.book || 0)}, হাদিস {toBengaliNum(hadith.reference?.hadith || 0)}
                    </p>
                    {hadith.grades?.[0]?.name && (
                      <p className="text-[9px] text-muted-foreground">
                        গ্রেডকারী: {hadith.grades[0].name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const HadithPage = () => {
  const isApp = useIsApp();
  if (isApp) {
    return <AppLayout><HadithContent /></AppLayout>;
  }
  return <Layout><HadithContent /></Layout>;
};

export default HadithPage;
