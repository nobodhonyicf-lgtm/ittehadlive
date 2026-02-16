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

  if (!sliders?.length) return null;

  return (
    <div className="relative w-full aspect-[16/7] overflow-hidden bg-muted">
      {sliders.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image_url}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {slide.title && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
              <p className="text-white text-sm font-medium truncate">{slide.title}</p>
            </div>
          )}
        </div>
      ))}

      {sliders.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + sliders.length) % sliders.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % sliders.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sliders.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === current ? "bg-white w-4" : "bg-white/50"
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
