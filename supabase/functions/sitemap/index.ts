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

    const url = new URL(req.url);
    const origin = url.searchParams.get("origin");
    const siteUrl = origin || "https://ittehad.bd";

    // Fetch all data in parallel
    const [postsRes, pagesRes, noticesRes, branchesRes, leadersRes, booksRes, categoriesRes, teachersRes, jobsRes, islamicRes] = await Promise.all([
      supabase.from("posts").select("slug, updated_at, created_at").eq("is_published", true).order("created_at", { ascending: false }),
      supabase.from("pages").select("slug, updated_at").order("created_at", { ascending: false }),
      supabase.from("notices").select("id, updated_at, created_at").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("branches").select("id, created_at").eq("is_active", true),
      supabase.from("leader_profiles").select("id, created_at"),
      supabase.from("books").select("slug, updated_at").eq("is_active", true),
      supabase.from("categories").select("slug, created_at"),
      supabase.from("teachers").select("id, created_at, updated_at").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("job_postings").select("id, created_at, updated_at, deadline").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("islamic_contents").select("id, category, updated_at, created_at").eq("is_active", true),
    ]);

    let urls = '';

    // Static pages
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/posts', priority: '0.9', changefreq: 'daily' },
      { loc: '/teachers', priority: '0.9', changefreq: 'daily' },
      { loc: '/students', priority: '0.7', changefreq: 'weekly' },
      { loc: '/result', priority: '0.8', changefreq: 'weekly' },
      { loc: '/branches', priority: '0.7', changefreq: 'monthly' },
      { loc: '/books', priority: '0.6', changefreq: 'weekly' },
      { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
      { loc: '/quran', priority: '0.6', changefreq: 'monthly' },
      { loc: '/hadith', priority: '0.6', changefreq: 'monthly' },
      { loc: '/dua', priority: '0.6', changefreq: 'monthly' },
      { loc: '/masala', priority: '0.6', changefreq: 'monthly' },
    ];

    for (const page of staticPages) {
      urls += `\n  <url>\n    <loc>${siteUrl}${page.loc}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`;
    }

    for (const post of postsRes.data || []) {
      urls += `\n  <url>\n    <loc>${siteUrl}/post/${post.slug}</loc>\n    <lastmod>${new Date(post.updated_at || post.created_at).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    }

    for (const page of pagesRes.data || []) {
      urls += `\n  <url>\n    <loc>${siteUrl}/page/${page.slug}</loc>\n    <lastmod>${new Date(page.updated_at).toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
    }

    for (const notice of noticesRes.data || []) {
      urls += `\n  <url>\n    <loc>${siteUrl}/notice/${notice.id}</loc>\n    <lastmod>${new Date(notice.updated_at || notice.created_at).toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>`;
    }

    for (const branch of branchesRes.data || []) {
      urls += `\n  <url>\n    <loc>${siteUrl}/branch/${branch.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>`;
    }

    for (const leader of leadersRes.data || []) {
      urls += `\n  <url>\n    <loc>${siteUrl}/leader/${leader.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.4</priority>\n  </url>`;
    }

    for (const book of booksRes.data || []) {
      urls += `\n  <url>\n    <loc>${siteUrl}/book/${book.slug}</loc>\n    <lastmod>${new Date(book.updated_at).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
    }

    // Teachers
    for (const t of teachersRes.data || []) {
      urls += `\n  <url>\n    <loc>${siteUrl}/teachers?highlight=${t.id}</loc>\n    <lastmod>${new Date(t.updated_at || t.created_at).toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    }

    // Job postings (only non-expired)
    const today = new Date().toISOString().split("T")[0];
    for (const j of jobsRes.data || []) {
      if (j.deadline && j.deadline < today) continue;
      urls += `\n  <url>\n    <loc>${siteUrl}/job-apply/${j.id}</loc>\n    <lastmod>${new Date(j.updated_at || j.created_at).toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    }

    // Islamic contents - individual pages for SEO
    for (const ic of islamicRes.data || []) {
      urls += `\n  <url>\n    <loc>${siteUrl}/${ic.category}/${ic.id}</loc>\n    <lastmod>${new Date(ic.updated_at || ic.created_at).toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}\n</urlset>`;

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
