import TurndownService from 'turndown';

/**
 * Markdown for agents. The middleware rewrites any page request that asks
 * for `Accept: text/markdown` here, with the original path in x-md-path.
 *
 * It renders the real page (asking for HTML, flagged so the middleware lets
 * it through), keeps the <main> content, drops chrome and scripts, and
 * converts the rest. One converter for every page means a new page is
 * readable as Markdown the day it ships, with nothing to keep in sync.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
td.remove(['script', 'style', 'noscript', 'canvas', 'iframe', 'form', 'button', 'nav', 'header', 'footer']);
// SVG is not in the HTML tag map turndown is typed against, so it is removed by filter.
td.remove((node) => node.nodeName.toLowerCase() === 'svg');

const pick = (html: string, re: RegExp) => re.exec(html)?.[1]?.trim() ?? '';
const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = request.headers.get('x-md-path') || url.searchParams.get('path') || '/';
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Bad path', { status: 400 });

  const page = await fetch(new URL(path, url.origin), {
    headers: { accept: 'text/html', 'x-md-internal': '1' },
    redirect: 'follow',
    cache: 'no-store',
  });
  const html = await page.text();
  if (!(page.headers.get('content-type') ?? '').includes('text/html')) {
    return new Response(html, { status: page.status, headers: { 'content-type': page.headers.get('content-type') ?? 'text/plain' } });
  }

  const title = decode(pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const description = decode(pick(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i));
  const main = pick(html, /<main[^>]*>([\s\S]*)<\/main>/i) || pick(html, /<body[^>]*>([\s\S]*)<\/body>/i);

  const body = td
    .turndown(main)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const canonical = new URL(path, 'https://www.starsolution.ai').toString();
  const md = [`# ${title}`, description && `> ${description}`, `Source: ${canonical}`, '', body, ''].filter((l) => l !== '').join('\n\n');

  return new Response(md, {
    status: page.status,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      vary: 'Accept',
      'x-markdown-tokens': String(Math.ceil(md.length / 4)),
      'cache-control': 'public, max-age=300, s-maxage=3600',
      link: `<${canonical}>; rel="canonical"`,
    },
  });
}
