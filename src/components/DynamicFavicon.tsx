import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useData";
import { useIsApp } from "@/hooks/useIsApp";

const DynamicFavicon = () => {
  const { data: settings } = useSiteSettings();
  const isApp = useIsApp();

  if (!settings) return null;

  // In app mode, prefer app_icon_url, then favicon_url
  // In web mode, prefer favicon_url
  const iconUrl = isApp
    ? settings.app_icon_url || settings.favicon_url
    : settings.favicon_url;

  const appleTouchIcon = settings.app_icon_url || iconUrl;

  // Always set favicon even if from settings to override any default Lovable favicon
  return (
    <Helmet>
      {iconUrl && (
        <>
          <link rel="icon" type="image/png" href={iconUrl} />
          <link rel="icon" type="image/png" sizes="32x32" href={iconUrl} />
          <link rel="icon" type="image/png" sizes="16x16" href={iconUrl} />
          <link rel="shortcut icon" href={iconUrl} />
        </>
      )}
      {appleTouchIcon && <link rel="apple-touch-icon" href={appleTouchIcon} />}
    </Helmet>
  );
};

export default DynamicFavicon;
