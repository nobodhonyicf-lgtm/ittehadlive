import { useAds } from "@/hooks/useData";

const InPostAd = () => {
  const { data: ads } = useAds("in_post");

  if (!ads?.length) return null;
  const ad = ads[Math.floor(Math.random() * ads.length)];

  return (
    <div className="my-6 text-center">
      <a href={ad.link || "#"} target="_blank" rel="noopener noreferrer">
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full max-w-[728px] mx-auto rounded"
          loading="lazy"
        />
      </a>
      <p className="text-[10px] text-muted-foreground mt-1">বিজ্ঞাপন</p>
    </div>
  );
};

export default InPostAd;
