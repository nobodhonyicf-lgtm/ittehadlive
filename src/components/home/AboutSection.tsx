import { useSiteSettings, useSliders } from "@/hooks/useData";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import SectionHeader from "./SectionHeader";

const AboutSection = () => {
  const { data: settings } = useSiteSettings();
  const { data: sliders } = useSliders();
  const [current, setCurrent] = useState(0);

  const slideCount = sliders?.length || 0;

  const next = useCallback(() => {
    if (slideCount > 0) setCurrent((p) => (p + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next, slideCount]);

  return (
    <div>
      <SectionHeader title="পরিচিতি" linkUrl="/page/about" />
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <p className="text-foreground leading-relaxed text-justify">
            {settings?.about_text || "লোড হচ্ছে..."}
          </p>
          <Link
            to="/page/about"
            className="inline-block mt-3 text-primary hover:underline font-bold text-sm"
          >
            বিস্তারিত →
          </Link>
        </div>

        {sliders && sliders.length > 0 && (
          <div className="w-full md:w-72 shrink-0">
            <div className="relative overflow-hidden rounded-lg h-48">
              <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${current * 100}%)` }}
              >
                {sliders.map((slide) => (
                  <div key={slide.id} className="min-w-full h-full">
                    {slide.link ? (
                      <a href={slide.link} target="_blank" rel="noopener noreferrer">
                        <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover rounded-lg" />
                      </a>
                    ) : (
                      <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover rounded-lg" />
                    )}
                  </div>
                ))}
              </div>
              {slideCount > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {sliders.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-primary/30"}`}
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
