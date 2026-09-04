import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { getAutomations } from '@/lib/content';

export const metadata: Metadata = { title: 'AI automations and integrations' };

export default async function AutomationsIndexPage() {
  const items = await getAutomations();
  return (
    <>
      <PageHead
        eyebrow="Automations"
        title="AI automations and integrations"
        lede="If it happens twice a week and follows rules, it can be automated."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Automations' }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="index-grid">
            {items.map((item, i) => (
              <Reveal as="article" key={item.id} delay={i * 0.05}>
                <Link href={`/automations/${item.slug}`} className="index-card h-full" style={{ ['--tone' as string]: item.tone }}>
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
