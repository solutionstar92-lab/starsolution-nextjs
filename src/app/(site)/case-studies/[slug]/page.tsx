import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EntryPage } from '@/components/EntryPage';
import { getCaseStudies } from '@/lib/content';

export async function generateStaticParams() {
  const items = await getCaseStudies();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const items = await getCaseStudies();
  const item = items.find((entry) => entry.slug === params.slug);
  return { title: item?.title ?? 'Case studies', description: item?.summary };
}

export default async function CaseStudiesDetailPage({ params }: { params: { slug: string } }) {
  const items = await getCaseStudies();
  const index = items.findIndex((entry) => entry.slug === params.slug);
  if (index === -1) notFound();

  return (
    <EntryPage
      entry={items[index]}
      section="Case studies"
      sectionHref="/case-studies"
      prev={items[index - 1] ?? null}
      next={items[index + 1] ?? null}
    />
  );
}
