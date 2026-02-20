import Layout from "@/components/layout/Layout";
import { useIsApp } from "@/hooks/useIsApp";
import AppLayout from "@/components/app/AppLayout";
import { useEffect, useState, useRef } from "react";
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";

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

const toBengaliNum = (n: number | string) => {
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (x) => d[+x]);
};

const QuranContent = () => {
  const [surahs, setSurahs] = useState<QuranSurah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [loading, setLoading] = useState(false);
  const [surahLoading, setSurahLoading] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const ayahRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then(r => r.json())
      .then(d => { setSurahs(d.data); setSurahLoading(false); })
      .catch(() => setSurahLoading(false));
  }, []);

  const loadSurah = async (num: number) => {
    setLoading(true);
    setSelectedSurah(num);
    setAyahs([]);
    try {
      const [arabic, bangla] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${num}`).then(r => r.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${num}/bn.bengali`).then(r => r.json()),
      ]);
      const combined = arabic.data.ayahs.map((a: any, i: number) => ({
        number: a.number,
        text: a.text,
        translation: bangla.data.ayahs[i]?.text || "",
        numberInSurah: a.numberInSurah,
      }));
      setAyahs(combined);
      setTimeout(() => ayahRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setAyahs([]);
    }
    setLoading(false);
  };

  const playAudio = (ayahNumber: number) => {
    if (audio) { audio.pause(); audio.currentTime = 0; }
    if (playingAyah === ayahNumber) { setPlayingAyah(null); return; }
    const newAudio = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`);
    newAudio.play();
    newAudio.onended = () => setPlayingAyah(null);
    setAudio(newAudio);
    setPlayingAyah(ayahNumber);
  };

  const currentSurah = surahs.find(s => s.number === selectedSurah);
  const filteredSurahs = surahs.filter(s =>
    s.name.includes(searchQuery) ||
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    toBengaliNum(s.number).includes(searchQuery) ||
    String(s.number).includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-emerald-800 to-teal-700 text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-1">📖 পবিত্র কুরআন</h1>
        <p className="text-sm opacity-80">আরবি মূল ও বাংলা অনুবাদসহ — অডিও তেলাওয়াত</p>
      </div>

      {!selectedSurah ? (
        <div className="p-4 max-w-3xl mx-auto">
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
                  <p className="font-arabic text-xl font-bold text-right leading-snug mb-1">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.englishName}</p>
                  <p className="text-[10px] text-muted-foreground opacity-70">{s.revelationType === "Meccan" ? "মক্কি" : "মাদানি"}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div ref={ayahRef} className="sticky top-0 z-10 bg-card border-b border-border flex items-center gap-3 px-4 py-3 shadow-sm">
            <button
              onClick={() => { setSelectedSurah(null); setAyahs([]); audio?.pause(); setPlayingAyah(null); }}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              {currentSurah && (
                <>
                  <p className="font-bold text-sm">{currentSurah.englishName} — <span className="font-arabic text-base">{currentSurah.name}</span></p>
                  <p className="text-xs text-muted-foreground">
                    {toBengaliNum(currentSurah.numberOfAyahs)} আয়াত • {currentSurah.revelationType === "Meccan" ? "মক্কি" : "মাদানি"}
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${showTranslation ? "bg-emerald-700 text-white border-emerald-700" : "border-border text-muted-foreground"}`}
              >
                অনুবাদ
              </button>
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

          {loading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-muted rounded-xl h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {ayahs.map(ayah => (
                <div key={ayah.number} className="p-4 hover:bg-muted/30 transition-colors">
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
                  <p className="font-arabic text-2xl font-bold text-right leading-[2.6] mb-3 text-foreground" dir="rtl">
                    {ayah.text}
                  </p>
                  {showTranslation && (
                    <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3 mt-2">
                      {ayah.translation}
                    </p>
                  )}
                </div>
              ))}
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
