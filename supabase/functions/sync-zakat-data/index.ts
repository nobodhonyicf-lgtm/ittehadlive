import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface UnitRates {
  gram: string | number;
  bhori: number;
  ana: number;
}

interface GoldItem {
  title: string;
  key: string;
  unit_rate: UnitRates;
  unit_sell: UnitRates;
}

async function fetchGoldPrices(): Promise<GoldItem[] | null> {
  try {
    const res = await fetch("https://www.goldr.org/price.ultra.js");
    const js = await res.text();
    const match = js.match(/const\s+p\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) {
      console.error("Could not find price data in JS");
      return null;
    }
    const data: GoldItem[] = JSON.parse(match[1]);
    console.log("Parsed", data.length, "gold items");
    return data;
  } catch (e) {
    console.error("Error fetching gold prices:", e);
    return null;
  }
}

/** Scrape nisab amount directly from As-Sunnah Foundation's zakat calculator page */
async function fetchNisabFromAsSunnah(): Promise<{ amount: number; date: string } | null> {
  try {
    const res = await fetch("https://assunnahfoundation.org/zakat-calculator", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IttehadBot/1.0)" },
    });
    const html = await res.text();

    // Bengali digits map
    const bnDigits = "০১২৩৪৫৬৭৮৯";
    const bnToNum = (s: string) => {
      const cleaned = s.replace(/[৳,\s।]/g, "");
      const en = cleaned.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));
      return parseInt(en) || 0;
    };

    // Look for the nisab amount — it appears as ৳ ২,২৫,৭৫০ or similar
    // Pattern: "যাকাতের নিসাব" followed by a large Bengali number with ৳
    // The HTML typically has something like: ৳ ২,২৫,৭৫০
    const nisabMatch = html.match(/[৳]\s*([০-৯][০-৯,.\s]*[০-৯])/);
    
    if (nisabMatch) {
      const amount = bnToNum(nisabMatch[1]);
      if (amount > 100000) {
        // Extract date - look for "সর্বশেষ হালনাগাদ" or update date
        let dateStr = new Date().toLocaleDateString("en-GB");
        const dateMatch = html.match(/(?:হালনাগাদ|update[d]?)\s*[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
        if (dateMatch) {
          dateStr = dateMatch[1];
        }
        console.log("As-Sunnah nisab:", amount, "date:", dateStr);
        return { amount, date: dateStr };
      }
    }

    // Fallback: try English digit pattern
    const enMatch = html.match(/nisab[^}]*?amount['":\s]*(\d[\d,]+)/i);
    if (enMatch) {
      const amount = parseInt(enMatch[1].replace(/,/g, ""));
      if (amount > 100000) {
        console.log("As-Sunnah nisab (en):", amount);
        return { amount, date: new Date().toLocaleDateString("en-GB") };
      }
    }

    console.error("Could not parse nisab from As-Sunnah page");
    return null;
  } catch (e) {
    console.error("Error fetching As-Sunnah nisab:", e);
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

    // 1. Fetch nisab directly from As-Sunnah Foundation (primary source)
    const asSunnahNisab = await fetchNisabFromAsSunnah();
    if (asSunnahNisab && asSunnahNisab.amount > 0) {
      await supabase.from("site_settings").upsert(
        { key: "zakat_nisab_amount", value: String(asSunnahNisab.amount) },
        { onConflict: "key" }
      );
      await supabase.from("site_settings").upsert(
        { key: "zakat_nisab_date", value: asSunnahNisab.date },
        { onConflict: "key" }
      );
      results.nisab = asSunnahNisab.amount;
      results.nisab_source = "as-sunnah-foundation";
      results.nisab_date = asSunnahNisab.date;
    } else {
      results.nisab_error = "Could not fetch from As-Sunnah, will use gold prices as fallback";
    }

    // 2. Fetch gold prices from GoldR.org (for gold/silver calculator)
    const goldItems = await fetchGoldPrices();
    if (goldItems && goldItems.length >= 4) {
      const getGram = (key: string): number => {
        const item = goldItems.find((g) => g.key === key);
        return item ? Number(item.unit_rate.gram) : 0;
      };

      const gold22k = getGram("22k");
      const gold21k = getGram("21k");
      const gold18k = getGram("18k");
      const goldTrad = getGram("old");

      const settings = [
        { key: "bajus_gold_22k", value: String(gold22k) },
        { key: "bajus_gold_21k", value: String(gold21k) },
        { key: "bajus_gold_18k", value: String(gold18k) },
        { key: "bajus_gold_traditional", value: String(goldTrad) },
        { key: "bajus_last_updated", value: new Date().toISOString() },
      ];

      results.gold = { "22k": gold22k, "21k": gold21k, "18k": gold18k, traditional: goldTrad };

      // Silver prices from HTML
      try {
        const pageRes = await fetch("https://www.goldr.org/", {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        const html = await pageRes.text();

        const bnDigits = "০১২৩৪৫৬৭৮৯";
        const bnToNum = (s: string) => {
          const cleaned = s.replace(/[৳,\s]/g, "");
          const en = cleaned.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));
          return parseInt(en) || 0;
        };

        const silverMatch22 = html.match(/22 Karat Silver<\/td>\s*<td[^>]*><strong>([^<]+)<\/strong>/);
        const silverMatch21 = html.match(/21 Karat Silver<\/td>\s*<td[^>]*><strong>([^<]+)<\/strong>/);
        const silverMatch18 = html.match(/18 Karat Silver<\/td>\s*<td[^>]*><strong>([^<]+)<\/strong>/);
        const silverMatchTrad = html.match(/Silver Type[\s\S]*?Traditional<\/td>\s*<td[^>]*><strong>([^<]+)<\/strong>/);

        const s22 = silverMatch22 ? bnToNum(silverMatch22[1]) : 0;
        const s21 = silverMatch21 ? bnToNum(silverMatch21[1]) : 0;
        const s18 = silverMatch18 ? bnToNum(silverMatch18[1]) : 0;
        const sTrad = silverMatchTrad ? bnToNum(silverMatchTrad[1]) : 0;

        if (s22 > 0) {
          settings.push(
            { key: "bajus_silver_22k", value: String(s22) },
            { key: "bajus_silver_21k", value: String(s21) },
            { key: "bajus_silver_18k", value: String(s18) },
            { key: "bajus_silver_traditional", value: String(sTrad) },
          );
          results.silver = { "22k": s22, "21k": s21, "18k": s18, traditional: sTrad };
        } else {
          settings.push(
            { key: "bajus_silver_22k", value: "560" },
            { key: "bajus_silver_21k", value: "535" },
            { key: "bajus_silver_18k", value: "460" },
            { key: "bajus_silver_traditional", value: "345" },
          );
          results.silver = "Using default values";
        }
      } catch (e) {
        console.log("Silver fetch failed, using defaults");
        settings.push(
          { key: "bajus_silver_22k", value: "560" },
          { key: "bajus_silver_21k", value: "535" },
          { key: "bajus_silver_18k", value: "460" },
          { key: "bajus_silver_traditional", value: "345" },
        );
      }

      // Save all gold/silver settings
      for (const s of settings) {
        await supabase.from("site_settings").upsert(s, { onConflict: "key" });
      }

      // Fallback: if As-Sunnah fetch failed, calculate nisab from silver
      if (!asSunnahNisab || asSunnahNisab.amount <= 0) {
        const silverTrad = results.silver?.traditional || 345;
        const nisab = Math.round(612.36 * silverTrad);
        await supabase.from("site_settings").upsert(
          { key: "zakat_nisab_amount", value: String(nisab) },
          { onConflict: "key" }
        );
        await supabase.from("site_settings").upsert(
          { key: "zakat_nisab_date", value: new Date().toLocaleDateString("en-GB") },
          { onConflict: "key" }
        );
        results.nisab = nisab;
        results.nisab_source = "calculated-from-silver-fallback";
      }
    } else {
      results.gold_error = "Failed to fetch gold prices";
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
