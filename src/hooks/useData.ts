import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNotices = () =>
  useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const usePosts = (limit?: number) =>
  useQuery({
    queryKey: ["posts", limit],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("*, categories(name, slug)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const usePost = (slug: string) =>
  useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

export const usePage = (slug: string) =>
  useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

export const useMenuItems = () =>
  useQuery({
    queryKey: ["menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useVideos = () =>
  useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useLeaderProfiles = () =>
  useQuery({
    queryKey: ["leader_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leader_profiles")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const useAds = (position?: string) =>
  useQuery({
    queryKey: ["ads", position],
    queryFn: async () => {
      let query = supabase
        .from("ads")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (position) query = query.eq("position", position);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useSiteSettings = () =>
  useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const settings: Record<string, string> = {};
      data?.forEach((s) => {
        settings[s.key] = s.value || "";
      });
      return settings;
    },
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
