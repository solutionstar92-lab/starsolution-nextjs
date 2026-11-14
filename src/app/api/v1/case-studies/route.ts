import { json, listCaseStudies } from '@/lib/agent/catalog';

export const revalidate = 3600;

export async function GET() {
  return json({ data: await listCaseStudies() });
}
