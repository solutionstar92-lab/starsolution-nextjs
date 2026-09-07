import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EntryPage } from '@/components/EntryPage';
import { autoIcon, autoTone } from '@/components/sections';
import { getAutomations } from '@/lib/content';

export async function generateStaticParams() {
  const items = await getAutomations();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const items = await getAutomations();
  const item = items.find((entry) => entry.slug === params.slug);
  return { title: item?.title ?? 'Automations', description: item?.summary };
}

export default async function AutomationsDetailPage({ params }: { params: { slug: string } }) {
  const items = await getAutomations();
  const index = items.findIndex((entry) => entry.slug === params.slug);
  if (index === -1) notFound();

  return (
    <EntryPage
      entry={items[index]}
      section="Automations"
      sectionHref="/automations"
      prev={items[index - 1] ?? null}
      next={items[index + 1] ?? null}
      /* The listing colours these cards by position rather than from the row, so
         the page has to be told the same thing to open in the colour that was
         clicked. Falls back to the row's own icon and tone when it has them. */
      icon={items[index].icon ?? autoIcon(index)}
      tone={items[index].tone ?? autoTone(index)}
    />
  );
}
