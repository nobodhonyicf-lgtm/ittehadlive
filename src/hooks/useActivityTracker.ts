import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const getDeviceId = (): string => {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = "dev_" + crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
};

export const useActivityTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const lastTracked = useRef("");

  const trackActivity = useCallback(async (activityType: string, activityData: Record<string, any> = {}) => {
    try {
      const email = user?.email || null;
      const deviceId = getDeviceId();
      
      await supabase.from("user_activities").insert([{
        user_email: email,
        device_id: email ? null : deviceId,
        activity_type: activityType,
        activity_data: activityData,
        page_path: location.pathname,
      }]);
    } catch {
      // silent fail
    }
  }, [user?.email, location.pathname]);

  // Track page views
  useEffect(() => {
    const key = location.pathname + location.search;
    if (key === lastTracked.current) return;
    lastTracked.current = key;
    trackActivity("page_view", { path: location.pathname });
  }, [location.pathname, location.search, trackActivity]);

  // Merge device activities to email on login
  useEffect(() => {
    if (!user?.email) return;
    const deviceId = localStorage.getItem("device_id");
    if (!deviceId) return;

    // Update all device-tracked activities to this email
    supabase
      .from("user_activities")
      .update({ user_email: user.email, device_id: null })
      .eq("device_id", deviceId)
      .is("user_email", null)
      .then(() => {});
  }, [user?.email]);

  return { trackActivity };
};
