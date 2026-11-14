import { AGENT_DESCRIPTION, AGENT_NAME, AGENT_VERSION, URLS, json } from '@/lib/agent/catalog';
import { TOOLS } from '@/lib/agent/tools';
import { SITE_URL } from '@/lib/schema';

/** MCP Server Card (SEP-1649). Describes the live server at /mcp. */
export const dynamic = 'force-static';

export const GET = () =>
  json({
    $schema: 'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json',
    version: '1.0',
    protocolVersion: '2025-06-18',
    serverInfo: { name: 'starsolution-ai', title: AGENT_NAME, version: AGENT_VERSION },
    description: AGENT_DESCRIPTION,
    iconUrl: `${SITE_URL}/logo.png`,
    documentationUrl: URLS.developers,
    endpoint: URLS.mcp,
    transport: { type: 'streamable-http', endpoint: URLS.mcp },
    capabilities: { tools: { listChanged: false }, resources: {}, prompts: {} },
    authentication: { required: false },
    tools: TOOLS.map(({ name, description }) => ({ name, description })),
  });
