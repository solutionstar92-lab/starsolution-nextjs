/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  /**
   * /pricing was a live page on the old site and is not one here. Anything
   * still pointing at it — an ad, an email, a search result — lands on the
   * contact page rather than on a 404.
   *
   * Temporary, not permanent: a 308 is cached hard by browsers and would be
   * awkward to undo if the pricing page comes back, which is the stated plan.
   * A 307 costs a redirect every time and keeps that door open.
   */
  /**
   * Agent discovery. Every page names the machine-readable documents in
   * Link headers (RFC 8288), so an agent can find the API catalog, the
   * OpenAPI spec and the docs without parsing HTML. Vary: Accept because the
   * same URL also answers in Markdown (see middleware.ts).
   */
  async headers() {
    return [
      {
        source: '/((?!_next/|api/).*)',
        headers: [
          {
            key: 'Link',
            value: [
              '</.well-known/api-catalog>; rel="api-catalog"',
              '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
              '</developers.md>; rel="service-doc"; type="text/markdown"',
              '</.well-known/ai-catalog.json>; rel="describedby"; type="application/json"',
              '</.well-known/mcp/server-card.json>; rel="mcp-server-card"',
              '</.well-known/agent-card.json>; rel="a2a-agent-card"',
            ].join(', '),
          },
          { key: 'Vary', value: 'Accept' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/pricing', destination: '/contact', permanent: false },
      /* The Vercel production alias served a full copy of the site, which
         Google can index as a duplicate. Send it to the real domain (308).
         Matches this one host only, so preview deployments still work. */
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'starsolutions-eight.vercel.app' }],
        destination: 'https://www.starsolution.ai/:path*',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
