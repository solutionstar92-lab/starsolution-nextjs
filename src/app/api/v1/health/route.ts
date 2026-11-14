import { json } from '@/lib/agent/catalog';

export const dynamic = 'force-dynamic';

export const GET = () =>
  json({ status: 'ok', time: new Date().toISOString() }, { headers: { 'cache-control': 'no-store' } });
