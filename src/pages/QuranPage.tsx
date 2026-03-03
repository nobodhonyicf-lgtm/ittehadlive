import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useIsApp } from "@/hooks/useIsApp";
import AppLayout from "@/components/app/AppLayout";
import { useEffect, useState, useRef, useCallback } from "react";
import { Volume2, VolumeX, ChevronLeft, ChevronRight, AlignLeft, Plus, Minus, ChevronDown, Play, Pause, Square, BookOpen, Menu, X, Share2, Bookmark, BookMarked, Search } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { toast } from "@/components/ui/sonner";

interface QuranAyah {
  number: number;
  text: string;
  translation: string;
  numberInSurah: number;
}

interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface TafsirEntry {
  verse_key: string;
  text: string;
}

interface WordData {
  id: number;
  position: number;
  text_uthmani: string;
  translation: { text: string; language_name: string };
  transliteration: { text: string };
  char_type_name: string;
}

const toBengaliNum = (n: number | string) => {
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (x) => d[+x]);
};

// Bengali surah names
const SURAH_NAMES_BN: Record<number, string> = {
  1: "আল-ফাতিহা", 2: "আল-বাকারা", 3: "আলে ইমরান", 4: "আন-নিসা", 5: "আল-মায়িদা",
  6: "আল-আনআম", 7: "আল-আরাফ", 8: "আল-আনফাল", 9: "আত-তাওবা", 10: "ইউনুস",
  11: "হুদ", 12: "ইউসুফ", 13: "আর-রাদ", 14: "ইবরাহীম", 15: "আল-হিজর",
  16: "আন-নাহল", 17: "আল-ইসরা", 18: "আল-কাহফ", 19: "মারইয়াম", 20: "ত্বা-হা",
  21: "আল-আম্বিয়া", 22: "আল-হাজ্জ", 23: "আল-মুমিনূন", 24: "আন-নূর", 25: "আল-ফুরকান",
  26: "আশ-শুআরা", 27: "আন-নামল", 28: "আল-কাসাস", 29: "আল-আনকাবূত", 30: "আর-রূম",
  31: "লুকমান", 32: "আস-সাজদা", 33: "আল-আহযাব", 34: "সাবা", 35: "ফাতির",
  36: "ইয়াসীন", 37: "আস-সাফফাত", 38: "সাদ", 39: "আয-যুমার", 40: "গাফির",
  41: "ফুসসিলাত", 42: "আশ-শূরা", 43: "আয-যুখরুফ", 44: "আদ-দুখান", 45: "আল-জাসিয়া",
  46: "আল-আহকাফ", 47: "মুহাম্মাদ", 48: "আল-ফাতহ", 49: "আল-হুজুরাত", 50: "কাফ",
  51: "আয-যারিয়াত", 52: "আত-তূর", 53: "আন-নাজম", 54: "আল-কামার", 55: "আর-রাহমান",
  56: "আল-ওয়াকিয়া", 57: "আল-হাদীদ", 58: "আল-মুজাদালা", 59: "আল-হাশর", 60: "আল-মুমতাহিনা",
  61: "আস-সাফ", 62: "আল-জুমুআ", 63: "আল-মুনাফিকূন", 64: "আত-তাগাবুন", 65: "আত-তালাক",
  66: "আত-তাহরীম", 67: "আল-মুলক", 68: "আল-কলম", 69: "আল-হাক্কা", 70: "আল-মাআরিজ",
  71: "নূহ", 72: "আল-জিন", 73: "আল-মুযযাম্মিল", 74: "আল-মুদ্দাসসির", 75: "আল-কিয়ামা",
  76: "আল-ইনসান", 77: "আল-মুরসালাত", 78: "আন-নাবা", 79: "আন-নাযিআত", 80: "আবাসা",
  81: "আত-তাকবীর", 82: "আল-ইনফিতার", 83: "আল-মুতাফফিফীন", 84: "আল-ইনশিকাক", 85: "আল-বুরূজ",
  86: "আত-তারিক", 87: "আল-আলা", 88: "আল-গাশিয়া", 89: "আল-ফাজর", 90: "আল-বালাদ",
  91: "আশ-শামস", 92: "আল-লাইল", 93: "আদ-দুহা", 94: "আলাম নাশরাহ", 95: "আত-তীন",
  96: "আল-আলাক", 97: "আল-কদর", 98: "আল-বাইয়্যিনা", 99: "আয-যিলযাল", 100: "আল-আদিয়াত",
  101: "আল-কারিআ", 102: "আত-তাকাসুর", 103: "আল-আসর", 104: "আল-হুমাযা", 105: "আল-ফীল",
  106: "কুরাইশ", 107: "আল-মাউন", 108: "আল-কাউসার", 109: "আল-কাফিরূন", 110: "আন-নাসর",
  111: "আল-লাহাব", 112: "আল-ইখলাস", 113: "আল-ফালাক", 114: "আন-নাস",
};

