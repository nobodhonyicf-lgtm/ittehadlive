import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GoldSilverRates {
  gold_22k: number;
  gold_21k: number;
  gold_18k: number;
  gold_traditional: number;
  silver_22k: number;
  silver_21k: number;
  silver_18k: number;
  silver_traditional: number;
}

async function scrapeBajus(): Promise<GoldSilverRates | null> {
  try {
    const res = await fetch("https://www.bajus.org/gold-price", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    const html = await res.text();

    // Extract prices from <span class="price">XX,XXX BDT/GRAM</span>
    const priceRegex = /<span class="price">\s*([\d,]+)\s*BDT\/GRAM\s*<\/span>/gi;
    const allPrices: number[] = [];
    let match;
    while ((match = priceRegex.exec(html)) !== null) {
      allPrices.push(parseInt(match[1].replace(/,/g, "")));
    }

    console.log("Found prices:", allPrices);

    // First 4 are gold, next 4 are silver
    if (allPrices.length >= 8) {
      return {
        gold_22k: allPrices[0],
        gold_21k: allPrices[1],
        gold_18k: allPrices[2],
        gold_traditional: allPrices[3],
        silver_22k: allPrices[4],
        silver_21k: allPrices[5],
        silver_18k: allPrices[6],
        silver_traditional: allPrices[7],
      };
    }

    if (allPrices.length >= 4) {
      return {
        gold_22k: allPrices[0],
        gold_21k: allPrices[1],
        gold_18k: allPrices[2],
        gold_traditional: allPrices[3],
        silver_22k: allPrices[4] || 0,
        silver_21k: allPrices[5] || 0,
        silver_18k: allPrices[6] || 0,
        silver_traditional: allPrices[7] || 0,
      };
    }

    console.error("Could not parse enough prices. Found:", allPrices.length);
    return null;
  } catch (e) {
    console.error("Error scraping BAJUS:", e);
    return null;
  }
}

async function scrapeNisab(): Promise<{ amount: number; date: string } | null> {
  // assunnahfoundation.org is a client-side rendered SPA.
  // We'll try to find their API endpoint or use a cached approach.
  try {
    // Try fetching the page - it may have embedded JSON data
    const res = await fetch("https://assunnahfoundation.org/zakat-calculator", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    const html = await res.text();

    // Look for embedded data in script tags (Next.js __NEXT_DATA__ or similar)
    const nextDataMatch = html.match(/__NEXT_DATA__\s*=\s*({[\s\S]*?})\s*<\/script>/);
    if (nextDataMatch) {
      try {
        const data = JSON.parse(nextDataMatch[1]);
        console.log("Found __NEXT_DATA__");
        // Try to find nisab value in the data
        const jsonStr = JSON.stringify(data);
        const nisabMatch = jsonStr.match(/nisab[^}]*?(\d{5,})/i);
        if (nisabMatch) {
          return { amount: parseInt(nisabMatch[1]), date: new Date().toLocaleDateString("en-GB") };
        }
      } catch (e) {
        console.log("Failed to parse __NEXT_DATA__:", e);
      }
    }

    // Try to find any embedded JSON with nisab
    const jsonMatches = html.matchAll(/"nisab[^"]*":\s*(\d+)/gi);
    for (const m of jsonMatches) {
      const val = parseInt(m[1]);
      if (val > 100000) return { amount: val, date: new Date().toLocaleDateString("en-GB") };
    }

    // Try to find the amount in any script content
    const scriptMatches = html.matchAll(/228375|nisab/gi);
    for (const m of scriptMatches) {
      console.log("Found nisab reference in HTML");
    }

    console.log("Could not extract nisab from SPA - page is client-rendered");
    return null;
  } catch (e) {
    console.error("Error scraping nisab:", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const results: Record<string, any> = {};

    // 1. Scrape Nisab (may fail due to SPA)
    const nisab = await scrapeNisab();
    if (nisab) {
      await supabase.from("site_settings").upsert(
        { key: "zakat_nisab_amount", value: String(nisab.amount) },
        { onConflict: "key" }
      );
      await supabase.from("site_settings").upsert(
        { key: "zakat_nisab_date", value: nisab.date },
        { onConflict: "key" }
      );
      results.nisab = nisab;
    } else {
      results.nisab = "SPA - manual update needed or use existing value";
    }

    // 2. Scrape BAJUS gold/silver prices
    const rates = await scrapeBajus();
    if (rates) {
      const rateSettings = [
        { key: "bajus_gold_22k", value: String(rates.gold_22k) },
        { key: "bajus_gold_21k", value: String(rates.gold_21k) },
        { key: "bajus_gold_18k", value: String(rates.gold_18k) },
        { key: "bajus_gold_traditional", value: String(rates.gold_traditional) },
        { key: "bajus_silver_22k", value: String(rates.silver_22k) },
        { key: "bajus_silver_21k", value: String(rates.silver_21k) },
        { key: "bajus_silver_18k", value: String(rates.silver_18k) },
        { key: "bajus_silver_traditional", value: String(rates.silver_traditional) },
        { key: "bajus_last_updated", value: new Date().toISOString() },
      ];

      for (const s of rateSettings) {
        await supabase.from("site_settings").upsert(s, { onConflict: "key" });
      }
      results.bajus = rates;
    } else {
      results.bajus = "Failed to scrape BAJUS";
    }

    // 3. Calculate nisab from silver price if BAJUS data available
    // Nisab = 612.36g silver × traditional silver rate per gram
    if (rates && rates.silver_traditional > 0) {
      const calculatedNisab = Math.round(612.36 * rates.silver_traditional);
      await supabase.from("site_settings").upsert(
        { key: "zakat_nisab_amount", value: String(calculatedNisab) },
        { onConflict: "key" }
      );
      await supabase.from("site_settings").upsert(
        { key: "zakat_nisab_date", value: new Date().toLocaleDateString("en-GB") },
        { onConflict: "key" }
      );
      results.calculated_nisab = calculatedNisab;
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
