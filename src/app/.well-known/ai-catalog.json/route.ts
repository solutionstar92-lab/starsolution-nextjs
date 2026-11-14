import { URLS, json } from '@/lib/agent/catalog';
import { SITE_URL } from '@/lib/schema';

/** ARD capability manifest: one index of every agent-facing surface. */
export const dynamic = 'force-static';

export const GET = () =>
  json({
    specVersion: '1.0',
    host: { displayName: 'StarSolution.ai', identifier: 'did:web:www.starsolution.ai', url: SITE_URL },
    entries: [
      {
        identifier: 'urn:air:www.starsolution.ai:server:starsolution',
        displayName: 'StarSolution.ai MCP server',
        type: 'application/mcp-server-card+json',
        url: URLS.mcpCard,
        representativeQueries: [
          'what services does StarSolution.ai offer',
          'show StarSolution case studies',
          'request a callback from StarSolution',
        ],
      },
      {
        identifier: 'urn:air:www.starsolution.ai:agent:starsolution',
        displayName: 'StarSolution.ai A2A agent',
        type: 'application/a2a-agent-card+json',
        url: URLS.a2aCard,
        representativeQueries: ['do you build Shopify stores in Egypt', 'how do I contact StarSolution'],
      },
      {
        identifier: 'urn:air:www.starsolution.ai:api:public',
        displayName: 'StarSolution.ai public API',
        type: 'application/linkset+json',
        url: URLS.apiCatalog,
        representativeQueries: ['list StarSolution services as JSON', 'search StarSolution blog posts'],
      },
      {
        identifier: 'urn:air:www.starsolution.ai:skill:starsolution',
        displayName: 'StarSolution.ai agent skill',
        type: 'application/agent-skills-index+json',
        url: URLS.skillsIndex,
        representativeQueries: ['how can an agent work with StarSolution.ai'],
      },
    ],
  });
