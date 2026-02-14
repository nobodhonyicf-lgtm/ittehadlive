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
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get("url");
    
    if (!imageUrl) {
      return new Response("Missing url param", { status: 400, headers: corsHeaders });
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return new Response("Failed to fetch", { status: 502, headers: corsHeaders });
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const body = await response.arrayBuffer();

    return new Response(body, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response(error.message, { status: 500, headers: corsHeaders });
  }
});
