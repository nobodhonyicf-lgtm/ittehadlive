import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const crawlerPatterns = [
    'facebookexternalhit', 'Facebot', 'Twitterbot', 'LinkedInBot', 'WhatsApp',
    'Slackbot', 'TelegramBot', 'Discordbot', 'Googlebot', 'bingbot',
    'Pinterestbot', 'vkShare', 'Viber', 'Line',
  ];
  return crawlerPatterns.some(p => userAgent.toLowerCase().includes(p.toLowerCase()));
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function buildHtml(title: string, description: string, image: string, url: string, extras = "") {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} | ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ">
  <meta property="og:locale" content="bn_BD">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  ${extras}
</head>
<body>
  <p>Redirecting to <a href="${url}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "post";
  const slug = url.searchParams.get("slug");
  const id = url.searchParams.get("id");

  const siteUrl = "https://ittehad.bd";
  const defaultImage = "https://storage.googleapis.com/gpt-engineer-file-uploads/Jlhgp5SVlNRsWE1kL5rCoZMrbN23/uploads/1770800561345-ittehad_logo-01.png";
  const userAgent = req.headers.get("user-agent");

  // Determine page URL
  let pageUrl = siteUrl;
  if (type === "post" && slug) pageUrl = `${siteUrl}/post/${slug}`;
  else if (type === "teacher" && id) pageUrl = `${siteUrl}/teachers?highlight=${id}`;
  else if (type === "job" && id) pageUrl = `${siteUrl}/job-apply/${id}`;
  else if (type === "page" && slug) pageUrl = `${siteUrl}/page/${slug}`;
  else if (type === "notice" && id) pageUrl = `${siteUrl}/notice/${id}`;
  else if (type === "book" && slug) pageUrl = `${siteUrl}/book/${slug}`;
  else if (type === "branch" && id) pageUrl = `${siteUrl}/branch/${id}`;
  else if (type === "islamic" && id) {
    const cat = url.searchParams.get("category") || "hadith";
    pageUrl = `${siteUrl}/${cat}?highlight=${id}`;
  }

  if (!isCrawler(userAgent)) {
    return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": pageUrl } });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let title = "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ";
    let description = "";
    let image = defaultImage;
    let extras = "";

    if (type === "post" && slug) {
      const { data: post } = await supabase
        .from("posts")
        .select("title, content, image_url, og_image_url, meta_description, summary, author_name, created_at")
        .eq("slug", slug).eq("is_published", true).maybeSingle();
      if (post) {
        title = post.title;
        description = post.meta_description || post.summary || post.content?.substring(0, 160) || "";
        image = post.og_image_url || post.image_url || defaultImage;
        if (post.created_at) extras += `<meta property="article:published_time" content="${post.created_at}">`;
        if (post.author_name) extras += `<meta property="article:author" content="${escapeHtml(post.author_name)}">`;
      }
    } else if (type === "teacher" && id) {
      const { data: t } = await supabase
        .from("teachers")
        .select("name, subject, district, photo_url, bio, experience_years, qualification")
        .eq("id", id).eq("is_active", true).maybeSingle();
      if (t) {
        title = `${t.name} - ${t.subject} শিক্ষক`;
        const parts = [];
        if (t.qualification) parts.push(t.qualification);
        if (t.district) parts.push(t.district);
        if (t.experience_years) parts.push(`${t.experience_years} বছরের অভিজ্ঞতা`);
        description = t.bio || parts.join(" | ") || `${t.name} - ${t.subject} বিষয়ের শিক্ষক`;
        image = t.photo_url || defaultImage;
      }
    } else if (type === "job" && id) {
      const { data: j } = await supabase
        .from("job_postings")
        .select("title, description, subject, location, salary_range, deadline, branch_id")
        .eq("id", id).eq("is_active", true).maybeSingle();
      if (j) {
        title = `নিয়োগ: ${j.title}`;
        const parts = [];
        if (j.subject) parts.push(`বিষয়: ${j.subject}`);
        if (j.location) parts.push(`স্থান: ${j.location}`);
        if (j.salary_range) parts.push(`বেতন: ${j.salary_range}`);
        if (j.deadline) parts.push(`শেষ তারিখ: ${j.deadline}`);
        description = j.description?.substring(0, 160) || parts.join(" | ");
        // Try to get branch image
        if (j.branch_id) {
          const { data: br } = await supabase.from("branches").select("name, image_url").eq("id", j.branch_id).maybeSingle();
          if (br?.image_url) image = br.image_url;
          if (br?.name) description = `${br.name} | ${description}`;
        }
      }
    } else if (type === "page" && slug) {
      const { data: p } = await supabase
        .from("pages")
        .select("title, content, cover_image_url")
        .eq("slug", slug).maybeSingle();
      if (p) {
        title = p.title;
        description = p.content?.replace(/<[^>]*>/g, "").substring(0, 160) || "";
        image = p.cover_image_url || defaultImage;
      }
    } else if (type === "notice" && id) {
      const { data: n } = await supabase
        .from("notices")
        .select("title, content, created_at")
        .eq("id", id).eq("is_active", true).maybeSingle();
      if (n) {
        title = `বিজ্ঞপ্তি: ${n.title}`;
        description = n.content?.replace(/<[^>]*>/g, "").substring(0, 160) || "";
      }
    } else if (type === "book" && slug) {
      const { data: b } = await supabase
        .from("books")
        .select("title, author_name, description, cover_image_url, price, discount_price")
        .eq("slug", slug).eq("is_active", true).maybeSingle();
      if (b) {
        title = `${b.title} - ${b.author_name}`;
        description = b.description?.substring(0, 160) || `${b.title} by ${b.author_name}`;
        image = b.cover_image_url || defaultImage;
      }
    } else if (type === "branch" && id) {
      const { data: br } = await supabase
        .from("branches")
        .select("name, address, description, image_url, head_name")
        .eq("id", id).eq("is_active", true).maybeSingle();
      if (br) {
        title = br.name;
        description = br.description?.substring(0, 160) || br.address || "";
        image = br.image_url || defaultImage;
      }
    } else if (type === "islamic" && id) {
      const { data: ic } = await supabase
        .from("islamic_contents")
        .select("title, content, category, meaning, source, reference, question")
        .eq("id", id).eq("is_active", true).maybeSingle();
      if (ic) {
        const catLabels: Record<string, string> = { hadith: "হাদিস", dua: "দোয়া", masala: "মাসআলা", quran: "কুরআন" };
        const catLabel = catLabels[ic.category] || ic.category;
        title = `${catLabel}: ${ic.title}`;
        description = ic.meaning || ic.question || ic.content?.substring(0, 160) || "";
        if (ic.source || ic.reference) {
          description += ` — সূত্র: ${ic.reference || ic.source}`;
        }
        description = description.substring(0, 200);
      }
    }

    const html = buildHtml(title, description, image, pageUrl, extras);
    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return new Response(null, { status: 302, headers: { ...corsHeaders, "Location": pageUrl } });
  }
});
