import { json, listPosts } from '@/lib/agent/catalog';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return json({ data: listPosts(params.get('q') ?? '', Number(params.get('limit')) || 10) });
}
