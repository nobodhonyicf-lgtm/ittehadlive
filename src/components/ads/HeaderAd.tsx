import { useAds } from "@/hooks/useData";

const HeaderAd = () => {
  const { data: ads } = useAds("header");
  if (!ads?.length) return null;
  const ad = ads[0];

  return (
    <div className="w-full bg-muted/30 border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 py-1.5">
        <a href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full max-h-[120px] object-contain mx-auto rounded"
            loading="lazy"
          />
        </a>
        <p className="text-[9px] text-muted-foreground text-center mt-0.5">বিজ্ঞাপন</p>
      </div>
    </div>
  );
};

export default HeaderAd;
