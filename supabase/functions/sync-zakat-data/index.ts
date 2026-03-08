import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
function bnToEn(str: string): string {
  return str.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

function parseBnPrice(str: string): number {
  const cleaned = bnToEn(str.replace(/[৳,\s]/g, ""));
  return parseInt(cleaned) || 0;
}

interface Rates {
  gold_22k: number;
  gold_21k: number;
  gold_18k: number;
  gold_traditional: number;
  silver_22k: number;
  silver_21k: number;
  silver_18k: number;
  silver_traditional: number;
}

async function scrapeGoldr(): Promise<Rates | null> {
  try {
    const res = await fetch("https://www.goldr.org/", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    const html = await res.text();
    console.log("V3 - GoldR HTML length:", html.length, "first 300:", html.substring(0, 300));

    // Extract per-gram gold prices from table-gram section
    const gramSection = html.match(/id="table-gram"[\s\S]*?<\/div>/);
    if (!gramSection) {
      console.error("Could not find gram table section. Has table-gram:", html.includes("table-gram"));
      return null;
    }
    const section = gramSection[0];

    // Extract gold prices (first table in gram section)
    const goldPattern = /(\d+)\s*Karat\s*Gold<\/td>\s*<td[^>]*><strong>৳([০-৯,]+)<\/strong>/g;
    const tradGoldPattern = /Traditional<\/td>\s*<td[^>]*><strong>৳([০-৯,]+)<\/strong>/;

    const goldPrices: Record<string, number> = {};
    let m;
    while ((m = goldPattern.exec(section)) !== null) {
      goldPrices[m[1]] = parseBnPrice(m[2]);
    }
    const tradGold = section.match(tradGoldPattern);

    // Extract silver prices (second table in gram section)
    const silverSection = section.substring(section.indexOf("Silver Type"));
    const silverPattern = /(\d+)\s*Karat\s*Silver<\/td>\s*<td[^>]*><strong>৳([০-৯,]+)<\/strong>/g;
    const tradSilverPattern = /Traditional<\/td>\s*<td[^>]*><strong>৳([০-৯,]+)<\/strong>/;

    const silverPrices: Record<string, number> = {};
    while ((m = silverPattern.exec(silverSection)) !== null) {
      silverPrices[m[1]] = parseBnPrice(m[2]);
    }
    const tradSilver = silverSection.match(tradSilverPattern);

    const rates: Rates = {
      gold_22k: goldPrices["22"] || 0,
      gold_21k: goldPrices["21"] || 0,
      gold_18k: goldPrices["18"] || 0,
      gold_traditional: tradGold ? parseBnPrice(tradGold[1]) : 0,
      silver_22k: silverPrices["22"] || 0,
      silver_21k: silverPrices["21"] || 0,
      silver_18k: silverPrices["18"] || 0,
      silver_traditional: tradSilver ? parseBnPrice(tradSilver[1]) : 0,
    };

    console.log("Parsed rates:", rates);

    if (rates.gold_22k > 0) return rates;
    return null;
  } catch (e) {
    console.error("Error scraping GoldR:", e);
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

    // Scrape gold/silver prices from GoldR.org (BAJUS data source)
    const rates = await scrapeGoldr();
    if (rates) {
      const settings = [
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

      for (const s of settings) {
        await supabase.from("site_settings").upsert(s, { onConflict: "key" });
      }
      results.rates = rates;

      // Calculate nisab from silver traditional price
      // Islamic nisab = 612.36g silver × market price per gram
      if (rates.silver_traditional > 0) {
        const nisab = Math.round(612.36 * rates.silver_traditional);
        await supabase.from("site_settings").upsert(
          { key: "zakat_nisab_amount", value: String(nisab) },
          { onConflict: "key" }
        );
        await supabase.from("site_settings").upsert(
          { key: "zakat_nisab_date", value: new Date().toLocaleDateString("en-GB") },
          { onConflict: "key" }
        );
        results.nisab = nisab;
      }
    } else {
      results.rates = "Failed to scrape";
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