const TAFSIR_OPTIONS = [
  { id: 0, name: "তাফসির নেই", slug: "" },
  { id: 164, name: "তাফসীর ইবনে কাসীর (বাংলা)", slug: "bn-tafseer-ibn-e-kaseer" },
  { id: 166, name: "তাফসীর আবু বকর যাকারিয়া (মারেফুল কুরআন)", slug: "bn-tafsir-abu-bakr-zakaria" },
  { id: 165, name: "তাফসীর আহসানুল বায়ান (বাংলা)", slug: "bn-tafsir-ahsanul-bayaan" },
  { id: 381, name: "তাফসীর ফাতহুল মাজীদ (বাংলা)", slug: "tafisr-fathul-majid-bn" },
  { id: 97, name: "তাফসীর জালালাইন (আরবি)", slug: "ar-tafsir-al-jalalayn" },
  { id: 169, name: "তাফসীর মুয়াসসার (আরবি)", slug: "ar-tafsir-muyassar" },
  { id: 171, name: "তাফসীর বাগভী (আরবি)", slug: "ar-tafseer-al-baghawi" },
];

const RECITER_ID = 7;

const QuranContent = ({ fullscreen = false }: { fullscreen?: boolean }) => {
  const [surahs, setSurahs] = useState<QuranSurah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [loading, setLoading] = useState(false);
  const [surahLoading, setSurahLoading] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showWordByWord, setShowWordByWord] = useState(false);
  const [selectedTafsir, setSelectedTafsir] = useState(0);
  const [tafsirData, setTafsirData] = useState<Record<string, string>>({});
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [showTafsirDropdown, setShowTafsirDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [translationSize, setTranslationSize] = useState(18);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"surah" | "ayah">("surah");
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<string>>(new Set());
  const ayahRef = useRef<HTMLDivElement>(null);
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [wordData, setWordData] = useState<Record<string, WordData[]>>({});
  const [wordDataLoading, setWordDataLoading] = useState(false);

  const [isSurahPlaying, setIsSurahPlaying] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState<string | null>(null);
  const [highlightedWord, setHighlightedWord] = useState<{ verseKey: string; wordIndex: number } | null>(null);
  const [verseTimings, setVerseTimings] = useState<{ verse_key: string; timestamp_from: number; timestamp_to: number; segments: number[][] }[]>([]);
  const surahAudioRef = useRef<HTMLAudioElement | null>(null);
  const timingIntervalRef = useRef<number | null>(null);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("quran_bookmarks");
      if (saved) setBookmarkedAyahs(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleBookmark = (verseKey: string) => {
    setBookmarkedAyahs(prev => {
      const next = new Set(prev);
      if (next.has(verseKey)) {
        next.delete(verseKey);
        toast.success("বুকমার্ক মুছে ফেলা হয়েছে");
      } else {
        next.add(verseKey);
        toast.success("বুকমার্ক যোগ করা হয়েছে");
      }
      localStorage.setItem("quran_bookmarks", JSON.stringify([...next]));
      return next;
    });
  };

  const shareAyah = async (ayah: QuranAyah) => {
    const currentSurahData = surahs.find(s => s.number === selectedSurah);
    const surahName = currentSurahData ? getBnName(currentSurahData) : "";
    const text = `${ayah.text}\n\n${ayah.translation}\n\n— সূরা ${surahName}, আয়াত ${toBengaliNum(ayah.numberInSurah)}`;
    if (navigator.share) {
      try { await navigator.share({ title: `সূরা ${surahName} — আয়াত ${toBengaliNum(ayah.numberInSurah)}`, text }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(text); toast.success("কপি করা হয়েছে"); } catch {}
    }
  };

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then(r => r.json())
      .then(d => { setSurahs(d.data); setSurahLoading(false); })
      .catch(() => setSurahLoading(false));
  }, []);

  const loadWordByWord = useCallback(async (surahNum: number) => {
    setWordDataLoading(true);
    try {
      const totalPages = Math.ceil((surahs.find(s => s.number === surahNum)?.numberOfAyahs || 7) / 10);
      const allWords: Record<string, WordData[]> = {};
      for (let page = 1; page <= totalPages; page++) {
        const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?language=bn&words=true&word_fields=text_uthmani&translation_fields=text&per_page=10&page=${page}`);
        const data = await res.json();
        if (data.verses) {
          data.verses.forEach((v: any) => { allWords[v.verse_key] = v.words || []; });
        }
        if (!data.pagination || page >= data.pagination.total_pages) break;
      }
      setWordData(allWords);
    } catch { setWordData({}); }
    setWordDataLoading(false);
  }, [surahs]);

  const loadSurah = async (num: number) => {
    setLoading(true);
    setSelectedSurah(num);
    setAyahs([]);
    setTafsirData({});
    setWordData({});
    stopSurahAudio();
    try {
      const totalAyahs = surahs.find(s => s.number === num)?.numberOfAyahs || 7;
      const totalPages = Math.ceil(totalAyahs / 50);
      let allArabicAyahs: any[] = [];
      for (let page = 1; page <= totalPages; page++) {
        const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${num}?language=bn&per_page=50&page=${page}&fields=text_uthmani&translations=161`);
        const data = await res.json();
        if (data.verses) allArabicAyahs = [...allArabicAyahs, ...data.verses];
        if (!data.pagination || page >= data.pagination.total_pages) break;
      }
      const combined = allArabicAyahs.map((v: any, i: number) => ({
        number: (num === 1 ? 0 : getAyahOffset(num)) + i + 1,
        text: v.text_uthmani || "",
        translation: v.translations?.[0]?.text || "",
        numberInSurah: i + 1,
      }));
      setAyahs(combined);
      if (selectedTafsir > 0) loadTafsir(selectedTafsir, num);
      if (showWordByWord) loadWordByWord(num);
      setTimeout(() => ayahRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setAyahs([]); }
    setLoading(false);
  };

  const getAyahOffset = (surahNum: number): number => {
    const offsets: Record<number, number> = {
      1: 0, 2: 7, 3: 293, 4: 493, 5: 669, 6: 789, 7: 954, 8: 1160, 9: 1235, 10: 1364,
      11: 1473, 12: 1596, 13: 1707, 14: 1750, 15: 1802, 16: 1901, 17: 2029, 18: 2140,
      19: 2250, 20: 2348, 21: 2483, 22: 2595, 23: 2673, 24: 2791, 25: 2855, 26: 2932,
      27: 3159, 28: 3252, 29: 3340, 30: 3409, 31: 3469, 32: 3503, 33: 3533, 34: 3606,
      35: 3660, 36: 3705, 37: 3788, 38: 3970, 39: 4058, 40: 4133, 41: 4218, 42: 4272,
      43: 4325, 44: 4414, 45: 4473, 46: 4510, 47: 4545, 48: 4583, 49: 4612, 50: 4630,
      51: 4675, 52: 4735, 53: 4784, 54: 4846, 55: 4901, 56: 4979, 57: 5075, 58: 5104,
      59: 5126, 60: 5150, 61: 5163, 62: 5177, 63: 5188, 64: 5199, 65: 5217, 66: 5229,
      67: 5241, 68: 5271, 69: 5323, 70: 5375, 71: 5419, 72: 5447, 73: 5475, 74: 5495,
      75: 5551, 76: 5591, 77: 5622, 78: 5672, 79: 5712, 80: 5758, 81: 5800, 82: 5829,
      83: 5848, 84: 5884, 85: 5909, 86: 5931, 87: 5948, 88: 5967, 89: 5993, 90: 6023,
      91: 6043, 92: 6058, 93: 6079, 94: 6090, 95: 6098, 96: 6106, 97: 6125, 98: 6130,
      99: 6138, 100: 6146, 101: 6157, 102: 6168, 103: 6176, 104: 6179, 105: 6188, 106: 6193,
      107: 6197, 108: 6204, 109: 6207, 110: 6213, 111: 6216, 112: 6221, 113: 6224, 114: 6229,
    };
    return offsets[surahNum] || 0;
  };

  const loadTafsir = useCallback(async (tafsirId: number, surahNum: number) => {
    if (tafsirId === 0) { setTafsirData({}); return; }
    setTafsirLoading(true);
    try {
      const res = await fetch(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_chapter/${surahNum}`);
      const data = await res.json();
      const map: Record<string, string> = {};
      if (data.tafsirs) data.tafsirs.forEach((t: TafsirEntry) => { map[t.verse_key] = t.text; });
      setTafsirData(map);
    } catch { setTafsirData({}); }
    setTafsirLoading(false);
  }, []);

  const handleTafsirChange = (tafsirId: number) => {
    setSelectedTafsir(tafsirId);
    setShowTafsirDropdown(false);
    if (selectedSurah) loadTafsir(tafsirId, selectedSurah);
  };

  const handleWordByWordToggle = () => {
    const next = !showWordByWord;
    setShowWordByWord(next);
    if (next && selectedSurah && Object.keys(wordData).length === 0) loadWordByWord(selectedSurah);
  };

  const playAudio = (ayahNumber: number) => {
    if (audio) { audio.pause(); audio.currentTime = 0; }
    if (timingIntervalRef.current) clearInterval(timingIntervalRef.current);
    if (playingAyah === ayahNumber) { setPlayingAyah(null); setHighlightedWord(null); setHighlightedVerse(null); return; }
    const ayah = ayahs.find(a => a.number === ayahNumber);
    const verseKey = selectedSurah && ayah ? `${selectedSurah}:${ayah.numberInSurah}` : null;
    if (verseKey && Object.keys(wordData).length === 0 && selectedSurah) loadWordByWord(selectedSurah);
    const newAudio = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`);
    newAudio.play();
    if (verseKey) setHighlightedVerse(verseKey);
    newAudio.onloadedmetadata = () => {
      if (verseKey && wordData[verseKey]) {
        const words = wordData[verseKey].filter(w => w.char_type_name === "word" || w.char_type_name === "end");
        if (words.length > 0) {
          const duration = newAudio.duration * 1000;
          const wordDuration = duration / words.length;
          timingIntervalRef.current = window.setInterval(() => {
            const currentMs = newAudio.currentTime * 1000;
            const wordIndex = Math.min(Math.floor(currentMs / wordDuration), words.length - 1);
            setHighlightedWord({ verseKey, wordIndex });
          }, 80);
        }
      }
    };
    newAudio.onended = () => { setPlayingAyah(null); setHighlightedWord(null); setHighlightedVerse(null); if (timingIntervalRef.current) clearInterval(timingIntervalRef.current); };
    setAudio(newAudio);
    setPlayingAyah(ayahNumber);
  };

  const playSurahAudio = async () => {
    if (!selectedSurah) return;
    if (isSurahPlaying && surahAudioRef.current) { surahAudioRef.current.pause(); setIsSurahPlaying(false); if (timingIntervalRef.current) clearInterval(timingIntervalRef.current); return; }
    if (surahAudioRef.current) { surahAudioRef.current.play(); setIsSurahPlaying(true); startTimingSync(); return; }
    try {
      const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${RECITER_ID}/${selectedSurah}`);
      const data = await res.json();
      const audioFile = data.audio_file;
      if (!audioFile?.audio_url) return;
      if (audioFile.verse_timings) {
        setVerseTimings(audioFile.verse_timings.map((vt: any) => ({ verse_key: vt.verse_key, timestamp_from: vt.timestamp_from, timestamp_to: vt.timestamp_to, segments: vt.segments || [] })));
      }
      if (Object.keys(wordData).length === 0) loadWordByWord(selectedSurah);
      const newAudio = new Audio(`https://verses.quran.com/${audioFile.audio_url}`);
      surahAudioRef.current = newAudio;
      newAudio.onended = () => { setIsSurahPlaying(false); setHighlightedVerse(null); setHighlightedWord(null); if (timingIntervalRef.current) clearInterval(timingIntervalRef.current); };
      newAudio.oncanplaythrough = () => { newAudio.play(); setIsSurahPlaying(true); startTimingSync(); };
      newAudio.load();
    } catch { /* ignore */ }
  };

  const startTimingSync = () => {
    if (timingIntervalRef.current) clearInterval(timingIntervalRef.current);
    timingIntervalRef.current = window.setInterval(() => {
      if (!surahAudioRef.current) return;
      const currentMs = surahAudioRef.current.currentTime * 1000;
      for (const vt of verseTimings) {
        if (currentMs >= vt.timestamp_from && currentMs < vt.timestamp_to) {
          setHighlightedVerse(vt.verse_key);
          if (vt.segments && vt.segments.length > 0) {
            let foundWord = false;
            for (let i = 0; i < vt.segments.length; i++) {
              const seg = vt.segments[i];
              if (seg.length >= 3 && currentMs >= seg[1] && currentMs < seg[2]) {
                setHighlightedWord({ verseKey: vt.verse_key, wordIndex: seg[0] - 1 });
                foundWord = true;
                break;
              }
            }
            if (!foundWord) {
              const verseProgress = (currentMs - vt.timestamp_from) / (vt.timestamp_to - vt.timestamp_from);
              const estimatedIdx = Math.min(Math.max(0, Math.floor(verseProgress * vt.segments.length)), vt.segments.length - 1);
              const wordPos = vt.segments[estimatedIdx]?.[0];
              if (wordPos !== undefined) setHighlightedWord({ verseKey: vt.verse_key, wordIndex: wordPos - 1 });
            }
          }
          return;
        }
      }
    }, 50);
  };

  const stopSurahAudio = () => {
    if (surahAudioRef.current) { surahAudioRef.current.pause(); surahAudioRef.current = null; }
    setIsSurahPlaying(false);
    setHighlightedVerse(null);
    setHighlightedWord(null);
    setVerseTimings([]);
    if (timingIntervalRef.current) clearInterval(timingIntervalRef.current);
  };

  useEffect(() => {
    return () => { stopSurahAudio(); if (audio) audio.pause(); };
  }, []);

  const scrollToAyah = (ayahNum: number) => {
    const el = ayahRefs.current[ayahNum];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setShowSidebar(false);
  };

  const currentSurah = surahs.find(s => s.number === selectedSurah);
  const getBnName = (s: QuranSurah) => SURAH_NAMES_BN[s.number] || s.englishName;
  const filteredSurahs = surahs.filter(s =>
    s.name.includes(searchQuery) || (SURAH_NAMES_BN[s.number] || "").includes(searchQuery) ||
    toBengaliNum(s.number).includes(searchQuery) || String(s.number).includes(searchQuery)
  );

  const selectedTafsirName = TAFSIR_OPTIONS.find(t => t.id === selectedTafsir)?.name || "তাফসির নেই";

  const breadcrumbItems = selectedSurah && currentSurah
    ? [{ label: "কুরআন", href: "/quran" }, { label: getBnName(currentSurah) }]
    : [{ label: "কুরআন" }];

  // Sidebar content (shared between desktop & mobile)
  const renderSidebarContent = () => (
    <>
      <div className="p-4 border-b border-border bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-card">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={20} className="text-emerald-700 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">সূচিপত্র</p>
            {currentSurah && <p className="text-[11px] text-muted-foreground">{getBnName(currentSurah)}</p>}
          </div>
        </div>
        <input
          type="text"
          placeholder="অনুসন্ধান করুন..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      {/* Two tabs: সূরা | আয়াত */}
      <div className="flex border-b border-border">
        <button 
          onClick={() => setSidebarTab("surah")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${sidebarTab === "surah" ? "text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600" : "text-muted-foreground"}`}
        >
          সূরা
        </button>
        <button 
          onClick={() => setSidebarTab("ayah")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${sidebarTab === "ayah" ? "text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600" : "text-muted-foreground"}`}
        >
          আয়াত
        </button>
      </div>
      <div>
        {sidebarTab === "surah" ? (
          filteredSurahs.map(s => (
            <button
              key={s.number}
              onClick={() => { loadSurah(s.number); setShowSidebar(false); }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors flex items-center gap-3 border-b border-border/50 ${selectedSurah === s.number ? "bg-emerald-100 dark:bg-emerald-900/30 font-bold" : ""}`}
            >
              <span className="flex-shrink-0 text-sm font-medium text-muted-foreground w-8">{toBengaliNum(s.number)}.</span>
              <span className="flex-1 truncate">{getBnName(s)}</span>
              <span className="text-muted-foreground text-xs">{toBengaliNum(s.numberOfAyahs)}</span>
            </button>
          ))
        ) : (
          /* Ayah index */
          ayahs.length > 0 ? ayahs.map(a => (
            <button
              key={a.numberInSurah}
              onClick={() => scrollToAyah(a.numberInSurah)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors flex items-center gap-3 border-b border-border/50 ${highlightedVerse === `${selectedSurah}:${a.numberInSurah}` ? "bg-emerald-100 dark:bg-emerald-900/30 font-bold" : ""}`}
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">{toBengaliNum(a.numberInSurah)}</span>
              <span className="flex-1 text-xs text-muted-foreground line-clamp-1 truncate" dir="rtl" style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}>
                {a.text.substring(0, 50)}...
              </span>
            </button>
          )) : (
            <p className="text-center text-sm text-muted-foreground py-8">একটি সূরা নির্বাচন করুন</p>
          )
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex relative">
        {/* Left Sidebar - Desktop */}
        {selectedSurah && (
          <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-border bg-card sticky top-0 h-screen overflow-y-auto">
            {renderSidebarContent()}
          </aside>
        )}

        {/* Mobile Sidebar Drawer */}
        {showSidebar && selectedSurah && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />
            <aside className="fixed left-0 top-0 bottom-0 w-80 bg-card z-50 lg:hidden overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-3 border-b border-border bg-emerald-50 dark:bg-emerald-950/20">
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5"><BookOpen size={16} /> সূচিপত্র</p>
                <button onClick={() => setShowSidebar(false)} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
              </div>
              {renderSidebarContent()}
            </aside>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <div className="px-4 pt-3 pb-1">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {!selectedSurah ? (
            <>
              {/* Hero */}
              <div className="bg-gradient-to-br from-emerald-800 via-teal-700 to-green-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                }} />
                <div className="relative p-8 pb-10 text-center">
                  <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2"><BookOpen size={28} /> পবিত্র কুরআন</h1>
                  <p className="text-base opacity-80">আরবি মূল ও বাংলা অনুবাদ — শব্দে শব্দে অর্থ — অডিও তেলাওয়াত — তাফসিরসহ</p>
                </div>
              </div>

              <div className="p-4 max-w-5xl mx-auto">
                <div className="relative mb-5">
                  <input
                    type="text"
                    placeholder="সুরার নাম বা নম্বর দিয়ে খুঁজুন..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full border border-border rounded-xl px-5 py-3.5 bg-card text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-12"
                  />
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                {surahLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSurahs.map(s => (
                      <button
                        key={s.number}
                        onClick={() => loadSurah(s.number)}
                        className="text-left bg-card border border-border rounded-2xl p-4 hover:border-emerald-400 hover:shadow-lg transition-all active:scale-[0.98] group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center text-base font-bold shadow-md rotate-45">
                            <span className="-rotate-45">{toBengaliNum(s.number)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-base font-bold">{getBnName(s)}</p>
                              <p className="text-xl font-bold text-right" style={{ fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif" }}>{s.name}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{s.revelationType === "Meccan" ? "মক্কি" : "মাদানি"}</span>
                              <span className="text-xs text-muted-foreground">• {toBengaliNum(s.numberOfAyahs)} আয়াত</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              {/* Surah Title Banner */}
              <div ref={ayahRef} className="text-center py-6 border-b border-border">
                {currentSurah && (
                  <>
                    <h2 className="text-2xl font-bold mb-1">
                      সূরা {getBnName(currentSurah)} ({currentSurah.name})
                    </h2>
                    <p className="text-sm text-muted-foreground mb-1">| সূচনা |</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span>{currentSurah.revelationType === "Meccan" ? "মক্কি" : "মাদানি"}</span>
                      <span>মোট আয়াত: {toBengaliNum(currentSurah.numberOfAyahs)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons row */}
              <div className="flex items-center justify-center gap-3 py-4 border-b border-border bg-card">
                <button
                  onClick={() => setShowTafsirDropdown(!showTafsirDropdown)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-colors text-sm ${selectedTafsir > 0 ? "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400" : "border-border hover:bg-muted"}`}
                >
                  <BookOpen size={16} /> তাফসীর
                </button>
                <button
                  onClick={playSurahAudio}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-colors text-sm ${isSurahPlaying ? "bg-emerald-600 text-white border-emerald-600" : "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"}`}
                >
                  {isSurahPlaying ? <><Pause size={16} /> পজ</> : <><Play size={16} /> পুরো সূরা শুনুন</>}
                </button>
              </div>

              {/* Tafsir dropdown */}
              {showTafsirDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowTafsirDropdown(false)} />
                  <div className="relative z-30 flex justify-center">
                    <div className="absolute top-0 bg-card border border-border rounded-xl shadow-xl w-80 overflow-hidden">
                      {TAFSIR_OPTIONS.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleTafsirChange(t.id)}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors border-b border-border last:border-0 ${selectedTafsir === t.id ? "bg-amber-50 dark:bg-amber-950/30 font-bold text-amber-700 dark:text-amber-400" : ""}`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Sticky toolbar */}
              <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
                <div className="flex items-center gap-2 px-4 py-2.5 flex-wrap">
                  <button
                    onClick={() => { setSelectedSurah(null); setAyahs([]); setTafsirData({}); setWordData({}); audio?.pause(); setPlayingAyah(null); stopSurahAudio(); }}
                    className="p-2 hover:bg-muted rounded-xl transition-colors flex-shrink-0"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex-1 min-w-0">
                    {currentSurah && (
                      <p className="font-bold text-base truncate">{getBnName(currentSurah)}</p>
                    )}
                  </div>
                  <button onClick={() => setShowSidebar(true)} className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden" title="সূচিপত্র">
                    <Menu size={18} />
                  </button>
                  {selectedSurah > 1 && (
                    <button onClick={() => loadSurah(selectedSurah - 1)} className="p-2 hover:bg-muted rounded-lg"><ChevronLeft size={16} /></button>
                  )}
                  {selectedSurah < 114 && (
                    <button onClick={() => loadSurah(selectedSurah + 1)} className="p-2 hover:bg-muted rounded-lg"><ChevronRight size={16} /></button>
                  )}
                </div>

                {/* Toggle row */}
                <div className="flex items-center gap-2 px-4 pb-2.5 flex-wrap">
                  <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${showTranslation ? "bg-emerald-700 text-white border-emerald-700" : "border-border text-muted-foreground"}`}
                  >
                    <AlignLeft size={13} /> অনুবাদ
                  </button>
                  <button
                    onClick={handleWordByWordToggle}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${showWordByWord ? "bg-blue-700 text-white border-blue-700" : "border-border text-muted-foreground"}`}
                  >
                    <BookOpen size={13} /> শব্দার্থ
                  </button>

                  {isSurahPlaying && (
                    <button onClick={stopSurahAudio} className="text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-500 flex items-center gap-1">
                      <Square size={11} /> বন্ধ
                    </button>
                  )}

                  {/* Font size */}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-muted-foreground">আ:</span>
                    <button onClick={() => setFontSize(f => Math.max(20, f - 2))} className="p-1 hover:bg-muted rounded"><Minus size={13} /></button>
                    <button onClick={() => setFontSize(f => Math.min(48, f + 2))} className="p-1 hover:bg-muted rounded"><Plus size={13} /></button>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">ব:</span>
                    <button onClick={() => setTranslationSize(f => Math.max(14, f - 1))} className="p-1 hover:bg-muted rounded"><Minus size={13} /></button>
                    <button onClick={() => setTranslationSize(f => Math.min(26, f + 1))} className="p-1 hover:bg-muted rounded"><Plus size={13} /></button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4 p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-muted rounded-xl h-40 animate-pulse" />
                  ))}
                </div>
              ) : (
              <div className="max-w-4xl mx-auto">
                  {/* Bismillah */}
                  {selectedSurah !== 1 && selectedSurah !== 9 && (
                    <div className="text-center py-8 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                      <p
                        className="text-emerald-800 dark:text-emerald-300"
                        dir="rtl"
                        style={{
                          fontSize: `${fontSize + 6}px`,
                          fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                          lineHeight: 2.2,
                        }}
                      >
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                      </p>
                      <p className="text-sm text-muted-foreground mt-3">পরম করুণাময় অসীম দয়ালু আল্লাহর নামে</p>
                    </div>
                  )}

                  {/* Flowing mode: when translation is off, show all ayahs together */}
                  {!showTranslation && !showWordByWord && selectedTafsir === 0 ? (
                    <div className="px-6 py-8 bg-gradient-to-b from-emerald-50/30 to-transparent dark:from-emerald-950/10">
                      <p
                        className="text-right leading-[2.8] text-foreground"
                        dir="rtl"
                        style={{
                          fontSize: `${fontSize}px`,
                          fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                          fontWeight: 400,
                          wordSpacing: '6px',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {ayahs.map((ayah, idx) => {
                          const verseKey = `${selectedSurah}:${ayah.numberInSurah}`;
                          const isHighlightedVerse = highlightedVerse === verseKey;

                          return (
                            <span
                              key={ayah.number}
                              ref={el => { ayahRefs.current[ayah.numberInSurah] = el as any; }}
                              className={`transition-colors duration-300 ${isHighlightedVerse ? "bg-emerald-100/80 dark:bg-emerald-900/40 rounded-md" : ""}`}
                            >
                              {(isSurahPlaying || playingAyah) && wordData[verseKey] ? (
                                wordData[verseKey].map((w, wi) => (
                                  <span
                                    key={wi}
                                    className={`transition-all duration-150 ${
                                      highlightedWord?.verseKey === verseKey && highlightedWord?.wordIndex === wi
                                        ? "bg-yellow-300/80 dark:bg-yellow-600/60 rounded-md px-1 py-1"
                                        : ""
                                    }`}
                                  >
                                    {w.text_uthmani}{" "}
                                  </span>
                                ))
                              ) : (
                                ayah.text
                              )}
                              <span
                                className="text-emerald-600 dark:text-emerald-400 mx-1 cursor-pointer hover:text-emerald-800"
                                style={{ fontSize: `${fontSize * 0.75}px` }}
                                onClick={() => playAudio(ayah.number)}
                              >
                                ﴿{toBengaliNum(ayah.numberInSurah)}﴾
                              </span>
                              {" "}
                            </span>
                          );
                        })}
                      </p>
                    </div>
                  ) : (
                  /* Individual ayah mode */
                  ayahs.map(ayah => {
                    const verseKey = `${selectedSurah}:${ayah.numberInSurah}`;
                    const tafsirText = tafsirData[verseKey];
                    const words = wordData[verseKey];
                    const isHighlightedVerse = highlightedVerse === verseKey;
                    const isBookmarked = bookmarkedAyahs.has(verseKey);

                    return (
                      <div 
                        key={ayah.number} 
                        ref={el => { ayahRefs.current[ayah.numberInSurah] = el; }}
                        className={`border-b border-border transition-colors duration-300 ${isHighlightedVerse ? "bg-emerald-50/60 dark:bg-emerald-950/30" : "hover:bg-muted/20"}`}
                      >
                        {/* Ayah number badge */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                              {toBengaliNum(ayah.numberInSurah)}
                            </span>
                            <span className="text-xs text-muted-foreground">আয়াত {toBengaliNum(ayah.numberInSurah)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleBookmark(verseKey)}
                              className={`p-2 rounded-lg transition-colors ${isBookmarked ? "text-amber-500" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                              title="বুকমার্ক"
                            >
                              {isBookmarked ? <BookMarked size={16} /> : <Bookmark size={16} />}
                            </button>
                            <button
                              onClick={() => shareAyah(ayah)}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                              title="শেয়ার করুন"
                            >
                              <Share2 size={16} />
                            </button>
                            <button
                              onClick={() => playAudio(ayah.number)}
                              className={`p-2 rounded-lg transition-colors ${playingAyah === ayah.number ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                              title="অডিও"
                            >
                              {playingAyah === ayah.number ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* Arabic text - with waqf symbols preserved */}
                        <div className="px-6 pt-2 pb-4">
                          <p
                            className="text-right leading-[2.8] text-foreground"
                            dir="rtl"
                            style={{ 
                              fontSize: `${fontSize}px`,
                              fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                              fontWeight: 400,
                              wordSpacing: '6px',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {(isSurahPlaying || playingAyah) && words ? (
                              words.map((w, wi) => (
                                <span
                                  key={wi}
                                  className={`transition-all duration-150 ${
                                    highlightedWord?.verseKey === verseKey && highlightedWord?.wordIndex === wi
                                      ? "bg-yellow-300/80 dark:bg-yellow-600/60 rounded-md px-1 py-1"
                                      : ""
                                  }`}
                                >
                                  {w.text_uthmani}{" "}
                                </span>
                              ))
                            ) : (
                              ayah.text
                            )}
                            {/* Verse end marker */}
                            <span className="text-emerald-600 dark:text-emerald-400 mx-1" style={{ fontSize: `${fontSize * 0.7}px` }}>
                              ﴿{toBengaliNum(ayah.numberInSurah)}﴾
                            </span>
                          </p>
                        </div>

                        {/* Bengali translation */}
                        {showTranslation && (
                          <div className="px-6 pb-4 border-t border-border/50 pt-3">
                            <p className="text-xs text-muted-foreground mb-1.5 italic">মুফতী তাকী উসমানী</p>
                            <p className="text-foreground leading-relaxed" style={{ fontSize: `${translationSize}px` }}>
                              {ayah.translation}
                            </p>
                          </div>
                        )}

                        {/* Word by word */}
                        {showWordByWord && (
                          <div className="px-6 pb-4 border-t border-blue-200 dark:border-blue-900/30 pt-4">
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-1.5"><BookOpen size={16} /> শব্দে শব্দে অনুবাদ</p>
                            {wordDataLoading ? (
                              <div className="h-12 bg-muted rounded animate-pulse" />
                            ) : words ? (
                              <div className="flex flex-wrap gap-3 justify-end" dir="rtl">
                                {words.filter(w => w.char_type_name === "word").map((w, wi) => (
                                  <div key={wi} className="bg-card border border-border rounded-xl px-4 py-3 text-center min-w-[80px] hover:border-blue-400 hover:shadow-md transition-all">
                                    <p className="leading-relaxed text-foreground mb-1" dir="rtl" style={{ 
                                      fontSize: `${Math.max(18, fontSize - 8)}px`,
                                      fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif" 
                                    }}>{w.text_uthmani}</p>
                                    <p className="text-sm text-foreground font-medium" dir="ltr">{w.translation?.text || ""}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">শব্দার্থ লোড হচ্ছে...</p>
                            )}
                          </div>
                        )}

                        {/* Tafsir */}
                        {selectedTafsir > 0 && (
                          <div className="mx-6 mb-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl px-5 py-4 border border-amber-200 dark:border-amber-800/30">
                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-500 mb-2 flex items-center gap-1.5">
                              <BookOpen size={16} /> তাফসীরঃ
                            </p>
                            {tafsirLoading ? (
                              <div className="h-10 bg-muted rounded animate-pulse" />
                            ) : tafsirText ? (
                              <div
                                className="text-foreground leading-relaxed prose prose-base max-w-none dark:prose-invert"
                                style={{ fontSize: `${translationSize}px` }}
                                dangerouslySetInnerHTML={{ __html: tafsirText }}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground italic">এই আয়াতের তাফসির পাওয়া যায়নি</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const QuranPage = () => {
  const isApp = useIsApp();
  if (isApp) return <AppLayout><QuranContent /></AppLayout>;
  return <Layout fullWidth><SEOHead title="কুরআন মাজীদ" description="সম্পূর্ণ কুরআন বাংলা অনুবাদ ও তাফসীরসহ — সূরা, আয়াত, শব্দার্থ এবং অডিও তিলাওয়াত।" keywords="কুরআন, বাংলা অনুবাদ, তাফসীর, সূরা, আয়াত, তিলাওয়াত" /><QuranContent /></Layout>;
};

export default QuranPage;
