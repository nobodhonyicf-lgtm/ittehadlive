import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useData";

const DynamicManifest = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    const iconUrl = settings.app_icon_url || settings.favicon_url;
    if (!iconUrl) return;

    const manifest = {
      name: settings.app_name || settings.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ",
      short_name: settings.app_name || "ইত্তেহাদ",
      description: settings.site_description || "প্রাইভেট মাদরাসাগুলোর একটি সমন্বিত সংগঠন",
      theme_color: "#1e3a5f",
      background_color: "#f5f5f5",
      display: "standalone",
      orientation: "portrait",
      start_url: "/",
      scope: "/",
      icons: [
        { src: iconUrl, sizes: "72x72", type: "image/png", purpose: "any" },
        { src: iconUrl, sizes: "96x96", type: "image/png", purpose: "any" },
        { src: iconUrl, sizes: "128x128", type: "image/png", purpose: "any" },
        { src: iconUrl, sizes: "144x144", type: "image/png", purpose: "any" },
        { src: iconUrl, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: iconUrl, sizes: "512x512", type: "image/png", purpose: "any" },
      ],
    };

    const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Remove existing manifest links and add dynamic one
    const existing = document.querySelector('link[rel="manifest"]');
    if (existing) existing.remove();

    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = url;
    document.head.appendChild(link);

    return () => {
      URL.revokeObjectURL(url);
      link.remove();
    };
  }, [settings]);

  return null;
};

export default DynamicManifest;
