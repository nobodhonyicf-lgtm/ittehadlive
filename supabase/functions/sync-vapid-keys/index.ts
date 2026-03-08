const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is admin via user_roles
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'Authorization': authHeader, 'apikey': SUPABASE_SERVICE_ROLE_KEY },
    });
    const userData = await userRes.json();
    if (!userData?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const roleRes = await fetch(
      `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userData.id}&role=eq.admin&select=id`,
      { headers: { 'apikey': SUPABASE_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
    );
    const roles = await roleRes.json();
    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { vapid_public_key, vapid_private_key } = await req.json();

    if (!vapid_public_key && !vapid_private_key) {
      return new Response(JSON.stringify({ error: 'No keys provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update Supabase secrets via Management API
    // We use vault to store secrets that edge functions can access
    const updates: Record<string, string> = {};
    if (vapid_public_key) updates['VAPID_PUBLIC_KEY'] = vapid_public_key;
    if (vapid_private_key) updates['VAPID_PRIVATE_KEY'] = vapid_private_key;

    // Store in vault via SQL
    for (const [name, value] of Object.entries(updates)) {
      // Delete existing secret if any, then insert new one
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/set_secret_value`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secret_name: name, secret_value: value }),
      });
    }

    // Clear all old push subscriptions (they won't work with new VAPID keys)
    await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?id=not.is.null`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'VAPID keys updated and old subscriptions cleared',
      updated: Object.keys(updates),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Sync VAPID keys error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
