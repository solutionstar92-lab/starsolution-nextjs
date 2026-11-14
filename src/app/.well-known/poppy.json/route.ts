import { json } from '@/lib/agent/catalog';

/** Personal Agent Protocol, website-only declaration. */
export const dynamic = 'force-static';

export const GET = () =>
  json({
    protocol_version: '0.1',
    organization: { name: 'StarSolution.ai', domain: 'starsolution.ai' },
    web: {},
  });
