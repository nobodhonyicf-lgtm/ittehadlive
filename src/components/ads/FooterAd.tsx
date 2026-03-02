import { useAds } from "@/hooks/useData";

const FooterAd = () => {
  const { data: ads } = useAds("footer");
  if (!ads?.length) return null;
  const ad = ads[0];

  return (
    <div className="w-full bg-muted/30 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-4 py-2">
        <a href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full max-h-[100px] object-contain mx-auto rounded"
            loading="lazy"
          />
        </a>
        <p className="text-[9px] text-muted-foreground text-center mt-0.5">বিজ্ঞাপন</p>
      </div>
    </div>
  );
};

export default FooterAd;
