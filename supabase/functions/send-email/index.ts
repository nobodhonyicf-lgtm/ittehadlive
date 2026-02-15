import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailPayload {
  to: string[];
  subject: string;
  html: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin
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

    // Get SMTP settings from site_settings
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "smtp_host",
        "smtp_port",
        "smtp_username",
        "smtp_password",
        "smtp_from_email",
        "smtp_from_name",
        "smtp_secure",
      ]);

    const smtpConfig: Record<string, string> = {};
    settings?.forEach((s: { key: string; value: string | null }) => {
      if (s.value) smtpConfig[s.key] = s.value;
    });

    if (!smtpConfig.smtp_host || !smtpConfig.smtp_username || !smtpConfig.smtp_password) {
      return new Response(
        JSON.stringify({ error: "SMTP সেটিংস কনফিগার করা হয়নি। এডমিন প্যানেল > ইমেইল থেকে সেটআপ করুন।" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, subject, html } = (await req.json()) as EmailPayload;

    if (!to?.length || !subject || !html) {
      return new Response(JSON.stringify({ error: "to, subject, html প্রয়োজন" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromEmail = smtpConfig.smtp_from_email || smtpConfig.smtp_username;
    const fromName = smtpConfig.smtp_from_name || "Admin";
    const port = parseInt(smtpConfig.smtp_port || "587");
    const secure = smtpConfig.smtp_secure === "true";

    // Use raw SMTP via Deno's TCP connection with smtp client
    // We'll use a simple HTTP-based approach with nodemailer-compatible SMTP
    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const recipient of to) {
      try {
        // Build SMTP message using raw TCP
        const conn = secure
          ? await Deno.connectTls({ hostname: smtpConfig.smtp_host, port })
          : await Deno.connect({ hostname: smtpConfig.smtp_host, port });

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const readResponse = async (): Promise<string> => {
          const buf = new Uint8Array(1024);
          const n = await conn.read(buf);
          return n ? decoder.decode(buf.subarray(0, n)) : "";
        };

        const sendCommand = async (cmd: string): Promise<string> => {
          await conn.write(encoder.encode(cmd + "\r\n"));
          return await readResponse();
        };

        // Read greeting
        await readResponse();

        // EHLO
        let ehloResp = await sendCommand(`EHLO localhost`);

        // STARTTLS if not already secure and port is 587
        if (!secure && port === 587 && ehloResp.includes("STARTTLS")) {
          await sendCommand("STARTTLS");
          const tlsConn = await Deno.startTls(conn, { hostname: smtpConfig.smtp_host });
          
          // Re-assign functions for TLS connection
          const readTls = async (): Promise<string> => {
            const buf = new Uint8Array(1024);
            const n = await tlsConn.read(buf);
            return n ? decoder.decode(buf.subarray(0, n)) : "";
          };
          const sendTls = async (cmd: string): Promise<string> => {
            await tlsConn.write(encoder.encode(cmd + "\r\n"));
            return await readTls();
          };

          await sendTls(`EHLO localhost`);

          // AUTH LOGIN
          await sendTls("AUTH LOGIN");
          await sendTls(btoa(smtpConfig.smtp_username));
          const authResp = await sendTls(btoa(smtpConfig.smtp_password));

          if (!authResp.startsWith("235")) {
            results.push({ email: recipient, success: false, error: "Auth failed" });
            tlsConn.close();
            continue;
          }

          await sendTls(`MAIL FROM:<${fromEmail}>`);
          await sendTls(`RCPT TO:<${recipient}>`);
          await sendTls("DATA");

          const message = [
            `From: "${fromName}" <${fromEmail}>`,
            `To: ${recipient}`,
            `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=UTF-8`,
            `Content-Transfer-Encoding: base64`,
            ``,
            btoa(unescape(encodeURIComponent(html))),
            `.`,
          ].join("\r\n");

          const dataResp = await sendTls(message);
          await sendTls("QUIT");
          tlsConn.close();

          results.push({ email: recipient, success: dataResp.startsWith("250") });
        } else {
          // Direct AUTH (SSL on 465 or plain)
          await sendCommand("AUTH LOGIN");
          await sendCommand(btoa(smtpConfig.smtp_username));
          const authResp = await sendCommand(btoa(smtpConfig.smtp_password));

          if (!authResp.startsWith("235")) {
            results.push({ email: recipient, success: false, error: "Auth failed" });
            conn.close();
            continue;
          }

          await sendCommand(`MAIL FROM:<${fromEmail}>`);
          await sendCommand(`RCPT TO:<${recipient}>`);
          await sendCommand("DATA");

          const message = [
            `From: "${fromName}" <${fromEmail}>`,
            `To: ${recipient}`,
            `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=UTF-8`,
            `Content-Transfer-Encoding: base64`,
            ``,
            btoa(unescape(encodeURIComponent(html))),
            `.`,
          ].join("\r\n");

          const dataResp = await sendCommand(message);
          await sendCommand("QUIT");
          conn.close();

          results.push({ email: recipient, success: dataResp.startsWith("250") });
        }
      } catch (err) {
        results.push({ email: recipient, success: false, error: String(err) });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({ success: true, sent: successCount, total: to.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
