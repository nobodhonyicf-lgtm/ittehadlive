import type { VercelRequest, VercelResponse } from '@vercel/node';

const CRAWLER_PATTERNS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Pinterestbot',
  'vkShare',
  'Viber',
  'Line',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers['user-agent'] || '';
  const isCrawler = CRAWLER_PATTERNS.some(p => userAgent.toLowerCase().includes(p.toLowerCase()));

  if (!isCrawler) {
    // Not a crawler, serve the SPA
    return res.redirect(302, `/post/${req.query.slug}`);
  }

  // Crawler detected, proxy to og-meta edge function
  const slug = req.query.slug as string;
  if (!slug) {
    return res.status(400).send('Missing slug');
  }

  try {
    const ogUrl = `https://laasotunayiivssffhnu.supabase.co/functions/v1/og-meta?slug=${encodeURIComponent(slug)}`;
    const response = await fetch(ogUrl, {
      headers: { 'User-Agent': userAgent },
    });
    const html = await response.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(html);
  } catch {
    return res.redirect(302, `/post/${slug}`);
  }
}
