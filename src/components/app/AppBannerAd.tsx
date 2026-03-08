import { useAds } from "@/hooks/useData";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface AppBannerAdProps {
  position?: string;
}

const AppBannerAd = ({ position = "slider" }: AppBannerAdProps) => {
  const [hideAds, setHideAds] = useState(() => localStorage.getItem("app-hide-ads") === "true");
  const { data: ads } = useAds(position);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!ads?.length) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads?.length]);

  if (hideAds || !ads?.length) return null;

  const visibleAds = ads.filter((ad) => !dismissed.has(ad.id));
  if (!visibleAds.length) return null;

  const ad = visibleAds[current % visibleAds.length];

  return (
    <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-sm bg-card">
      <a
        href={ad.link || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-auto object-cover"
          style={{ maxHeight: "120px" }}
          loading="lazy"
        />
      </a>
      {/* Ad label + dismiss */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
        <span className="text-[8px] bg-black/50 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm font-medium">
          বিজ্ঞাপন
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDismissed((prev) => new Set(prev).add(ad.id));
        }}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors"
      >
        <X size={10} />
      </button>
      {/* Dots indicator */}
      {visibleAds.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
          {visibleAds.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current % visibleAds.length ? "bg-white w-3" : "bg-white/40 w-1"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppBannerAd;
