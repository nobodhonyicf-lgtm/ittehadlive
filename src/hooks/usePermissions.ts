import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SectionPermission {
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export const usePermissions = () => {
  const { user } = useAuth();

  const { data: userRole } = useQuery({
    queryKey: ["user_role", user?.id],
    queryFn: async () => {
      if (!user?.id) return "user";
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.role || "user";
    },
    enabled: !!user?.id,
  });

  const { data: permissions } = useQuery({
    queryKey: ["admin_permissions", userRole],
    queryFn: async () => {
      if (!userRole) return {};
      const { data } = await supabase
        .from("admin_permissions")
        .select("section_key, can_view, can_edit, can_delete")
        .eq("role_name", userRole);
      
      const map: Record<string, SectionPermission> = {};
      data?.forEach((p: any) => {
        map[p.section_key] = {
          can_view: p.can_view,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
        };
      });
      return map;
    },
    enabled: !!userRole,
  });

  const hasPermission = (section: string, action: "view" | "edit" | "delete" = "view"): boolean => {
    if (!permissions) return true; // Default allow while loading
    const perm = permissions[section];
    if (!perm) return true; // No restriction = allowed
    if (action === "view") return perm.can_view;
    if (action === "edit") return perm.can_edit;
    return perm.can_delete;
  };

  return { permissions, userRole, hasPermission };
};
