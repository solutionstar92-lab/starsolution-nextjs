import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EntryPage } from '@/components/EntryPage';
import { getTeam } from '@/lib/content';

export async function generateStaticParams() {
  const items = await getTeam();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const items = await getTeam();
  const item = items.find((entry) => entry.slug === params.slug);
  return { title: item?.title ?? 'Team', description: item?.summary };
}

export default async function TeamDetailPage({ params }: { params: { slug: string } }) {
  const items = await getTeam();
  const index = items.findIndex((entry) => entry.slug === params.slug);
  if (index === -1) notFound();

  return (
    <EntryPage
      entry={items[index]}
      section="Team"
      sectionHref="/team"
      prev={items[index - 1] ?? null}
      next={items[index + 1] ?? null}
      pointsTitle="Skills"
      pointsAs="chips"
    />
  );
}
