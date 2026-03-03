import type { VercelRequest, VercelResponse } from '@vercel/node';

const CRAWLER_PATTERNS = [
  'facebookexternalhit', 'Facebot', 'Twitterbot', 'LinkedInBot', 'WhatsApp',
  'Slackbot', 'TelegramBot', 'Discordbot', 'Pinterestbot', 'vkShare', 'Viber', 'Line',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers['user-agent'] || '';
  const isCrawler = CRAWLER_PATTERNS.some(p => userAgent.toLowerCase().includes(p.toLowerCase()));

  const type = (req.query.type as string) || 'post';
  const slug = req.query.slug as string;
  const id = req.query.id as string;
  const category = req.query.category as string;

  // Build redirect URL
  let redirectUrl = '/';
  if (type === 'post' && slug) redirectUrl = `/post/${slug}`;
  else if (type === 'teacher' && id) redirectUrl = `/teachers?highlight=${id}`;
  else if (type === 'job' && id) redirectUrl = `/job-apply/${id}`;
  else if (type === 'page' && slug) redirectUrl = `/page/${slug}`;
  else if (type === 'notice' && id) redirectUrl = `/notice/${id}`;
  else if (type === 'book' && slug) redirectUrl = `/book/${slug}`;
  else if (type === 'branch' && id) redirectUrl = `/branch/${id}`;
  else if (type === 'islamic' && id) redirectUrl = `/${category || 'hadith'}?highlight=${id}`;

  if (!isCrawler) {
    return res.redirect(302, redirectUrl);
  }

  try {
    const params = new URLSearchParams({ type });
    if (slug) params.set('slug', slug);
    if (id) params.set('id', id);
    if (category) params.set('category', category);

    const ogUrl = `https://laasotunayiivssffhnu.supabase.co/functions/v1/og-meta?${params}`;
    const response = await fetch(ogUrl, { headers: { 'User-Agent': userAgent } });
    const html = await response.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(html);
  } catch {
    return res.redirect(302, redirectUrl);
  }
}
