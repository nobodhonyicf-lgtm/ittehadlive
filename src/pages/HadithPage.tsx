import Layout from "@/components/layout/Layout";
import { useIsApp } from "@/hooks/useIsApp";
import AppLayout from "@/components/app/AppLayout";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, Plus, Minus, Loader2, Copy, Share2, Check, BookOpen, Menu, X } from "lucide-react";
import { translateSectionName } from "@/lib/hadithSectionsBn";
import Breadcrumbs from "@/components/Breadcrumbs";

const toBengaliNum = (n: number | string) => {
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (x) => d[+x]);
};

const GRADE_MAP: Record<string, string> = {
  "sahih": "সহীহ", "hasan": "হাসান", "hasan sahih": "হাসান সহীহ",
  "da'if": "দুর্বল (যঈফ)", "daif": "দুর্বল (যঈফ)", "maudu": "জাল (মওযু)",
  "maudu'": "জাল (মওযু)", "munkar": "মুনকার", "mursal": "মুরসাল",
  "isnad sahih": "সনদ সহীহ", "isnad hasan": "সনদ হাসান",
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
  { id: "ben-bukhari", arabicId: "ara-bukhari", engId: "eng-bukhari", name: "সহীহ বুখারী", icon: "📗", totalHadith: 7563, color: "from-emerald-700 to-green-600" },
  { id: "ben-muslim", arabicId: "ara-muslim", engId: "eng-muslim", name: "সহীহ মুসলিম", icon: "📘", totalHadith: 7563, color: "from-sky-700 to-blue-600" },
  { id: "ben-abudawud", arabicId: "ara-abudawud", engId: "eng-abudawud", name: "সুনানে আবু দাউদ", icon: "📙", totalHadith: 5274, color: "from-amber-700 to-orange-600" },
  { id: "ben-tirmidhi", arabicId: "ara-tirmidhi", engId: "eng-tirmidhi", name: "জামে আত-তিরমিযী", icon: "📕", totalHadith: 3956, color: "from-rose-700 to-red-600" },
  { id: "ben-nasai", arabicId: "ara-nasai", engId: "eng-nasai", name: "সুনানে আন-নাসাঈ", icon: "📓", totalHadith: 5758, color: "from-purple-700 to-violet-600" },
  { id: "ben-ibnmajah", arabicId: "ara-ibnmajah", engId: "eng-ibnmajah", name: "সুনানে ইবনে মাজাহ", icon: "📔", totalHadith: 4341, color: "from-indigo-700 to-blue-600" },
];

interface HadithItem {
  hadithnumber: number;
  arabicnumber: number;
  text: string;
  grades: { name: string; grade: string }[];
  reference: { book: number; hadith: number };
}

interface SectionMeta { [key: string]: string; }
type ViewState = "books" | "sections" | "hadiths";

