'use client';

import { useEffect } from 'react';

/**
 * WebMCP: registers this site's tools with the browser, so an AI agent
 * running in the visitor's browser can call them instead of scraping the page.
 * Same tool names as the MCP server at /mcp, backed by the public API.
 *
 * Does nothing in browsers without the API — no UI, no cost.
 */
type Tool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, boolean>;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
};
type ModelContext = {
  registerTool?: (tool: Tool, options?: { signal?: AbortSignal }) => unknown;
  provideContext?: (ctx: { tools: Tool[] }) => unknown;
};

const getJson = async (path: string) => (await fetch(path)).json();
const asText = (data: unknown) => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });

const TOOLS: Tool[] = [
  {
    name: 'list_services',
    description: 'List StarSolution.ai services (solutions, automations, systems) with summaries and links.',
    inputSchema: {
      type: 'object',
      properties: { type: { type: 'string', enum: ['solution', 'automation', 'system'] } },
    },
    annotations: { readOnlyHint: true },
    execute: async ({ type }) => asText(await getJson(`/api/v1/services${type ? `?type=${encodeURIComponent(String(type))}` : ''}`)),
  },
  {
    name: 'list_case_studies',
    description: 'List StarSolution.ai client case studies with measured results.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => asText(await getJson('/api/v1/case-studies')),
  },
  {
    name: 'search_blog',
    description: 'Search StarSolution.ai blog posts by keyword.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
    annotations: { readOnlyHint: true },
    execute: async ({ query }) => asText(await getJson(`/api/v1/posts?q=${encodeURIComponent(String(query ?? ''))}`)),
  },
  {
    name: 'request_callback',
    description:
      'Ask the StarSolution.ai team to call the visitor back. Only with the visitor’s explicit consent to share their name and phone.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 2 },
        phone: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['name', 'phone'],
    },
    annotations: { readOnlyHint: false },
    execute: async ({ name, phone, message }) => {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, phone, message, source: 'agent' }),
      });
      return asText(await res.json().catch(() => ({ status: res.status })));
    },
  },
];

export function WebMcp() {
  useEffect(() => {
    const doc = document as Document & { modelContext?: ModelContext };
    const nav = navigator as Navigator & { modelContext?: ModelContext };
    const mc = doc.modelContext ?? nav.modelContext;
    if (!mc) return;
    const controller = new AbortController();
    try {
      if (typeof mc.registerTool === 'function') {
        for (const tool of TOOLS) mc.registerTool(tool, { signal: controller.signal });
      } else if (typeof mc.provideContext === 'function') {
        mc.provideContext({ tools: TOOLS });
      }
    } catch {
      /* An agent API that changed shape must never break the page. */
    }
    return () => controller.abort();
  }, []);
  return null;
}
