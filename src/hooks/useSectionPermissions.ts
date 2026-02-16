import { useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

/**
 * Auto-detects the current admin section from the URL and returns permission flags.
 * Usage: const { canEdit, canDelete } = useSectionPermissions();
 */
export const useSectionPermissions = () => {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  // Extract section from /admin/posts → posts, /admin/book-orders → book-orders
  const pathParts = location.pathname.replace(/^\/admin\/?/, "").split("/");
  const section = pathParts[0] || "";

  return {
    canView: hasPermission(section, "view"),
    canEdit: hasPermission(section, "edit"),
    canDelete: hasPermission(section, "delete"),
  };
};
