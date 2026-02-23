import Layout from "@/components/layout/Layout";
import { useIsApp } from "@/hooks/useIsApp";
import AppLayout from "@/components/app/AppLayout";
import { useEffect, useState, useRef, useCallback } from "react";
import { Volume2, VolumeX, ChevronLeft, ChevronRight, AlignLeft, Plus, Minus, ChevronDown, Play, Pause, Square, BookOpen } from "lucide-react";

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
];

const RECITER_ID = 7; // Mishari Rashid al-Afasy

const QuranContent = () => {
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
  const [fontSize, setFontSize] = useState(24);
  const [translationSize, setTranslationSize] = useState(14);
  const ayahRef = useRef<HTMLDivElement>(null);

  // Word-by-word data
  const [wordData, setWordData] = useState<Record<string, WordData[]>>({});
  const [wordDataLoading, setWordDataLoading] = useState(false);

  // Full surah audio
  const [isSurahPlaying, setIsSurahPlaying] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState<string | null>(null);
  const [highlightedWord, setHighlightedWord] = useState<{ verseKey: string; wordIndex: number } | null>(null);
  const [verseTimings, setVerseTimings] = useState<{ verse_key: string; timestamp_from: number; timestamp_to: number; segments: number[][] }[]>([]);
  const surahAudioRef = useRef<HTMLAudioElement | null>(null);
  const timingIntervalRef = useRef<number | null>(null);

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
          data.verses.forEach((v: any) => {
            allWords[v.verse_key] = v.words || [];
          });
        }
        if (!data.pagination || page >= data.pagination.total_pages) break;
      }
      setWordData(allWords);
    } catch {
      setWordData({});
    }
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
      // Use quran.com API for proper Uthmani text with waqf marks
      const totalAyahs = surahs.find(s => s.number === num)?.numberOfAyahs || 7;
      const totalPages = Math.ceil(totalAyahs / 50);
      
      let allArabicAyahs: any[] = [];
      for (let page = 1; page <= totalPages; page++) {
        const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${num}?language=bn&per_page=50&page=${page}&fields=text_uthmani&translations=161`);
        const data = await res.json();
        if (data.verses) {
          allArabicAyahs = [...allArabicAyahs, ...data.verses];
        }
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
    } catch {
      setAyahs([]);
    }
    setLoading(false);
  };

  // Helper to get global ayah number offset for a surah
  const getAyahOffset = (surahNum: number): number => {
    // Cumulative ayah counts before each surah (approximate, used for audio URLs)
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
      if (data.tafsirs) {
        data.tafsirs.forEach((t: TafsirEntry) => { map[t.verse_key] = t.text; });
      }
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
    if (next && selectedSurah && Object.keys(wordData).length === 0) {
      loadWordByWord(selectedSurah);
    }
  };

  const playAudio = (ayahNumber: number) => {
    if (audio) { audio.pause(); audio.currentTime = 0; }
    if (timingIntervalRef.current) clearInterval(timingIntervalRef.current);
    if (playingAyah === ayahNumber) { 
      setPlayingAyah(null); 
      setHighlightedWord(null);
      setHighlightedVerse(null);
      return; 
    }

    const ayah = ayahs.find(a => a.number === ayahNumber);
    const verseKey = selectedSurah && ayah ? `${selectedSurah}:${ayah.numberInSurah}` : null;

    // Load word data if needed for highlighting
    if (verseKey && Object.keys(wordData).length === 0 && selectedSurah) {
      loadWordByWord(selectedSurah);
    }

    const newAudio = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`);
    newAudio.play();
    
    if (verseKey) setHighlightedVerse(verseKey);

    // Estimate word-by-word highlighting based on audio duration
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

    newAudio.onended = () => {
      setPlayingAyah(null);
      setHighlightedWord(null);
      setHighlightedVerse(null);
      if (timingIntervalRef.current) clearInterval(timingIntervalRef.current);
    };

    setAudio(newAudio);
    setPlayingAyah(ayahNumber);
  };

  // Full surah audio with verse-level highlighting
  const playSurahAudio = async () => {
    if (!selectedSurah) return;
    
    if (isSurahPlaying && surahAudioRef.current) {
      surahAudioRef.current.pause();
      setIsSurahPlaying(false);
      if (timingIntervalRef.current) clearInterval(timingIntervalRef.current);
      return;
    }

    if (surahAudioRef.current) {
      surahAudioRef.current.play();
      setIsSurahPlaying(true);
      startTimingSync();
      return;
    }

    try {
      // Get audio file URL and verse timings
      const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${RECITER_ID}/${selectedSurah}`);
      const data = await res.json();
      const audioFile = data.audio_file;
      if (!audioFile?.audio_url) return;

      // Store verse timings
      if (audioFile.verse_timings) {
        setVerseTimings(audioFile.verse_timings.map((vt: any) => ({
          verse_key: vt.verse_key,
          timestamp_from: vt.timestamp_from,
          timestamp_to: vt.timestamp_to,
          segments: vt.segments || [],
        })));
      }

      // Also load word-by-word data if not already loaded (needed for word highlighting)
      if (Object.keys(wordData).length === 0) {
        loadWordByWord(selectedSurah);
      }

      const newAudio = new Audio(`https://verses.quran.com/${audioFile.audio_url}`);
      surahAudioRef.current = newAudio;
      
      newAudio.onended = () => {
        setIsSurahPlaying(false);
        setHighlightedVerse(null);
        setHighlightedWord(null);
        if (timingIntervalRef.current) clearInterval(timingIntervalRef.current);
      };

      newAudio.oncanplaythrough = () => {
        newAudio.play();
        setIsSurahPlaying(true);
        startTimingSync();
      };

      newAudio.load();
    } catch { /* ignore */ }
  };

  const startTimingSync = () => {
    if (timingIntervalRef.current) clearInterval(timingIntervalRef.current);
    timingIntervalRef.current = window.setInterval(() => {
      if (!surahAudioRef.current) return;
      const currentMs = surahAudioRef.current.currentTime * 1000;
      
      // Find current verse
      for (const vt of verseTimings) {
        if (currentMs >= vt.timestamp_from && currentMs < vt.timestamp_to) {
          setHighlightedVerse(vt.verse_key);
          
          // Find current word within verse segments
          if (vt.segments && vt.segments.length > 0) {
            for (const seg of vt.segments) {
              if (seg.length >= 3 && currentMs >= seg[1] && currentMs < seg[2]) {
                setHighlightedWord({ verseKey: vt.verse_key, wordIndex: seg[0] - 1 });
                return;
              }
            }
          }
          return;
        }
      }
    }, 80);
  };

  const stopSurahAudio = () => {
    if (surahAudioRef.current) {
      surahAudioRef.current.pause();
      surahAudioRef.current = null;
    }
    setIsSurahPlaying(false);
    setHighlightedVerse(null);
    setHighlightedWord(null);
    setVerseTimings([]);
    if (timingIntervalRef.current) clearInterval(timingIntervalRef.current);
  };

  useEffect(() => {
    return () => {
      stopSurahAudio();
      if (audio) audio.pause();
    };
  }, []);

  const currentSurah = surahs.find(s => s.number === selectedSurah);
  const getBnName = (s: QuranSurah) => SURAH_NAMES_BN[s.number] || s.englishName;
  
  const filteredSurahs = surahs.filter(s =>
    s.name.includes(searchQuery) ||
    (SURAH_NAMES_BN[s.number] || "").includes(searchQuery) ||
    toBengaliNum(s.number).includes(searchQuery) ||
    String(s.number).includes(searchQuery)
  );

  const selectedTafsirName = TAFSIR_OPTIONS.find(t => t.id === selectedTafsir)?.name || "তাফসির নেই";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-emerald-800 to-teal-700 text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-1">📖 পবিত্র কুরআন</h1>
        <p className="text-sm opacity-80">আরবি মূল ও বাংলা অনুবাদ — শব্দে শব্দে অর্থ — অডিও তেলাওয়াত — তাফসিরসহ</p>
      </div>

      {!selectedSurah ? (
        <div className="p-4">
          <input
            type="text"
            placeholder="সুরার নাম বা নম্বর দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 mb-4 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          {surahLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredSurahs.map(s => (
                <button
                  key={s.number}
                  onClick={() => loadSurah(s.number)}
                  className="text-left bg-card border border-border rounded-xl p-3 hover:border-emerald-500 hover:shadow-md transition-all active:scale-95 group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                      {toBengaliNum(s.number)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{toBengaliNum(s.numberOfAyahs)} আয়াত</span>
                  </div>
                  <p className="text-xl font-bold text-right leading-snug mb-1" style={{ fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif" }}>{s.name}</p>
                  <p className="text-[11px] text-foreground font-medium">{getBnName(s)}</p>
                  <p className="text-[10px] text-muted-foreground opacity-70">{s.revelationType === "Meccan" ? "মক্কি" : "মাদানি"}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Sticky header */}
          <div ref={ayahRef} className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => { setSelectedSurah(null); setAyahs([]); setTafsirData({}); setWordData({}); audio?.pause(); setPlayingAyah(null); stopSurahAudio(); }}
                className="p-2 hover:bg-muted rounded-xl transition-colors flex-shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1 min-w-0">
                {currentSurah && (
                  <>
                    <p className="font-bold text-sm truncate">{getBnName(currentSurah)} — <span style={{ fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif" }} className="text-base">{currentSurah.name}</span></p>
                    <p className="text-xs text-muted-foreground">
                      {toBengaliNum(currentSurah.numberOfAyahs)} আয়াত • {currentSurah.revelationType === "Meccan" ? "মক্কি" : "মাদানি"}
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                {selectedSurah > 1 && (
                  <button onClick={() => loadSurah(selectedSurah - 1)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                )}
                {selectedSurah < 114 && (
                  <button onClick={() => loadSurah(selectedSurah + 1)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Toggle row */}
            <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${showTranslation ? "bg-emerald-700 text-white border-emerald-700" : "border-border text-muted-foreground"}`}
              >
                <AlignLeft size={11} /> অনুবাদ
              </button>

              <button
                onClick={handleWordByWordToggle}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${showWordByWord ? "bg-blue-700 text-white border-blue-700" : "border-border text-muted-foreground"}`}
              >
                <BookOpen size={11} /> শব্দার্থ
              </button>

              <button
                onClick={playSurahAudio}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${isSurahPlaying ? "bg-orange-600 text-white border-orange-600" : "border-border text-muted-foreground"}`}
              >
                {isSurahPlaying ? <Pause size={11} /> : <Play size={11} />}
                {isSurahPlaying ? "বিরতি" : "পুরো সুরা শুনুন"}
              </button>

              {isSurahPlaying && (
                <button
                  onClick={stopSurahAudio}
                  className="text-[10px] px-2 py-1 rounded-lg border border-red-500 text-red-500 flex items-center gap-1"
                >
                  <Square size={9} /> বন্ধ
                </button>
              )}

              {/* Tafsir dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowTafsirDropdown(!showTafsirDropdown)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${selectedTafsir > 0 ? "bg-amber-700 text-white border-amber-700" : "border-border text-muted-foreground"}`}
                >
                  📚 {selectedTafsir > 0 ? selectedTafsirName : "তাফসির"} <ChevronDown size={10} />
                </button>
                {showTafsirDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowTafsirDropdown(false)} />
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-30 w-72 overflow-hidden">
                      {TAFSIR_OPTIONS.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleTafsirChange(t.id)}
                          className={`w-full text-left px-3 py-2.5 text-xs hover:bg-muted transition-colors border-b border-border last:border-0 ${selectedTafsir === t.id ? "bg-amber-50 dark:bg-amber-950/30 font-bold text-amber-700 dark:text-amber-400" : ""}`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Font size controls */}
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-[10px] text-muted-foreground">আরবি:</span>
                <button onClick={() => setFontSize(f => Math.max(16, f - 2))} className="p-1 hover:bg-muted rounded"><Minus size={11} /></button>
                <span className="text-[10px] w-5 text-center font-bold">{fontSize}</span>
                <button onClick={() => setFontSize(f => Math.min(40, f + 2))} className="p-1 hover:bg-muted rounded"><Plus size={11} /></button>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">অর্থ:</span>
                <button onClick={() => setTranslationSize(f => Math.max(11, f - 1))} className="p-1 hover:bg-muted rounded"><Minus size={11} /></button>
                <span className="text-[10px] w-5 text-center font-bold">{translationSize}</span>
                <button onClick={() => setTranslationSize(f => Math.min(20, f + 1))} className="p-1 hover:bg-muted rounded"><Plus size={11} /></button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-muted rounded-xl h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-0">
              {ayahs.map(ayah => {
                const verseKey = `${selectedSurah}:${ayah.numberInSurah}`;
                const tafsirText = tafsirData[verseKey];
                const words = wordData[verseKey];
                const isHighlightedVerse = highlightedVerse === verseKey;

                return (
                  <div key={ayah.number} className={`p-4 border-b border-border transition-colors duration-300 ${isHighlightedVerse ? "bg-emerald-50/60 dark:bg-emerald-950/30" : "hover:bg-muted/30"}`}>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center">
                        {toBengaliNum(ayah.numberInSurah)}
                      </span>
                      <button
                        onClick={() => playAudio(ayah.number)}
                        className={`flex-shrink-0 p-2 rounded-lg transition-colors ${playingAyah === ayah.number ? "bg-emerald-700 text-white" : "hover:bg-muted text-muted-foreground"}`}
                      >
                        {playingAyah === ayah.number ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    </div>

                    {/* Arabic text with word highlighting */}
                    <p
                      className="text-right mb-4 text-foreground"
                      dir="rtl"
                      style={{ 
                        fontSize: `${fontSize}px`,
                        fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif",
                        fontWeight: 400,
                        lineHeight: 2.6,
                        wordSpacing: '4px',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {(isSurahPlaying || playingAyah) && words ? (
                        words.filter(w => w.char_type_name === "word" || w.char_type_name === "end").map((w, wi) => (
                          <span
                            key={wi}
                            className={`transition-all duration-150 ${
                              highlightedWord?.verseKey === verseKey && highlightedWord?.wordIndex === wi
                                ? "bg-yellow-300/80 dark:bg-yellow-600/60 rounded px-1 py-0.5"
                                : ""
                            }`}
                          >
                            {w.text_uthmani}{" "}
                          </span>
                        ))
                      ) : (
                        ayah.text
                      )}
                      <span className="inline-block mx-1 text-emerald-600 dark:text-emerald-400" style={{ fontSize: `${Math.max(14, fontSize - 6)}px` }}>
                        ﴿{toBengaliNum(ayah.numberInSurah)}﴾
                      </span>
                    </p>

                    {/* Word by word section - no transliteration */}
                    {showWordByWord && (
                      <div className="border-t border-blue-200 dark:border-blue-900/30 pt-3 mt-2">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">📖 শব্দে শব্দে অনুবাদ</p>
                        {wordDataLoading ? (
                          <div className="h-10 bg-muted rounded animate-pulse" />
                        ) : words ? (
                          <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                            {words.filter(w => w.char_type_name === "word").map((w, wi) => (
                              <div key={wi} className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-center min-w-[60px] hover:border-blue-400 transition-colors">
                                <p className="leading-relaxed text-foreground" dir="rtl" style={{ 
                                  fontSize: `${Math.max(14, fontSize - 6)}px`,
                                  fontFamily: "'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif" 
                                }}>{w.text_uthmani}</p>
                                <p className="text-[10px] text-blue-700 dark:text-blue-400 mt-0.5" dir="ltr">{w.translation?.text || ""}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">শব্দার্থ লোড হচ্ছে...</p>
                        )}
                      </div>
                    )}

                    {/* Bengali Translation */}
                    {showTranslation && (
                      <div className="border-t border-border pt-3 mt-2">
                        <p className="text-xs font-semibold text-emerald-700 mb-1">📝 অনুবাদ</p>
                        <p className="text-muted-foreground leading-relaxed" style={{ fontSize: `${translationSize}px` }}>
                          {ayah.translation}
                        </p>
                      </div>
                    )}

                    {/* Tafsir */}
                    {selectedTafsir > 0 && (
                      <div className="border-t border-amber-200 dark:border-amber-900/30 pt-3 mt-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-500 mb-1">
                          📚 {selectedTafsirName}
                        </p>
                        {tafsirLoading ? (
                          <div className="h-8 bg-muted rounded animate-pulse" />
                        ) : tafsirText ? (
                          <div
                            className="text-muted-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                            style={{ fontSize: `${translationSize}px` }}
                            dangerouslySetInnerHTML={{ __html: tafsirText }}
                          />
                        ) : (
                          <p className="text-xs text-muted-foreground italic">এই আয়াতের তাফসির পাওয়া যায়নি</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const QuranPage = () => {
  const isApp = useIsApp();
  if (isApp) {
    return <AppLayout><QuranContent /></AppLayout>;
  }
  return <Layout><QuranContent /></Layout>;
};

export default QuranPage;
