import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use origin from request or fallback to published URL
    const url = new URL(req.url);
    const origin = url.searchParams.get("origin");
    const siteUrl = origin || "https://ittehadlive.lovable.app";

    // Fetch all published posts
    const { data: posts } = await supabase
      .from("posts")
      .select("slug, updated_at, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    // Fetch all pages
    const { data: pages } = await supabase
      .from("pages")
      .select("slug, updated_at")
      .order("created_at", { ascending: false });

    // Fetch all active notices
    const { data: notices } = await supabase
      .from("notices")
      .select("id, updated_at, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Fetch active branches
    const { data: branches } = await supabase
      .from("branches")
      .select("id, created_at")
      .eq("is_active", true);

    // Fetch leader profiles
    const { data: leaders } = await supabase
      .from("leader_profiles")
      .select("id, created_at");

    // Fetch active books
    const { data: books } = await supabase
      .from("books")
      .select("slug, updated_at")
      .eq("is_active", true);

    // Fetch categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, created_at");

    let urls = '';

    // Static pages
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/posts', priority: '0.9', changefreq: 'daily' },
      { loc: '/students', priority: '0.7', changefreq: 'weekly' },
      { loc: '/result', priority: '0.8', changefreq: 'weekly' },
      { loc: '/branches', priority: '0.7', changefreq: 'monthly' },
      { loc: '/books', priority: '0.6', changefreq: 'weekly' },
      { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
    ];

    for (const page of staticPages) {
      urls += `
  <url>
    <loc>${siteUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    // Posts
    for (const post of posts || []) {
      urls += `
  <url>
    <loc>${siteUrl}/post/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at || post.created_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    // Pages
    for (const page of pages || []) {
      urls += `
  <url>
    <loc>${siteUrl}/page/${page.slug}</loc>
    <lastmod>${new Date(page.updated_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

    // Notices
    for (const notice of notices || []) {
      urls += `
  <url>
    <loc>${siteUrl}/notice/${notice.id}</loc>
    <lastmod>${new Date(notice.updated_at || notice.created_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
    }

    // Branches
    for (const branch of branches || []) {
      urls += `
  <url>
    <loc>${siteUrl}/branch/${branch.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
    }

    // Leaders
    for (const leader of leaders || []) {
      urls += `
  <url>
    <loc>${siteUrl}/leader/${leader.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>`;
    }

    // Books
    for (const book of books || []) {
      urls += `
  <url>
    <loc>${siteUrl}/book/${book.slug}</loc>
    <lastmod>${new Date(book.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Sitemap error:", err);
    return new Response("Error generating sitemap", { status: 500 });
  }
});