const HadithContent = () => {
  const [view, setView] = useState<ViewState>("books");
  const [selectedBook, setSelectedBook] = useState<typeof HADITH_BOOKS[0] | null>(null);
  const [sections, setSections] = useState<SectionMeta>({});
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [arabicHadiths, setArabicHadiths] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const [arabicSize, setArabicSize] = useState(26);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";

  const loadBookSections = async (book: typeof HADITH_BOOKS[0]) => {
    setLoading(true);
    setSelectedBook(book);
    setSections({});
    try {
      const [benRes, engRes] = await Promise.all([
        fetch(`${BASE}/editions/${book.id}.json`).then(r => r.json()).catch(() => null),
        fetch(`${BASE}/editions/${book.engId}.json`).then(r => r.json()).catch(() => null),
      ]);
      const benSecs = benRes?.metadata?.sections || {};
      const engSecs = engRes?.metadata?.sections || {};
      const finalSecs: Record<string, string> = {};
      const allKeys = new Set([...Object.keys(benSecs), ...Object.keys(engSecs)]);
      for (const key of allKeys) {
        const benName = benSecs[key] as string | undefined;
        const engName = engSecs[key] as string | undefined;
        if (benName && /[\u0980-\u09FF]/.test(benName)) {
          finalSecs[key] = benName;
        } else if (engName) {
          finalSecs[key] = translateSectionName(engName);
        } else if (benName) {
          finalSecs[key] = translateSectionName(benName);
        }
      }
      setSections(finalSecs);
      setView("sections");
    } catch { setSections({}); setView("sections"); }
    setLoading(false);
  };

  const loadSection = async (sectionNum: number) => {
    if (!selectedBook) return;
    setLoading(true);
    setSelectedSection(sectionNum);
    setHadiths([]);
    setArabicHadiths({});
    try {
      const [benRes, araRes, engRes] = await Promise.all([
        fetch(`${BASE}/editions/${selectedBook.id}/sections/${sectionNum}.json`).then(r => r.json()),
        fetch(`${BASE}/editions/${selectedBook.arabicId}/sections/${sectionNum}.json`).then(r => r.json()).catch(() => null),
        fetch(`${BASE}/editions/${selectedBook.engId}/sections/${sectionNum}.json`).then(r => r.json()).catch(() => null),
      ]);
      let hadithsList = benRes.hadiths || [];
      // Merge grades from English edition if Bengali grades are missing
      if (engRes?.hadiths) {
        const engGradeMap: Record<number, any[]> = {};
        engRes.hadiths.forEach((h: any) => { if (h.grades?.length) engGradeMap[h.hadithnumber] = h.grades; });
        hadithsList = hadithsList.map((h: any) => ({
          ...h,
          grades: (h.grades?.length ? h.grades : engGradeMap[h.hadithnumber]) || [],
        }));
      }
      setHadiths(hadithsList);
      if (araRes?.hadiths) {
        const araMap: Record<number, string> = {};
        araRes.hadiths.forEach((h: any) => { araMap[h.hadithnumber] = h.text; });
        setArabicHadiths(araMap);
      }
      setView("hadiths");
    } catch { setHadiths([]); }
    setLoading(false);
  };

  const goBack = () => {
    if (view === "hadiths") { setView("sections"); setHadiths([]); setSelectedSection(null); }
    else if (view === "sections") { setView("books"); setSelectedBook(null); setSections({}); }
  };

  const copyHadith = useCallback(async (hadith: HadithItem) => {
    const arabicText = arabicHadiths[hadith.hadithnumber] || "";
    const grade = hadith.grades?.[0]?.grade ? getBengaliGrade(hadith.grades[0].grade) : "";
    const text = [arabicText ? `${arabicText}\n` : "", hadith.text, "", `📖 ${selectedBook?.name} — হাদিস নং ${toBengaliNum(hadith.hadithnumber)}`, grade ? `মান: ${grade}` : ""].filter(Boolean).join("\n");
    try { await navigator.clipboard.writeText(text); setCopiedId(hadith.hadithnumber); setTimeout(() => setCopiedId(null), 2000); } catch {}
  }, [arabicHadiths, selectedBook]);

  const shareHadith = useCallback(async (hadith: HadithItem) => {
    const arabicText = arabicHadiths[hadith.hadithnumber] || "";
    const grade = hadith.grades?.[0]?.grade ? getBengaliGrade(hadith.grades[0].grade) : "";
    const text = [arabicText ? `${arabicText}\n` : "", hadith.text, "", `📖 ${selectedBook?.name} — হাদিস নং ${toBengaliNum(hadith.hadithnumber)}`, grade ? `মান: ${grade}` : ""].filter(Boolean).join("\n");
    if (navigator.share) { try { await navigator.share({ title: `${selectedBook?.name} — হাদিস ${toBengaliNum(hadith.hadithnumber)}`, text }); } catch {} }
    else copyHadith(hadith);
  }, [arabicHadiths, selectedBook, copyHadith]);

  const sectionEntries = useMemo(() => {
    return Object.entries(sections).filter(([k]) => k !== "0")
      .filter(([, v]) => !sectionSearch || v.toLowerCase().includes(sectionSearch.toLowerCase()) || toBengaliNum(Number(v)).includes(sectionSearch));
  }, [sections, sectionSearch]);

  const filteredHadiths = useMemo(() => {
    if (!searchQuery) return hadiths;
    return hadiths.filter(h => h.text.toLowerCase().includes(searchQuery.toLowerCase()) || toBengaliNum(h.hadithnumber).includes(searchQuery) || String(h.hadithnumber).includes(searchQuery));
  }, [hadiths, searchQuery]);

  const breadcrumbItems = view === "books"
    ? [{ label: "হাদিস" }]
    : view === "sections"
      ? [{ label: "হাদিস", href: "/hadith" }, { label: selectedBook?.name || "" }]
      : [{ label: "হাদিস", href: "/hadith" }, { label: selectedBook?.name || "" }, { label: `অধ্যায় ${toBengaliNum(selectedSection || 0)}` }];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex relative">
        {/* Left Sidebar - Chapter Index (desktop) */}
        {view === "hadiths" && Object.keys(sections).length > 0 && (
          <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-border bg-card sticky top-0 h-screen overflow-y-auto">
            <div className="p-4 border-b border-border bg-gradient-to-b from-sky-50 to-white dark:from-sky-950/30 dark:to-card">
              <p className="text-sm font-bold text-sky-800 dark:text-sky-300 mb-1">📖 অধ্যায় সূচি</p>
              <p className="text-xs text-muted-foreground mb-3">{selectedBook?.name}</p>
              <input
                type="text"
                placeholder="অধ্যায় খুঁজুন..."
                value={sectionSearch}
                onChange={e => setSectionSearch(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              {Object.entries(sections).filter(([k]) => k !== "0").map(([num, name]) => {
                const sectionHadiths = hadiths.filter(h => String(h.reference?.book) === num);
                const hadithRange = sectionHadiths.length > 0 
                  ? `${toBengaliNum(sectionHadiths[0].hadithnumber)}-${toBengaliNum(sectionHadiths[sectionHadiths.length - 1].hadithnumber)}`
                  : "";
                return (
                  <button
                    key={num}
                    onClick={() => loadSection(Number(num))}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors flex items-center gap-3 border-b border-border/50 ${selectedSection === Number(num) ? "bg-sky-100 dark:bg-sky-900/30 font-bold" : ""}`}
                  >
                    <span className="text-sm text-muted-foreground w-8 flex-shrink-0">{toBengaliNum(num)}.</span>
                    <span className="flex-1 truncate">{name}</span>
                    {hadithRange && <span className="text-[10px] text-muted-foreground flex-shrink-0">({hadithRange})</span>}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Mobile Sidebar Drawer */}
        {showSidebar && view === "hadiths" && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />
            <aside className="fixed left-0 top-0 bottom-0 w-80 bg-card z-50 lg:hidden overflow-y-auto shadow-2xl">
              <div className="p-4 border-b border-border bg-sky-50 dark:bg-sky-950/20 flex items-center justify-between">
                <p className="text-sm font-bold text-sky-800 dark:text-sky-300">📖 অধ্যায় সূচি</p>
                <button onClick={() => setShowSidebar(false)} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
              </div>
              <div>
              {Object.entries(sections).filter(([k]) => k !== "0").map(([num, name]) => {
                const sectionHadiths = hadiths.filter(h => String(h.reference?.book) === num);
                const hadithRange = sectionHadiths.length > 0 
                  ? `${toBengaliNum(sectionHadiths[0].hadithnumber)}-${toBengaliNum(sectionHadiths[sectionHadiths.length - 1].hadithnumber)}`
                  : "";
                return (
                  <button
                    key={num}
                    onClick={() => { loadSection(Number(num)); setShowSidebar(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors flex items-center gap-3 border-b border-border/50 ${selectedSection === Number(num) ? "bg-sky-100 dark:bg-sky-900/30 font-bold" : ""}`}
                  >
                    <span className="text-sm text-muted-foreground w-8">{toBengaliNum(num)}.</span>
                    <span className="truncate">{name}</span>
                    {hadithRange && <span className="text-[10px] text-muted-foreground flex-shrink-0">({hadithRange})</span>}
                  </button>
                );
              })}
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <div className="px-4 pt-3 pb-1">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Hero Header */}
          <div className="bg-gradient-to-br from-emerald-800 via-teal-700 to-green-800 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            <div className="relative p-8 pb-10 text-center">
              <h1 className="text-3xl font-bold mb-2">📿 হাদীসের কিতাব সমূহ</h1>
              <p className="text-base opacity-80">
                {view === "books" ? "সহীহ হাদিস গ্রন্থসমূহ — আরবি ও বাংলা" :
                  view === "sections" ? `${selectedBook?.name} — অধ্যায়সমূহ` :
                    `${selectedBook?.name} — অধ্যায় ${toBengaliNum(selectedSection || 0)}`}
              </p>
            </div>
          </div>

          {/* Back button for sub-views */}
          {view !== "books" && (
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={goBack} className="p-2 hover:bg-muted rounded-xl transition-colors flex-shrink-0">
                  <ChevronLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate">
                    {view === "sections" ? selectedBook?.name : `অধ্যায় ${toBengaliNum(selectedSection || 0)}: ${sections[String(selectedSection)] || ""}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {view === "sections" ? `${toBengaliNum(Object.keys(sections).filter(k => k !== "0").length)}টি অধ্যায়` : `${toBengaliNum(filteredHadiths.length)}টি হাদিস`}
                  </p>
                </div>
                {view === "hadiths" && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowSidebar(true)} className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden" title="অধ্যায় সূচি">
                      <Menu size={18} />
                    </button>
                    <div className="flex items-center gap-1 border border-border rounded-lg px-2 py-1">
                      <span className="text-xs text-muted-foreground">আ</span>
                      <button onClick={() => setArabicSize(s => Math.max(18, s - 2))} className="p-0.5 hover:bg-muted rounded"><Minus size={12} /></button>
                      <button onClick={() => setArabicSize(s => Math.min(40, s + 2))} className="p-0.5 hover:bg-muted rounded"><Plus size={12} /></button>
                    </div>
                    <div className="flex items-center gap-1 border border-border rounded-lg px-2 py-1">
                      <span className="text-xs text-muted-foreground">ব</span>
                      <button onClick={() => setFontSize(s => Math.max(14, s - 1))} className="p-0.5 hover:bg-muted rounded"><Minus size={12} /></button>
                      <button onClick={() => setFontSize(s => Math.min(26, s + 1))} className="p-0.5 hover:bg-muted rounded"><Plus size={12} /></button>
                    </div>
                  </div>
                )}
              </div>
              {/* Search */}
              {(view === "sections" || view === "hadiths") && (
                <div className="px-4 pb-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={view === "sections" ? "অধ্যায় খুঁজুন..." : "হাদিস খুঁজুন..."}
                      value={view === "sections" ? sectionSearch : searchQuery}
                      onChange={e => view === "sections" ? setSectionSearch(e.target.value) : setSearchQuery(e.target.value)}
                      className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 bg-background text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-muted-foreground" />
              <span className="ml-3 text-base text-muted-foreground">লোড হচ্ছে...</span>
            </div>
          )}

          {/* Book selection */}
          {view === "books" && !loading && (
            <div className="p-4 max-w-5xl mx-auto space-y-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="কিতাবের নাম দিয়ে খুঁজুন..." className="w-full border border-border rounded-xl pl-12 pr-4 py-3.5 bg-card text-base focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <p className="text-sm text-muted-foreground">একটি হাদিস গ্রন্থ নির্বাচন করুন</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {HADITH_BOOKS.map((book, idx) => (
                  <button
                    key={book.id}
                    onClick={() => loadBookSections(book)}
                    className="text-left bg-card border border-border rounded-2xl p-5 hover:border-sky-400 hover:shadow-lg transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-13 h-13 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center text-lg font-bold shadow-md rotate-45">
                        <span className="-rotate-45">{toBengaliNum(idx + 1)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg leading-tight">{book.name}</p>
                        <p className="text-sm text-muted-foreground font-arabic mt-1" dir="rtl">
                          {book.id === "ben-bukhari" ? "الجامع الصحيح للبخاري" :
                           book.id === "ben-muslim" ? "المسند الصحيح لمسلم" :
                           book.id === "ben-abudawud" ? "كتاب السنن للإمام أبي داود" :
                           book.id === "ben-tirmidhi" ? "الجامع الكبير للترمذي" :
                           book.id === "ben-nasai" ? "المجتبى من السنن للنسائي" :
                           "السنن للإمام ابن ماجه"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {toBengaliNum(book.totalHadith)}টি হাদিস
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-muted-foreground group-hover:text-sky-600 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sections list */}
          {view === "sections" && !loading && (
            <div className="p-4 max-w-4xl mx-auto space-y-2 pb-20">
              {sectionEntries.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-base">কোনো অধ্যায় পাওয়া যায়নি</p>
                </div>
              ) : (
                sectionEntries.map(([num, name]) => (
                  <button
                    key={num}
                    onClick={() => loadSection(Number(num))}
                    className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-sky-500 hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-4"
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-sky-700 to-blue-600 text-white text-sm font-bold flex items-center justify-center shadow-sm">
                      {toBengaliNum(num)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium">{name}</p>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}

          {/* Hadiths list */}
          {view === "hadiths" && !loading && (
            <div className="max-w-4xl mx-auto pb-20">
              {filteredHadiths.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-base">কোনো হাদিস পাওয়া যায়নি</p>
                </div>
              ) : (
                filteredHadiths.map(hadith => {
                  const bengaliGrade = hadith.grades?.[0]?.grade ? getBengaliGrade(hadith.grades[0].grade) : "";
                  const isCopied = copiedId === hadith.hadithnumber;
                  
                  return (
                    <div key={hadith.hadithnumber} className="border-b border-border hover:bg-muted/20 transition-colors">
                      {/* Header row */}
                      <div className="flex items-center gap-3 px-6 pt-5 pb-2 flex-wrap">
                        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-sky-700 text-white text-sm font-bold flex items-center justify-center">
                          {toBengaliNum(hadith.hadithnumber)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          হাদিস নং {toBengaliNum(hadith.hadithnumber)}
                        </span>
                        {bengaliGrade && (
                          <span className={`text-xs px-3 py-1 rounded-md font-bold border ${
                            bengaliGrade.includes("সহীহ") ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700" :
                            bengaliGrade.includes("হাসান") ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700" :
                            bengaliGrade.includes("দুর্বল") || bengaliGrade.includes("যঈফ") ? "bg-red-50 text-red-600 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700" :
                            bengaliGrade.includes("জাল") ? "bg-red-100 text-red-700 border-red-400 dark:bg-red-900/40 dark:text-red-400 dark:border-red-600" :
                            "bg-muted text-muted-foreground border-border"
                          }`}>
                            {bengaliGrade}
                          </span>
                        )}
                        <div className="ml-auto flex items-center gap-1">
                          <button onClick={() => copyHadith(hadith)} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground" title="কপি করুন">
                            {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                          </button>
                          <button onClick={() => shareHadith(hadith)} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground" title="শেয়ার করুন">
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Arabic text */}
                      {arabicHadiths[hadith.hadithnumber] && (
                        <div className="px-6 pb-4">
                          <p
                            className="font-arabic font-bold text-right leading-[2.6] text-foreground"
                            dir="rtl"
                            style={{ fontSize: `${arabicSize}px` }}
                          >
                            {arabicHadiths[hadith.hadithnumber]}
                          </p>
                        </div>
                      )}

                      {/* Bengali text */}
                      <div className={`px-6 pb-5 ${arabicHadiths[hadith.hadithnumber] ? "border-t border-border/50 pt-4" : ""}`}>
                        <p className="text-foreground leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
                          {hadith.text}
                        </p>
                      </div>

                      {/* Reference */}
                      <div className="flex items-center justify-between px-6 pb-4 flex-wrap gap-1">
                        <p className="text-xs text-muted-foreground italic">
                          📖 {selectedBook?.name} — বই {toBengaliNum(hadith.reference?.book || 0)}, হাদিস {toBengaliNum(hadith.reference?.hadith || 0)}
                        </p>
                        {hadith.grades?.[0]?.name && (
                          <p className="text-[11px] text-muted-foreground">গ্রেডকারী: {hadith.grades[0].name}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HadithPage = () => {
  const isApp = useIsApp();
  if (isApp) return <AppLayout><HadithContent /></AppLayout>;
  return <Layout fullWidth><HadithContent /></Layout>;
};

export default HadithPage;
