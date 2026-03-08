import {
  buildPushPayload,
  type PushSubscription,
  type PushMessage,
  type VapidKeys,
} from 'npm:@block65/webcrypto-web-push@1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, icon, url, notificationId, badge, image } = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'title and body required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Read VAPID keys: prefer site_settings (DB), fallback to env vars
    let VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
    let VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Try to get from site_settings (single source of truth)
    try {
      const settingsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/site_settings?key=in.(vapid_public_key,vapid_private_key)&select=key,value`,
        { headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
      );
      const settingsData = await settingsRes.json();
      for (const s of settingsData) {
        if (s.key === 'vapid_public_key' && s.value) VAPID_PUBLIC_KEY = s.value;
        if (s.key === 'vapid_private_key' && s.value) VAPID_PRIVATE_KEY = s.value;
      }
    } catch (e) {
      console.log('Could not read VAPID from DB, using env vars:', e);
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // VAPID configuration
    const vapid: VapidKeys = {
      subject: 'mailto:admin@ittehad.bd',
      publicKey: VAPID_PUBLIC_KEY,
      privateKey: VAPID_PRIVATE_KEY,
    };

    // Fetch logo URL from site_settings for notification icon
    let logoUrl = icon || '';
    if (!logoUrl) {
      const settingsRes = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.app_icon_url&select=value`, {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
      const settingsData = await settingsRes.json();
      logoUrl = settingsData?.[0]?.value || `${SUPABASE_URL}/storage/v1/object/public/uploads/pwa-192x192.png`;
    }

    // Fetch all push subscriptions
    const subRes = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const subscriptions = await subRes.json();

    // Build minimal payload to stay within ~4KB web push limit
    const payloadData: Record<string, unknown> = {
      title,
      body,
      icon: logoUrl,
      data: { url: url || '/' },
    };
    // Only add image if provided (skip badge to save space)
    if (image) {
      payloadData.image = image;
    }

    const pushMessage: PushMessage = {
      data: JSON.stringify(payloadData),
      options: {
        ttl: 86400,
        urgency: 'normal',
      },
    };

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        const pushSubscription: PushSubscription = {
          endpoint: sub.endpoint,
          expirationTime: null,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        // Build encrypted push payload using webcrypto-web-push
        const payload = await buildPushPayload(pushMessage, pushSubscription, vapid);

        const res = await fetch(sub.endpoint, payload);

        const resText = await res.text();
        console.log(`Push to ${sub.endpoint.substring(0, 60)}: status=${res.status}, body=${resText.substring(0, 200)}`);
        if (res.status === 201 || res.status === 200) {
          sent++;
        } else if (res.status === 404 || res.status === 410) {
          // Only delete truly expired/unsubscribed endpoints
          expiredEndpoints.push(sub.endpoint);
          failed++;
        } else {
          // 403/401 = VAPID mismatch - don't delete, it's a server config issue
          failed++;
        }
      } catch (err) {
        console.error(`Push error for ${sub.endpoint}:`, err);
        failed++;
      }
    }

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      for (const endpoint of expiredEndpoints) {
        await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY!,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        });
      }
    }

    // Update notification as sent
    if (notificationId) {
      await fetch(`${SUPABASE_URL}/rest/v1/notifications?id=eq.${notificationId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_sent: true, sent_at: new Date().toISOString() }),
      });
    }

    return new Response(JSON.stringify({ sent, failed, total: subscriptions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Send push error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
