import { URLS, json } from '@/lib/agent/catalog';

/** API catalog (RFC 9727), as an RFC 9264 linkset. */
export const dynamic = 'force-static';

const catalog = {
  linkset: [
    {
      anchor: URLS.api,
      'service-desc': [{ href: URLS.openapi, type: 'application/vnd.oai.openapi+json' }],
      'service-doc': [{ href: URLS.developers, type: 'text/markdown' }],
      status: [{ href: URLS.health, type: 'application/json' }],
    },
    {
      anchor: URLS.mcp,
      'service-desc': [{ href: URLS.mcpCard, type: 'application/json' }],
      'service-doc': [{ href: URLS.developers, type: 'text/markdown' }],
    },
  ],
};

export function GET() {
  return json(catalog, { contentType: 'application/linkset+json' });
}

export function HEAD() {
  return new Response(null, {
    headers: {
      'content-type': 'application/linkset+json; charset=utf-8',
      link: `<${URLS.apiCatalog}>; rel="api-catalog"`,
    },
  });
}
