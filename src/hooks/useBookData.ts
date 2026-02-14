import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBooks = (category?: string) =>
  useQuery({
    queryKey: ["books", category],
    queryFn: async () => {
      let query = supabase
        .from("books")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

export const useFeaturedBooks = () =>
  useQuery({
    queryKey: ["featured_books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("sort_order")
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

export const useBook = (slug: string) =>
  useQuery({
    queryKey: ["book", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

export const useBookReviews = (bookId: string | undefined) =>
  useQuery({
    queryKey: ["book_reviews", bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_reviews")
        .select("*")
        .eq("book_id", bookId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!bookId,
  });
