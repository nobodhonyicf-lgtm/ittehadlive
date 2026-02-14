import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const getVisitorId = () => {
  let id = localStorage.getItem("visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_id", id);
  }
  return id;
};

const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackView = async () => {
      try {
        await supabase.from("page_views").insert({
          page_path: location.pathname,
          visitor_id: getVisitorId(),
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        });
      } catch {
        // silently fail
      }
    };
    trackView();
  }, [location.pathname]);

  return null;
};

export default PageViewTracker;
