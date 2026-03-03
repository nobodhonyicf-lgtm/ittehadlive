import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: "No URLs provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const siteUrl = "https://ittehad.bd";
    const key = "ittehad-indexnow-key-2024";

    // Submit to IndexNow (Bing, Yandex, etc.)
    const indexNowPayload = {
      host: "ittehad.bd",
      key,
      keyLocation: `${siteUrl}/${key}.txt`,
      urlList: urls.map((u: string) => u.startsWith("http") ? u : `${siteUrl}${u}`),
    };

    const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(indexNowPayload),
    });

    // Ping Google sitemap
    const googlePing = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`https://laasotunayiivssffhnu.supabase.co/functions/v1/sitemap?origin=${siteUrl}`)}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        indexNowStatus: indexNowRes.status,
        googlePingStatus: googlePing.status,
        urlCount: urls.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("IndexNow error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
