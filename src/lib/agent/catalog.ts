import { createHash } from 'crypto';
import {
  getSolutions, getAutomations, getSystems, getCaseStudies,
} from '@/lib/content';
import { getPosts } from '@/lib/i18n';
import { SITE_URL } from '@/lib/schema';
import type { Entry } from '@/lib/types';

/**
 * One source of truth for everything machines read: the public API, the MCP
 * server, the A2A agent and the WebMCP tools all answer from these functions,
 * which read the same loaders the pages use. A new solution or post shows up
 * for agents the moment its page exists.
 */

export const AGENT_NAME = 'StarSolution.ai';
export const AGENT_VERSION = '1.0.0';
export const AGENT_DESCRIPTION =
  'AI automation for e-commerce brands in Egypt and the region: Shopify development, workflow automation (n8n, WhatsApp, Meta), and full-stack systems. Ask about services, case studies and the blog, or request a callback.';

export const URLS = {
  api: `${SITE_URL}/api/v1`,
  openapi: `${SITE_URL}/openapi.json`,
  developers: `${SITE_URL}/developers.md`,
  health: `${SITE_URL}/api/v1/health`,
  mcp: `${SITE_URL}/mcp`,
  mcpCard: `${SITE_URL}/.well-known/mcp/server-card.json`,
  a2a: `${SITE_URL}/a2a`,
  a2aCard: `${SITE_URL}/.well-known/agent-card.json`,
  apiCatalog: `${SITE_URL}/.well-known/api-catalog`,
  skillsIndex: `${SITE_URL}/.well-known/agent-skills/index.json`,
  skill: `${SITE_URL}/.well-known/agent-skills/starsolution/SKILL.md`,
  authMd: `${SITE_URL}/auth.md`,
  prm: `${SITE_URL}/.well-known/oauth-protected-resource`,
};

type Kind = 'solution' | 'automation' | 'system';
const SECTION: Record<Kind, string> = { solution: 'solutions', automation: 'automations', system: 'systems' };

const shown = (rows: Entry[]) => rows.filter((r) => !r.hidden);

export async function listServices(kind?: Kind) {
  const [solutions, automations, systems] = await Promise.all([getSolutions(), getAutomations(), getSystems()]);
  const all: [Kind, Entry[]][] = [['solution', solutions], ['automation', automations], ['system', systems]];
  return all
    .filter(([k]) => !kind || k === kind)
    .flatMap(([k, rows]) =>
      shown(rows).map((r) => ({
        type: k,
        slug: r.slug,
        title: r.title,
        summary: r.summary ?? r.short ?? '',
        highlights: r.points ?? [],
        stats: (r.stats ?? []).map(([label, value]) => ({ label, value })),
        url: `${SITE_URL}/${SECTION[k]}/${r.slug}`,
      })),
    );
}

export async function listCaseStudies() {
  return shown(await getCaseStudies()).map((r) => ({
    slug: r.slug,
    title: r.title,
    type: r.type ?? null,
    summary: r.summary ?? '',
    result: [r.kpi, r.kpiUnit].filter(Boolean).join('') + (r.kpiLabel ? ` ${r.kpiLabel}` : ''),
    before: r.before ?? null,
    after: r.after ?? null,
    period: r.period ?? null,
    url: `${SITE_URL}/case-studies/${r.slug}`,
  }));
}

export function listPosts(query?: string, limit = 10) {
  const q = (query ?? '').trim().toLowerCase();
  return getPosts('en')
    .filter((p) => !q || `${p.title} ${p.excerpt} ${p.tag} ${p.body}`.toLowerCase().includes(q))
    .slice(0, Math.max(1, Math.min(limit, 50)))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      tag: p.tag,
      url: `${SITE_URL}/blog/${p.slug}`,
    }));
}

export const CONTACT = {
  email: 'info@starsolution.ai',
  contactPage: `${SITE_URL}/contact`,
  location: 'Cairo, Egypt',
};

/**
 * A callback request, through the same endpoint and validation as the site's
 * own forms. It goes over HTTP rather than calling the handler directly so the
 * lead takes exactly one path into the database.
 */
export async function requestCallback(
  origin: string,
  input: { name?: string; phone?: string; email?: string; company?: string; message?: string },
) {
  const res = await fetch(new URL('/api/leads', origin), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: input.name ?? '',
      phone: input.phone ?? '',
      email: input.email ?? '',
      company: input.company ?? '',
      message: [input.message, 'Submitted by an AI agent (MCP/A2A).'].filter(Boolean).join('\n\n'),
      source: 'agent',
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  return res.ok
    ? { ok: true as const, message: 'Callback requested. The StarSolution team will call back.' }
    : { ok: false as const, message: body.error ?? `Request failed (${res.status}).` };
}

export const sha256 = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');

export const json = (data: unknown, init: ResponseInit & { contentType?: string } = {}) => {
  const { contentType = 'application/json', headers, ...rest } = init;
  return new Response(JSON.stringify(data, null, 2), {
    ...rest,
    headers: {
      'content-type': `${contentType}; charset=utf-8`,
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=300, s-maxage=3600',
      ...(headers as Record<string, string> | undefined),
    },
  });
};

export const text = (body: string, contentType: string, extra: Record<string, string> = {}) =>
  new Response(body, {
    headers: {
      'content-type': `${contentType}; charset=utf-8`,
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=300, s-maxage=3600',
      ...extra,
    },
  });
