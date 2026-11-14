import { SITE_URL } from '@/lib/schema';

/**
 * /robots.txt — a route handler rather than app/robots.ts, because Next's
 * Robots type has no way to write Content-Signal lines.
 *
 * Policy: public pages are open to search and to AI assistants answering
 * questions (ai-input), and may be used for training (ai-train) — for a
 * marketing site, being known to models is the point. Change any of the three
 * signals below to "no" to opt out. /admin and the private API stay closed to
 * everyone.
 */
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended',
  'Meta-ExternalAgent', 'Bytespider', 'CCBot', 'Amazonbot', 'DuckAssistBot', 'MistralAI-User',
];

const SIGNAL = 'Content-Signal: search=yes, ai-input=yes, ai-train=yes';
const RULES = ['Allow: /', 'Allow: /api/v1/', 'Disallow: /admin', 'Disallow: /api/'];

const body = [
  '# StarSolution.ai',
  '# Content signals: https://contentsignals.org',
  '',
  'User-agent: *',
  SIGNAL,
  ...RULES,
  '',
  '# AI crawlers and assistants — same access as everyone else, stated explicitly.',
  ...AI_BOTS.map((bot) => `User-agent: ${bot}`),
  SIGNAL,
  ...RULES,
  '',
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
].join('\n');

export const dynamic = 'force-static';

export function GET() {
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
