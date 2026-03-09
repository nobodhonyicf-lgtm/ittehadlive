import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if auto islamic push is enabled
    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'auto_islamic_push_enabled')
      .maybeSingle();

    if (setting?.value === 'false') {
      return new Response(JSON.stringify({ message: 'Auto islamic push is disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check which content types are enabled for push
    const { data: typeSettings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'push_type_quran_enabled',
        'push_type_hadith_enabled',
        'push_type_dua_enabled',
        'push_type_masala_enabled',
      ]);

    const typeMap: Record<string, boolean> = {
      quran: true,
      hadith: true,
      dua: true,
      masala: true,
    };

    // If settings exist, use them; otherwise default to all enabled
    if (typeSettings && typeSettings.length > 0) {
      for (const ts of typeSettings) {
        const cat = ts.key.replace('push_type_', '').replace('_enabled', '');
        typeMap[cat] = ts.value !== 'false';
      }
    }

    const enabledCategories = Object.entries(typeMap)
      .filter(([_, enabled]) => enabled)
      .map(([cat]) => cat);

    if (enabledCategories.length === 0) {
      return new Response(JSON.stringify({ message: 'All push content types are disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all active islamic contents
    const { data: contents } = await supabase
      .from('islamic_contents')
      .select('*')
      .eq('is_active', true)
      .in('category', enabledCategories);

    if (!contents || contents.length === 0) {
      return new Response(JSON.stringify({ message: 'No islamic contents found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const categoryLabels: Record<string, string> = {
      quran: '📖 আজকের আয়াত',
      hadith: '📜 আজকের হাদিস',
      dua: '🤲 আজকের দোয়া',
      masala: '⚖️ আজকের মাসআলা',
    };

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const todayCategory = enabledCategories[dayOfYear % enabledCategories.length];

    const categoryItems = contents.filter((c: any) => c.category === todayCategory);
    if (categoryItems.length === 0) {
      return new Response(JSON.stringify({ message: `No ${todayCategory} content found` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const todayItem = categoryItems[dayOfYear % categoryItems.length];
    const title = categoryLabels[todayCategory];
    const body = todayCategory === 'masala' && todayItem.question
      ? todayItem.question
      : todayItem.title;

    // Deep link to specific content item
    const url = `/${todayCategory}/${todayItem.id}`;

    // Delete old daily islamic notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('category', 'daily_islamic');

    // Insert new notification record
    const { data: notif } = await supabase
      .from('notifications')
      .insert({
        title,
        body,
        link: url,
        category: 'daily_islamic',
        target: 'all',
        is_sent: false,
      })
      .select()
      .single();

    // Send push via send-push function
    const pushRes = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        title,
        body,
        url,
        notificationId: notif?.id,
      }),
    });

    const pushResult = await pushRes.json();

    return new Response(JSON.stringify({
      success: true,
      category: todayCategory,
      item: todayItem.title,
      push: pushResult,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Daily islamic push error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
