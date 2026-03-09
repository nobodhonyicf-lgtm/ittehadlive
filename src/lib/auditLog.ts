import { supabase } from "@/integrations/supabase/client";

/**
 * Audit log utility for tracking administrative actions.
 * Currently logs to user_activities table with activity_type = "admin_action".
 * Can be extended to a dedicated audit_logs table in the future.
 */
export const logAdminAction = async (
  action: string,
  details: Record<string, any> = {},
  userEmail?: string | null
) => {
  try {
    await supabase.from("user_activities").insert([
      {
        user_email: userEmail || null,
        activity_type: "admin_action",
        activity_data: { action, ...details, timestamp: new Date().toISOString() },
        page_path: typeof window !== "undefined" ? window.location.pathname : null,
      },
    ]);
  } catch {
    // Silent fail — audit logging should never break the main flow
  }
};

/**
 * Common admin action types for consistency.
 */
export const AdminActions = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  APPROVE: "approve",
  REJECT: "reject",
  PUBLISH: "publish",
  UNPUBLISH: "unpublish",
  SEND_NOTIFICATION: "send_notification",
  SEND_EMAIL: "send_email",
  SEND_SMS: "send_sms",
  CHANGE_STATUS: "change_status",
  UPLOAD: "upload",
} as const;
