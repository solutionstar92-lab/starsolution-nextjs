import { CONTACT, listCaseStudies, listPosts, listServices, requestCallback } from './catalog';

/**
 * The tool set, defined once and served by the MCP endpoint (/mcp). The
 * WebMCP script in the browser registers the same names, so an agent sees
 * the same tools whichever way it arrives.
 */
export const TOOLS = [
  {
    name: 'list_services',
    description:
      'List StarSolution.ai services: solutions, automations and systems, with summaries, highlights and links.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['solution', 'automation', 'system'], description: 'Optional filter.' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'list_case_studies',
    description: 'List client case studies with the measured result, before/after and a link.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'search_blog',
    description: 'Search StarSolution.ai blog posts by keyword. Returns titles, excerpts and links.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords. Leave empty for the latest posts.' },
        limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'get_contact',
    description: 'How to reach StarSolution.ai: email, contact page and location.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'request_callback',
    description:
      'Ask the StarSolution.ai team to call someone back. Only use with the person’s explicit consent to share their name and phone number.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 2, description: 'Full name.' },
        phone: { type: 'string', description: 'Phone number in international format.' },
        email: { type: 'string', description: 'Optional email.' },
        company: { type: 'string', description: 'Optional company or store name.' },
        message: { type: 'string', description: 'What they need help with.' },
      },
      required: ['name', 'phone'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  },
] as const;

export type ToolName = (typeof TOOLS)[number]['name'];

export async function callTool(name: string, args: Record<string, unknown>, origin: string) {
  switch (name) {
    case 'list_services': {
      const t = args.type;
      const kind = t === 'solution' || t === 'automation' || t === 'system' ? t : undefined;
      return { ok: true, data: await listServices(kind) };
    }
    case 'list_case_studies':
      return { ok: true, data: await listCaseStudies() };
    case 'search_blog':
      return {
        ok: true,
        data: listPosts(typeof args.query === 'string' ? args.query : '', Number(args.limit) || 10),
      };
    case 'get_contact':
      return { ok: true, data: CONTACT };
    case 'request_callback': {
      const r = await requestCallback(origin, args as Record<string, string>);
      return { ok: r.ok, data: r };
    }
    default:
      return null;
  }
}
