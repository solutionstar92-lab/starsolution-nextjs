import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EntryPage } from '@/components/EntryPage';
import { getSolutions } from '@/lib/content';

export async function generateStaticParams() {
  const items = await getSolutions();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const items = await getSolutions();
  const item = items.find((entry) => entry.slug === params.slug);
  return { title: item?.title ?? 'Solutions', description: item?.summary };
}

export default async function SolutionsDetailPage({ params }: { params: { slug: string } }) {
  const items = await getSolutions();
  const index = items.findIndex((entry) => entry.slug === params.slug);
  if (index === -1) notFound();

  return (
    <EntryPage
      entry={items[index]}
      section="Solutions"
      sectionHref="/solutions"
      prev={items[index - 1] ?? null}
      next={items[index + 1] ?? null}
    />
  );
}
