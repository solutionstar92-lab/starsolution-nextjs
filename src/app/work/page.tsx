import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { RealResults } from '@/components/RealResults';
import { autoIcon, autoTone } from '@/components/sections';
import { getProjects, getSystems, getAutomations } from '@/lib/content';

export const metadata: Metadata = { title: 'Our work' };

export default async function WorkIndexPage() {
  const [projects, systems, automations] = await Promise.all([getProjects(), getSystems(), getAutomations()]);
  return (
    <>
      <PageHead
        eyebrow="Portfolio"
        title="Our work and projects"
        lede="Real websites, systems and AI automations we have built for clients."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Our work' }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <h2 className="group-label">Live websites</h2>
          <div className="live-grid">
            {projects.map((p, i) => (
              <Reveal as="article" key={p.id} className="live-card" delay={i * 0.08}>
                <span className="live-badge">{p.badge}</span>
                <h3><Link href={`/work/${p.slug}`}>{p.title}</Link></h3>
                <p>{p.short}</p>
                <Link className="live-link" href={`/work/${p.slug}`}>View project <Icon name="link" /></Link>
              </Reveal>
            ))}
          </div>

          <RealResults projects={projects} />

          <h2 className="group-label">Custom systems and dashboards</h2>
          <ul className="system-grid">
            {systems.map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 0.05}>
                <Link href={`/systems/${s.slug}`} className="system-card block h-full">
                  <p className="sys-tag">{s.tag}</p>
                  <h3>{s.title}</h3>
                  <p>{s.short}</p>
                  <p className="sys-demo"><Icon name="play" /> Watch the walkthrough</p>
                </Link>
              </Reveal>
            ))}
          </ul>

          <h2 className="group-label">AI automations and integrations</h2>
          <Reveal as="ul" className="auto-grid">
            {automations.map((a, i) => (
              <li key={a.id}>
                <Link
                  href={`/automations/${a.slug}`}
                  className="auto-card block"
                  style={{ ['--g1' as string]: a.tone ?? autoTone(i) }}
                >
                  <span className="auto-icon"><Icon name={a.icon ?? autoIcon(i)} /></span>
                  <div className="auto-text">
                    <h3>{a.title}</h3>
                    <p>{a.summary}</p>
                  </div>
                  <span className="auto-go" aria-hidden="true"><Icon name="arrow" /></span>
                </Link>
              </li>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
