import { useSiteSettings, useSliders } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeader from "./SectionHeader";

const AboutSection = () => {
  const { data: settings } = useSiteSettings();
  const { data: sliders } = useSliders();
  const [current, setCurrent] = useState(0);

  const slideCount = sliders?.length || 0;

  const next = useCallback(() => {
    if (slideCount > 0) setCurrent((p) => (p + 1) % slideCount);
  }, [slideCount]);

  const prev = useCallback(() => {
    if (slideCount > 0) setCurrent((p) => (p - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, slideCount]);

  return (
    <div>
      <SectionHeader title="পরিচিতি" linkUrl="/page/about" />
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <p className="text-foreground leading-relaxed text-justify text-[15px]">
            {settings?.about_text || "লোড হচ্ছে..."}
          </p>
          <Link
            to="/page/about"
            className="inline-flex items-center gap-1 mt-4 text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
          >
            বিস্তারিত পড়ুন
            <ChevronRight size={14} />
          </Link>
        </div>

        {sliders && sliders.length > 0 && (
          <div className="w-full md:w-80 shrink-0">
            <div className="relative overflow-hidden rounded-xl h-52 group shadow-md">
              {/* Slides */}
              <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${current * 100}%)` }}
              >
                {sliders.map((slide) => (
                  <div key={slide.id} className="min-w-full h-full relative">
                    {slide.link ? (
                      <a href={slide.link} target="_blank" rel="noopener noreferrer">
                        <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                      </a>
                    ) : (
                      <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                    )}
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3">
                      <p className="text-white text-xs font-medium line-clamp-1">{slide.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Nav arrows */}
              {slideCount > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Dots */}
              {slideCount > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {sliders.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`rounded-full transition-all duration-300 ${i === current ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutSection;
