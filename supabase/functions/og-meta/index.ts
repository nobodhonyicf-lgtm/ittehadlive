import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Detect social media crawlers by user agent
function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const crawlerPatterns = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'LinkedInBot',
    'WhatsApp',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'Googlebot',
    'bingbot',
    'Pinterestbot',
    'vkShare',
    'Viber',
    'Line',
  ];
  return crawlerPatterns.some(p => userAgent.toLowerCase().includes(p.toLowerCase()));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response("Missing slug", { status: 400, headers: corsHeaders });
  }

  const siteUrl = "https://ittehad.bd";
  const postUrl = `${siteUrl}/post/${slug}`;
  const userAgent = req.headers.get("user-agent");

  // If not a crawler, redirect immediately with 302
  if (!isCrawler(userAgent)) {
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": postUrl,
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: post } = await supabase
      .from("posts")
      .select("title, content, image_url, og_image_url, meta_description, summary, author_name, created_at")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (!post) {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, "Location": postUrl },
      });
    }

    const title = post.title || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ";
    const description = post.meta_description || post.summary || post.content?.substring(0, 160) || "";
    const image = post.og_image_url || post.image_url || "https://storage.googleapis.com/gpt-engineer-file-uploads/Jlhgp5SVlNRsWE1kL5rCoZMrbN23/uploads/1770800561345-ittehad_logo-01.png";

    const html = `<!DOCTYPE html>
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
  <meta property="og:url" content="${postUrl}">
  <meta property="og:site_name" content="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ">
  <meta property="og:locale" content="bn_BD">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  ${post.created_at ? `<meta property="article:published_time" content="${post.created_at}">` : ""}
  ${post.author_name ? `<meta property="article:author" content="${escapeHtml(post.author_name)}">` : ""}
</head>
<body>
  <p>Redirecting to <a href="${postUrl}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, "Location": postUrl },
    });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
