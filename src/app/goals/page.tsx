import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { getGoals } from '@/lib/content';

export const metadata: Metadata = { title: 'What do you want to achieve?' };

export default async function GoalsIndexPage() {
  const items = await getGoals();
  return (
    <>
      <PageHead
        eyebrow="Choose your goal"
        title="What do you want to achieve?"
        lede="Pick the outcome that matters most and we build the automation that gets you there."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Business goals' }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="index-grid">
            {items.map((item, i) => (
              <Reveal as="article" key={item.id} delay={i * 0.05}>
                <Link href={`/goals/${item.slug}`} className="index-card h-full" style={{ ['--tone' as string]: item.tone }}>
                  {item.icon && <span className="index-icon"><Icon name={item.icon} /></span>}
                  <p className="index-badge">{item.badge ?? item.tag ?? item.type ?? item.role ?? item.eyebrow}</p>
                  <h2>{item.title}</h2>
                  <p>{item.short ?? item.summary}</p>
                  <span className="index-more">Read more <Icon name="arrow" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
