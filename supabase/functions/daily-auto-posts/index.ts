import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const POST_TYPES = [
  {
    key: "madrasa",
    prompt: `তুমি একজন পেশাদার বাংলা কন্টেন্ট লেখক। "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ" (বাংলাদেশের প্রাইভেট মাদরাসা সমন্বয় সংগঠন) এর ওয়েবসাইটের জন্য একটি তথ্যবহুল পোস্ট লেখো।

বিষয়: বাংলাদেশের মাদরাসা শিক্ষা ব্যবস্থা সম্পর্কে একটি তথ্যমূলক পোস্ট। এতে মাদরাসার ইতিহাস, শিক্ষা পদ্ধতি, পাঠ্যক্রম, শিক্ষকদের ভূমিকা, ছাত্রদের সাফল্য, বা মাদরাসার সামাজিক অবদান যেকোনো একটি বিষয় নিয়ে লেখো। প্রতিবার ভিন্ন বিষয় বেছে নাও।`,
    imageKeyword: "islamic school madrasa education bangladesh",
    category: "মাদরাসা তথ্য",
  },
  {
    key: "education",
    prompt: `তুমি একজন পেশাদার বাংলা কন্টেন্ট লেখক। শিক্ষা সম্পর্কিত একটি উচ্চমানের ব্লগ পোস্ট লেখো।

বিষয়: আধুনিক শিক্ষা, ইসলামী শিক্ষার গুরুত্ব, শিক্ষার্থীদের জন্য পরামর্শ, পড়াশোনার কৌশল, শিক্ষকদের ভূমিকা, কুরআনিক শিক্ষা পদ্ধতি, বা শিক্ষায় প্রযুক্তির ব্যবহার—যেকোনো একটি বিষয় নিয়ে লেখো। প্রতিবার ভিন্ন বিষয় বেছে নাও।`,
    imageKeyword: "islamic education learning student study",
    category: "শিক্ষা",
  },
  {
    key: "islamic",
    prompt: `তুমি একজন পেশাদার বাংলা ইসলামী কন্টেন্ট লেখক। একটি ইসলামী বিষয়ে গভীর ও শিক্ষামূলক পোস্ট লেখো।

বিষয়: ইসলামের ইতিহাস, নবীদের জীবনী, সাহাবাদের কাহিনী, ইসলামী আদর্শ, নামাজ-রোজার ফজিলত, দোয়া ও জিকির, ইসলামে নৈতিকতা, বা ইসলামের বৈজ্ঞানিক দৃষ্টিভঙ্গি—যেকোনো একটি বিষয় নিয়ে লেখো। প্রতিবার ভিন্ন বিষয় বেছে নাও।`,
    imageKeyword: "islamic mosque quran prayer muslim",
    category: "ইসলাম",
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if auto posting is enabled
    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'auto_post_enabled')
      .maybeSingle();

    if (setting?.value === 'false') {
      return new Response(JSON.stringify({ message: 'Auto posting is disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: any[] = [];

    for (const postType of POST_TYPES) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const randomSeed = Math.floor(Math.random() * 10000);

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              {
                role: 'system',
                content: 'তুমি একজন দক্ষ বাংলা কন্টেন্ট লেখক। সবসময় শুধু valid JSON রিটার্ন করো, কোনো মার্কডাউন বা কোড ব্লক নয়।',
              },
              {
                role: 'user',
                content: `${postType.prompt}

আজকের তারিখ: ${today}, Random seed: ${randomSeed}

নিচের JSON ফরম্যাটে রিটার্ন করো:
{
  "title": "আকর্ষণীয় বাংলা শিরোনাম",
  "content": "পূর্ণাঙ্গ আর্টিকেল (কমপক্ষে ৬০০ শব্দ, HTML প্যারাগ্রাফ ট্যাগ সহ <p>, <h2>, <h3>, <strong>, <ul>, <li> ব্যবহার করো)",
  "summary": "২-৩ বাক্যের সারসংক্ষেপ",
  "meta_title": "SEO টাইটেল (৬০ অক্ষরের মধ্যে)",
  "meta_description": "SEO বিবরণ (১৬০ অক্ষরের মধ্যে)",
  "slug": "url-friendly-slug-using-english"
}`,
              },
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`AI error for ${postType.key}:`, aiResponse.status, errText);
          if (aiResponse.status === 429) {
            results.push({ type: postType.key, error: 'Rate limited, skipping' });
            continue;
          }
          throw new Error(`AI error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const rawContent = aiData.choices?.[0]?.message?.content || '';

        let parsed;
        try {
          const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawContent];
          parsed = JSON.parse(jsonMatch[1].trim());
        } catch {
          parsed = JSON.parse(rawContent.trim());
        }

        // Generate a unique slug with date
        const slug = `${parsed.slug || postType.key}-${today}-${randomSeed}`;

        // Get image from Unsplash (free, no API key needed for source redirect)
        const imageUrl = `https://source.unsplash.com/800x450/?${encodeURIComponent(postType.imageKeyword)}&sig=${randomSeed}`;

        // Find or create category
        let categoryId: string | null = null;
        const { data: existingCat } = await supabase
          .from('categories')
          .select('id')
          .eq('name', postType.category)
          .maybeSingle();

        if (existingCat) {
          categoryId = existingCat.id;
        } else {
          const catSlug = postType.key + '-auto';
          const { data: newCat } = await supabase
            .from('categories')
            .insert({ name: postType.category, slug: catSlug })
            .select('id')
            .single();
          if (newCat) categoryId = newCat.id;
        }

        // Insert post
        const { data: post, error: postErr } = await supabase
          .from('posts')
          .insert({
            title: parsed.title,
            slug,
            content: parsed.content,
            summary: parsed.summary,
            meta_title: parsed.meta_title,
            meta_description: parsed.meta_description,
            image_url: imageUrl,
            author_name: 'ইত্তেহাদ AI',
            is_published: true,
            is_featured: false,
            category_id: categoryId,
          })
          .select('id, slug')
          .single();

        if (postErr) {
          console.error(`Insert error for ${postType.key}:`, postErr);
          results.push({ type: postType.key, error: postErr.message });
          continue;
        }

        // Submit to IndexNow for SEO
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/index-now`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({ urls: [`/post/${slug}`] }),
          });
        } catch (e) {
          console.error('IndexNow ping failed:', e);
        }

        results.push({ type: postType.key, success: true, postId: post?.id, slug });
        console.log(`✅ ${postType.key} post created: ${parsed.title}`);

      } catch (e) {
        console.error(`Error creating ${postType.key} post:`, e);
        results.push({ type: postType.key, error: e instanceof Error ? e.message : 'Unknown error' });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Daily auto-posts error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
