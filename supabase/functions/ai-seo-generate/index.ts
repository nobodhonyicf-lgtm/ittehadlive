import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pageName, pagePath, postTitle, postContent, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let prompt = "";

    if (mode === "post") {
      // AI post generation
      prompt = `You are a professional Bengali content writer for an Islamic educational institution website called "ইত্তেহাদুল মাদারিস বাংলাদেশ" (Ittehadul Madaris Bangladesh).

Generate a complete blog post in Bengali based on this topic: "${postTitle}"
${postContent ? `Additional context: ${postContent}` : ""}

Return a JSON object with these fields:
- title: Catchy Bengali title
- content: Full article in Bengali (at least 500 words, well-structured with paragraphs)
- summary: 2-3 sentence summary in Bengali
- meta_title: SEO title under 60 characters
- meta_description: SEO description under 160 characters
- slug: URL-friendly slug using Bengali characters and hyphens

Write engaging, informative content suitable for an Islamic education website. Use proper Bengali language.`;
    } else {
      // SEO generation
      prompt = `You are an SEO expert for a Bengali Islamic educational institution website called "ইত্তেহাদুল মাদারিস বাংলাদেশ" (Ittehadul Madaris Bangladesh). The website URL is ittehad.bd.

Generate SEO metadata for the page: "${pageName}" (path: ${pagePath})

Return a JSON object with:
- meta_title: SEO title in Bengali, under 60 chars, include relevant keywords
- meta_description: SEO description in Bengali, under 160 chars, compelling
- og_title: Social media share title in Bengali
- og_description: Social media description in Bengali, engaging
- keywords: Comma-separated relevant keywords in Bengali and English

Focus on Islamic education, madrasas in Bangladesh, and the specific page content. Make it compelling for both search engines and social media.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a helpful assistant. Always respond with valid JSON only, no markdown, no code blocks." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let parsed;
    try {
      // Try to extract JSON from possible markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      parsed = JSON.parse(content.trim());
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI SEO error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
