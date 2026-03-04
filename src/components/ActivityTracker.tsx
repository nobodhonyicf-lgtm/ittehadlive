import { useActivityTracker } from "@/hooks/useActivityTracker";

const ActivityTrackerInner = () => {
  useActivityTracker();
  return null;
};

// Wrapper to avoid hook usage outside Router
export const ActivityTrackerWrapper = () => <ActivityTrackerInner />;
