import { json } from '@/lib/agent/catalog';
import { relayMetadata } from '@/lib/agent/oauth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const meta = (await relayMetadata('oauth')) ?? (await relayMetadata('openid'));
  return meta ? json(meta) : json({ error: 'not_found' }, { status: 404 });
}
