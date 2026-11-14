import { AGENT_DESCRIPTION, AGENT_NAME, AGENT_VERSION, URLS, json } from '@/lib/agent/catalog';
import { SITE_URL } from '@/lib/schema';

/** A2A Agent Card for the JSON-RPC agent at /a2a. */
export const dynamic = 'force-static';

export const GET = () =>
  json({
    protocolVersion: '0.3.0',
    name: AGENT_NAME,
    version: AGENT_VERSION,
    description: AGENT_DESCRIPTION,
    url: URLS.a2a,
    preferredTransport: 'JSONRPC',
    supportedInterfaces: [{ url: URLS.a2a, transport: 'JSONRPC', protocolBinding: 'JSONRPC' }],
    additionalInterfaces: [{ url: URLS.a2a, transport: 'JSONRPC' }],
    provider: { organization: AGENT_NAME, url: SITE_URL },
    iconUrl: `${SITE_URL}/logo.png`,
    documentationUrl: URLS.developers,
    capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
    defaultInputModes: ['text/plain', 'application/json'],
    defaultOutputModes: ['text/plain', 'application/json'],
    skills: [
      {
        id: 'services',
        name: 'Services',
        description: 'Describes StarSolution.ai solutions, automations and systems.',
        tags: ['shopify', 'automation', 'n8n', 'e-commerce', 'egypt'],
        examples: ['What services do you offer?', 'Do you do WhatsApp automation?'],
      },
      {
        id: 'case-studies',
        name: 'Case studies',
        description: 'Summarises client results.',
        tags: ['results', 'case study'],
        examples: ['Show me your case studies.'],
      },
      {
        id: 'blog',
        name: 'Blog search',
        description: 'Finds blog posts by keyword.',
        tags: ['blog', 'articles'],
        examples: ['Any posts about Shopify SEO?'],
      },
      {
        id: 'contact',
        name: 'Contact',
        description: 'Gives contact details. Send a data part {"name","phone","message"} to request a callback.',
        tags: ['contact', 'callback'],
        examples: ['How do I reach you?'],
      },
    ],
  });
