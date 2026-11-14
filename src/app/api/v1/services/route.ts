import { json, listServices } from '@/lib/agent/catalog';

export const revalidate = 3600;

export async function GET(request: Request) {
  const t = new URL(request.url).searchParams.get('type');
  const kind = t === 'solution' || t === 'automation' || t === 'system' ? t : undefined;
  return json({ data: await listServices(kind) });
}
