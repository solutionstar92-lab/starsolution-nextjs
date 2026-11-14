import { randomUUID } from 'crypto';
import { CONTACT, listCaseStudies, listPosts, listServices, requestCallback } from '@/lib/agent/catalog';

/**
 * A2A agent, JSON-RPC binding, `message/send` only. It is a router, not an
 * LLM: it reads the request, picks the matching skill from the agent card and
 * answers from the same data as the site. A data part carrying name + phone is
 * a callback request.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Part = { kind?: string; type?: string; text?: string; data?: Record<string, unknown> };
type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: { message?: { parts?: Part[]; contextId?: string } } };

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, authorization',
};

const reply = (id: Rpc['id'], contextId: string, text: string, data?: unknown) => ({
  jsonrpc: '2.0',
  id,
  result: {
    kind: 'message',
    role: 'agent',
    messageId: randomUUID(),
    contextId,
    parts: [{ kind: 'text', text }, ...(data === undefined ? [] : [{ kind: 'data', data }])],
  },
});

const bullet = (rows: { title: string; url: string; summary?: string; excerpt?: string; result?: string }[]) =>
  rows.map((r) => `- ${r.title}${r.result ? ` — ${r.result}` : ''}: ${r.url}`).join('\n');

export async function POST(request: Request) {
  let rpc: Rpc;
  try {
    rpc = await request.json();
  } catch {
    return Response.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { status: 400, headers: cors });
  }
  const { id = null, method, params } = rpc;
  if (method !== 'message/send') {
    return Response.json(
      { jsonrpc: '2.0', id, error: { code: -32601, message: 'Only message/send is supported.' } },
      { headers: cors },
    );
  }

  const parts = params?.message?.parts ?? [];
  const contextId = params?.message?.contextId ?? randomUUID();
  const text = parts.filter((p) => p.text).map((p) => p.text).join(' ').trim();
  const data = parts.find((p) => p.data)?.data;
  const q = text.toLowerCase();

  let out;
  if (data && data.name && data.phone) {
    const r = await requestCallback(new URL(request.url).origin, data as Record<string, string>);
    out = reply(id, contextId, r.message, r);
  } else if (/case|result|client|proof|حالة|نتائج/.test(q)) {
    const rows = await listCaseStudies();
    out = reply(id, contextId, `StarSolution.ai case studies:\n${bullet(rows)}`, rows);
  } else if (/blog|post|article|read|مقال/.test(q)) {
    const words = q.replace(/\b(blog|posts?|articles?|about|any|on|the|read)\b/g, ' ').trim();
    const rows = listPosts(words, 5);
    const list = rows.length ? rows : listPosts('', 5);
    out = reply(id, contextId, `Blog posts:\n${bullet(list)}`, list);
  } else if (/contact|call|reach|email|phone|price|cost|quote|تواصل|سعر/.test(q)) {
    out = reply(
      id,
      contextId,
      `Email ${CONTACT.email} or use ${CONTACT.contactPage}. To request a callback, send a data part with "name" and "phone" (with the person's consent).`,
      CONTACT,
    );
  } else {
    const rows = await listServices();
    out = reply(id, contextId, `StarSolution.ai services:\n${bullet(rows)}`, rows);
  }
  return Response.json(out, { headers: cors });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}
