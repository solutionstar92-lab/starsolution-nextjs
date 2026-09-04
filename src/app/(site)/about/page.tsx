import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { getTeam, site } from '@/lib/content';

export const metadata: Metadata = { title: 'About' };

export default async function AboutPage() {
  const team = await getTeam();
  return (
    <>
      <PageHead
        eyebrow="About"
        title="An automation studio for e-commerce"
        lede="We build the systems that run your store while you sleep — Shopify, ads, social and support, connected and automated."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'About' }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="detail-layout">
            <div className="detail-body">
              <Reveal>
                <h2>What we do</h2>
                <ul className="detail-points">
                  <li><Icon name="check" /> Automate Shopify stores end to end, from order to delivery</li>
                  <li><Icon name="check" /> Run Meta and Google campaigns with machine-managed budgets</li>
                  <li><Icon name="check" /> Answer customers on WhatsApp and on-site with an AI agent</li>
                  <li><Icon name="check" /> Build custom systems and dashboards when off-the-shelf will not do</li>
                </ul>
                <h2>Where we work</h2>
                <p className="section-sub">{site.contact.locations}. Clients across e-commerce, beauty, electronics and home.</p>
              </Reveal>
            </div>
            <aside className="detail-aside">
              <h2>Work with us</h2>
              <p>Start with a free audit of your store, ads and workflows.</p>
              <Link href="/contact" className="btn btn-primary btn-lg">Get free audit</Link>
            </aside>
          </div>

          <h2 className="group-label mt-10">The team</h2>
          <ul className="team-grid">
            {team.map((m) => (
              <li className="team-card" key={m.id}>
                <Link href={`/team/${m.slug}`} className="flex flex-col items-center gap-1.5">
                  <span className="avatar" style={{ ['--a1' as string]: m.tone }}>{m.initials}</span>
                  <strong>{m.title}</strong>
                  <span>{m.role}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
