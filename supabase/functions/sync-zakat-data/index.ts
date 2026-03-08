import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function scrapeNisab(): Promise<{ amount: number; date: string } | null> {
  try {
    const res = await fetch("https://assunnahfoundation.org/zakat-calculator");
    const html = await res.text();

    // Extract nisab amount — looking for pattern like ৳ ২,২৮,৩৭৫
    const nisabMatch = html.match(/যাকাতের নিসাব[\s\S]*?৳\s*([\d,]+)/);
    if (!nisabMatch) {
      // Try Bengali digits
      const bnMatch = html.match(/যাকাতের নিসাব[\s\S]*?৳\s*([০-৯,\.]+)/);
      if (bnMatch) {
        const bnStr = bnMatch[1].replace(/,/g, "");
        const enStr = bnStr.replace(/[০-৯]/g, (d: string) => {
          const bn = "০১২৩৪৫৬৭৮৯";
          return String(bn.indexOf(d));
        });
        const amount = parseInt(enStr);
        // Extract date
        const dateMatch = html.match(/সর্বশেষ হালনাগাদ\s*([\d\/\-\s\w]+)/);
        const date = dateMatch ? dateMatch[1].trim() : "";
        if (amount > 0) return { amount, date };
      }
      return null;
    }

    const amount = parseInt(nisabMatch[1].replace(/,/g, ""));
    const dateMatch = html.match(/সর্বশেষ হালনাগাদ\s*([\d\/\-\s\w]+)/);
    const date = dateMatch ? dateMatch[1].trim() : "";
    if (amount > 0) return { amount, date };
    return null;
  } catch (e) {
    console.error("Error scraping nisab:", e);
    return null;
  }
}

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
    const res = await fetch("https://www.bajus.org/gold-price");
    const html = await res.text();

    // Extract prices from the page - looking for BDT/GRAM patterns
    const extractPrice = (pattern: RegExp): number => {
      const match = html.match(pattern);
      if (match) return parseInt(match[1].replace(/,/g, ""));
      return 0;
    };

    // Gold prices - parse from table structure
    // Pattern: "22 KARAT Gold" ... "XX,XXX BDT/GRAM"  or Bengali text
    const goldPrices: number[] = [];
    const silverPrices: number[] = [];

    // Match all BDT/GRAM prices
    const priceRegex = /([\d,]+)\s*BDT\/GRAM/gi;
    const matches = [...html.matchAll(priceRegex)];

    // BAJUS page has gold prices first (4), then silver prices (4)
    for (let i = 0; i < matches.length; i++) {
      const price = parseInt(matches[i][1].replace(/,/g, ""));
      if (i < 4) goldPrices.push(price);
      else silverPrices.push(price);
    }

    if (goldPrices.length >= 4 && silverPrices.length >= 4) {
      return {
        gold_22k: goldPrices[0],
        gold_21k: goldPrices[1],
        gold_18k: goldPrices[2],
        gold_traditional: goldPrices[3],
        silver_22k: silverPrices[0],
        silver_21k: silverPrices[1],
        silver_18k: silverPrices[2],
        silver_traditional: silverPrices[3],
      };
    }

    // Fallback: try to find at least gold prices
    if (goldPrices.length >= 4) {
      return {
        gold_22k: goldPrices[0],
        gold_21k: goldPrices[1],
        gold_18k: goldPrices[2],
        gold_traditional: goldPrices[3],
        silver_22k: silverPrices[0] || 0,
        silver_21k: silverPrices[1] || 0,
        silver_18k: silverPrices[2] || 0,
        silver_traditional: silverPrices[3] || 0,
      };
    }

    console.error("Could not parse enough prices from BAJUS");
    return null;
  } catch (e) {
    console.error("Error scraping BAJUS:", e);
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

    // 1. Scrape Nisab
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
      results.nisab = "No change or failed to scrape";
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
      results.bajus = "No change or failed to scrape";
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
