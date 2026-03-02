import { useSliders } from "@/hooks/useData";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AppBannerSlider = () => {
  const { data: sliders } = useSliders();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!sliders?.length) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % sliders.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [sliders?.length]);

  if (!sliders?.length) return (
    <div className="w-[calc(100%-24px)] max-w-full aspect-[2/1] bg-muted rounded-2xl mx-auto mt-3 animate-pulse" />
  );

  return (
    <div className="relative w-[calc(100%-24px)] max-w-full aspect-[2/1] overflow-hidden bg-muted dark:bg-muted/50 rounded-2xl mx-auto mt-3 shadow-lg transition-colors duration-300">
      {sliders.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          <img
            src={slide.image_url}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
            width={800}
            height={400}
            fetchPriority={i === 0 ? "high" : "auto"}
          />
          {slide.title && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 py-4">
              <p className="text-white text-sm font-semibold truncate drop-shadow-md">{slide.title}</p>
            </div>
          )}
        </div>
      ))}

      {sliders.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + sliders.length) % sliders.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 hover:bg-white/30 active:scale-90"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % sliders.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 hover:bg-white/30 active:scale-90"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sliders.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "bg-white w-6 shadow-md" : "bg-white/40 w-1.5"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AppBannerSlider;
