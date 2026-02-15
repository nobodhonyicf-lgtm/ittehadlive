import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: isAdmin } = await supabaseUser.rpc("is_admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Get SMS config from site_settings
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", ["sms_api_key", "sms_sender_id", "sms_api_url"]);

    const smsConfig: Record<string, string> = {};
    settings?.forEach((s: { key: string; value: string | null }) => {
      if (s.value) smsConfig[s.key] = s.value;
    });

    if (!smsConfig.sms_api_key) {
      return new Response(
        JSON.stringify({ error: "SMS API Key কনফিগার করা হয়নি। এডমিন প্যানেল > SMS থেকে সেটআপ করুন।" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { numbers, message, action } = await req.json();

    // Balance check
    if (action === "balance") {
      const apiUrl = smsConfig.sms_api_url || "https://bulksmsbd.net/api";
      const balanceResp = await fetch(`${apiUrl}/getBalanceApi?api_key=${smsConfig.sms_api_key}`);
      const balanceData = await balanceResp.json();
      return new Response(JSON.stringify(balanceData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send SMS
    if (!numbers?.length || !message) {
      return new Response(JSON.stringify({ error: "numbers ও message প্রয়োজন" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiUrl = smsConfig.sms_api_url || "https://bulksmsbd.net/api";
    const senderId = smsConfig.sms_sender_id || "";

    const results: { number: string; success: boolean; error?: string; code?: number }[] = [];

    // BulkSMSBD supports sending to multiple numbers with comma separation
    // But we'll batch in groups of 50 for reliability
    const batchSize = 50;
    for (let i = 0; i < numbers.length; i += batchSize) {
      const batch = numbers.slice(i, i + batchSize);
      const numberStr = batch.join(",");

      try {
        const url = `${apiUrl}/smsapi`;
        const params = new URLSearchParams({
          api_key: smsConfig.sms_api_key,
          type: "text",
          number: numberStr,
          senderid: senderId,
          message: message,
        });

        const resp = await fetch(`${url}?${params.toString()}`);
        const data = await resp.json();

        // BulkSMSBD returns response_code 202 for success
        const success = data.response_code === 202 || data.response_code === "202";
        batch.forEach((num: string) => {
          results.push({ number: num, success, code: data.response_code, error: success ? undefined : data.error_message });
        });
      } catch (err) {
        batch.forEach((num: string) => {
          results.push({ number: num, success: false, error: String(err) });
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({ success: true, sent: successCount, total: numbers.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
