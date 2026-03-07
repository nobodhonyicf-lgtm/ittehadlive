import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useData";
import { useIsApp } from "@/hooks/useIsApp";

const DEFAULT_FAVICON = "/favicon.png";

const DynamicFavicon = () => {
  const { data: settings } = useSiteSettings();
  const isApp = useIsApp();

  // In app mode, prefer app_icon_url, then favicon_url
  // In web mode, prefer favicon_url
  const iconUrl = isApp
    ? settings?.app_icon_url || settings?.favicon_url || DEFAULT_FAVICON
    : settings?.favicon_url || DEFAULT_FAVICON;

  const appleTouchIcon = settings?.app_icon_url || iconUrl;

  return (
    <Helmet>
      <link rel="icon" type="image/png" href={iconUrl} />
      <link rel="icon" type="image/png" sizes="48x48" href={iconUrl} />
      <link rel="icon" type="image/png" sizes="32x32" href={iconUrl} />
      <link rel="icon" type="image/png" sizes="16x16" href={iconUrl} />
      <link rel="icon" type="image/x-icon" href={iconUrl} />
      <link rel="shortcut icon" href={iconUrl} />
      <link rel="apple-touch-icon" href={appleTouchIcon} />
    </Helmet>
  );
};

export default DynamicFavicon;
