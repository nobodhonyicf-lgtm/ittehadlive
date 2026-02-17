import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Image } from "lucide-react";
import { toBengali } from "@/lib/bengali";

const AppGallerySection = () => {
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
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-colors duration-300 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-accent/50 to-accent/20 dark:from-accent/30 dark:to-accent/10 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 dark:bg-primary/25 flex items-center justify-center">
            <Image size={14} className="text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground">ফটো গ্যালারি</h2>
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{toBengali(gallery.length)}টি ছবি</span>
      </div>
      <div className="grid grid-cols-3 gap-1 p-2">
        {gallery.map((item, i) => (
          <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer">
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
  );
};

export default AppGallerySection;
