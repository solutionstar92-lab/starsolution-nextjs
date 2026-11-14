import { AGENT_DESCRIPTION, AGENT_VERSION } from '@/lib/agent/catalog';
import { TOOLS, callTool } from '@/lib/agent/tools';

/**
 * MCP server, Streamable HTTP transport, stateless: every POST carries one
 * JSON-RPC message (or a batch) and gets a plain JSON reply. No sessions and
 * no server-to-client stream, which the spec allows and which suits a
 * serverless function. Public and read-mostly; see /auth.md.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPPORTED = ['2025-06-18', '2025-03-26', '2024-11-05'];

type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, GET, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, mcp-protocol-version, mcp-session-id, authorization',
};

const ok = (id: Rpc['id'], result: unknown) => ({ jsonrpc: '2.0', id, result });
const fail = (id: Rpc['id'], code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

async function handle(msg: Rpc, origin: string) {
  const { id, method, params = {} } = msg;
  const isNotification = id === undefined;
  if (msg.jsonrpc !== '2.0' || typeof method !== 'string') return fail(id, -32600, 'Invalid Request');

  switch (method) {
    case 'initialize': {
      const asked = String(params.protocolVersion ?? '');
      return ok(id, {
        protocolVersion: SUPPORTED.includes(asked) ? asked : SUPPORTED[0],
        capabilities: { tools: { listChanged: false }, resources: {}, prompts: {} },
        serverInfo: { name: 'starsolution-ai', title: 'StarSolution.ai', version: AGENT_VERSION },
        instructions: AGENT_DESCRIPTION,
      });
    }
    case 'ping':
      return ok(id, {});
    case 'tools/list':
      return ok(id, { tools: TOOLS });
    case 'resources/list':
      return ok(id, { resources: [] });
    case 'resources/templates/list':
      return ok(id, { resourceTemplates: [] });
    case 'prompts/list':
      return ok(id, { prompts: [] });
    case 'tools/call': {
      const name = String(params.name ?? '');
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const out = await callTool(name, args, origin);
      if (!out) return fail(id, -32602, `Unknown tool: ${name}`);
      return ok(id, {
        content: [{ type: 'text', text: JSON.stringify(out.data, null, 2) }],
        structuredContent: { result: out.data },
        isError: !out.ok,
      });
    }
    default:
      if (isNotification) return null; // notifications/initialized and friends
      return fail(id, -32601, `Method not found: ${method}`);
  }
}

export async function POST(request: Request) {
  let body: Rpc | Rpc[];
  try {
    body = await request.json();
  } catch {
    return Response.json(fail(null, -32700, 'Parse error'), { status: 400, headers: cors });
  }
  const origin = new URL(request.url).origin;
  const messages = Array.isArray(body) ? body : [body];
  const replies = (await Promise.all(messages.map((m) => handle(m, origin)))).filter(Boolean);
  if (!replies.length) return new Response(null, { status: 202, headers: cors });
  return Response.json(Array.isArray(body) ? replies : replies[0], { headers: cors });
}

/** No server-initiated stream on this stateless server. */
export function GET() {
  return new Response('This MCP server uses Streamable HTTP over POST only.', {
    status: 405,
    headers: { ...cors, allow: 'POST, OPTIONS' },
  });
}

export function DELETE() {
  return new Response(null, { status: 405, headers: { ...cors, allow: 'POST, OPTIONS' } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}
