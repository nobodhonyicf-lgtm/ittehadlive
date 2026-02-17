import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Image, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AppGallerySection = () => {
  const navigate = useNavigate();
  const [viewIndex, setViewIndex] = useState<number | null>(null);

  const { data: gallery } = useQuery({
    queryKey: ["gallery_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  if (!gallery?.length) return null;

  return (
    <>
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-colors duration-300 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-accent/50 to-accent/20 dark:from-accent/30 dark:to-accent/10 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 dark:bg-primary/25 flex items-center justify-center">
              <Image size={14} className="text-primary" />
            </div>
            <h2 className="text-sm font-bold text-foreground">ফটো গ্যালারি</h2>
          </div>
          <button
            onClick={() => navigate("/page/gallery")}
            className="text-[11px] text-primary font-medium hover:underline"
          >
            আরও ছবি দেখুন →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 p-2">
          {gallery.map((item, i) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
              onClick={() => setViewIndex(i)}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-1.5">
                <p className="text-white text-[9px] font-medium line-clamp-1">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {viewIndex !== null && gallery[viewIndex] && (
        <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center" onClick={() => setViewIndex(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10" onClick={() => setViewIndex(null)}>
            <X size={28} />
          </button>
          {gallery.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center backdrop-blur-sm z-10"
                onClick={(e) => { e.stopPropagation(); setViewIndex((viewIndex - 1 + gallery.length) % gallery.length); }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center backdrop-blur-sm z-10"
                onClick={(e) => { e.stopPropagation(); setViewIndex((viewIndex + 1) % gallery.length); }}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={gallery[viewIndex].image_url}
              alt={gallery[viewIndex].title}
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
            <p className="text-white text-sm mt-3 text-center">{gallery[viewIndex].title}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AppGallerySection;
