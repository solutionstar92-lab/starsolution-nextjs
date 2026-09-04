import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EntryPage } from '@/components/EntryPage';
import { getSystems } from '@/lib/content';

export async function generateStaticParams() {
  const items = await getSystems();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const items = await getSystems();
  const item = items.find((entry) => entry.slug === params.slug);
  return { title: item?.title ?? 'Systems', description: item?.summary };
}

export default async function SystemsDetailPage({ params }: { params: { slug: string } }) {
  const items = await getSystems();
  const index = items.findIndex((entry) => entry.slug === params.slug);
  if (index === -1) notFound();

  return (
    <EntryPage
      entry={items[index]}
      section="Systems"
      sectionHref="/systems"
      prev={items[index - 1] ?? null}
      next={items[index + 1] ?? null}
    />
  );
}
