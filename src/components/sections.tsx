import Link from 'next/link';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { Rail } from './Rail';
import { BeforeAfter } from './BeforeAfter';
import type { Entry, Project, Testimonial } from '@/lib/types';

/* Automations carry their own icon and tone in site.json, but the Supabase
   table has no such columns — these keep the cards coloured either way. */
const AUTO_TONES = ['#3B82F6', '#34D399', '#FBBF24', '#F472B6', '#38BDF8', '#7C6CFF'];
const AUTO_ICONS = ['revenue', 'whatsapp', 'package', 'play', 'bot', 'build'];
export const autoTone = (i: number) => AUTO_TONES[i % AUTO_TONES.length];
export const autoIcon = (i: number) => AUTO_ICONS[i % AUTO_ICONS.length];

export function SectionHead({
  eyebrow, title, sub, id, row, action,
}: {
  eyebrow: string; title: string; sub?: string; id?: string; row?: boolean; action?: React.ReactNode;
}) {
  return (
    <Reveal as="header" className={`section-head${row ? ' section-head-row' : ''}`}>
      <div>
        <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> {eyebrow}</p>
        <h2 id={id} className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {action}
    </Reveal>
  );
}

/* ---------------- Goals ---------------- */
export function Goals({ goals }: { goals: Entry[] }) {
  return (
    <section className="section section-soft" aria-labelledby="goalsTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead id="goalsTitle" eyebrow="Choose your business goal" title="What do you want to achieve?" sub="Pick one. We build it." />
        <ul className="goal-grid">
          {goals.map((g, i) => (
            <Reveal as="li" key={g.id} delay={i * 0.06}>
              <Link href={`/goals/${g.slug}`} className="goal-card block" style={{ ['--tone' as string]: g.tone }}>
                <span className="goal-icon" style={{ ['--g1' as string]: g.tone }}><Icon name={g.icon ?? 'star'} /></span>
                <h3>{g.title}</h3>
                <p>{g.short}</p>
                <p className="goal-metric"><span>{g.metric}</span> {g.metricLabel}</p>
                <span className="link-arrow">Explore <Icon name="arrow" /></span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Solutions ---------------- */
export function Solutions({ solutions }: { solutions: Entry[] }) {
  return (
    <section id="solutions" className="section" aria-labelledby="solTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead id="solTitle" eyebrow="What we do" title="The complete AI automation suite" sub="Six systems. Your existing tools." />
        <div className="bento">
          {solutions.map((s, i) => {
            const cls = i === 0 ? 'bento-lead' : i === 5 ? 'bento-wide' : '';
            const card = (
              <Link href={`/solutions/${s.slug}`} className="bento-card block h-full">
                <span className="sol-icon" style={{ ['--g1' as string]: s.tone }}><Icon name={s.icon ?? 'star'} /></span>
                <p className="sol-badge">{s.badge}</p>
                <h3>{s.title}</h3>
                <p className="sol-desc">{s.short}</p>
                <span className="card-glow" aria-hidden="true" />
              </Link>
            );
            // The first system is always on screen. The rest fade in as they
            // reach the bottom edge and fade back out when you scroll up.
            return i === 0
              ? <article key={s.id} className={cls}>{card}</article>
              : <Reveal as="article" key={s.id} className={cls} repeat>{card}</Reveal>;
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Process ---------------- */
export function Process({ steps, log, stats }: {
  steps: { num: string; icon: string; title: string; text: string }[];
  log: { time: string; title: string; text: string }[];
  stats: [string, string][];
}) {
  return (
    <section id="how" className="section" aria-labelledby="howTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead id="howTitle" eyebrow="Simple process" title="Three steps to automated growth" sub="Most clients are live in under 14 days." />
        <ol className="steps">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.num} className="step" delay={i * 0.08}>
              <p className="step-num">{s.num}</p>
              <span className="step-icon"><Icon name={s.icon} /></span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="sleep-panel">
          <div className="sleep-head">
            <p className="eyebrow eyebrow-invert"><span className="eyebrow-dot" aria-hidden="true" /> While you sleep</p>
            <h3>Your automations don&apos;t clock out</h3>
            <p>One night, one account.</p>
          </div>
          <ol className="sleep-log">
            {log.map((l) => (
              <li key={l.time}>
                <span className="log-time">{l.time}</span>
                <span className="log-body"><strong>{l.title}</strong> {l.text}</span>
              </li>
            ))}
          </ol>
          <dl className="sleep-stats">
            {stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Case studies ---------------- */
export function CaseCard({ c }: { c: Entry }) {
  return (
    <article className="case-card">
      <Link href={`/case-studies/${c.slug}`} className="block h-full">
        <div className="case-visual" style={{ ['--c1' as string]: c.c1, ['--c2' as string]: c.c2 }}>
          <p className="case-kpi">{c.kpi}<span>{c.kpiUnit}</span></p>
          <p className="case-kpi-label">{c.kpiLabel}</p>
          <svg className="case-spark" viewBox="0 0 200 60" aria-hidden="true">
            <polyline points="0,52 28,48 56,42 84,34 112,26 140,16 168,10 200,4" />
          </svg>
        </div>
        <div className="case-body">
          <p className="case-type">{c.type}</p>
          <div className="case-compare">
            <div><span>Before</span><strong>{c.before}</strong></div>
            <Icon name="arrow" className="case-arrow" />
            <div><span>After</span><strong>{c.after}</strong></div>
          </div>
          <p className="case-delta">{c.delta} <em>{c.period}</em></p>
          <span className="link-arrow">Read the case study <Icon name="arrow" /></span>
        </div>
      </Link>
    </article>
  );
}

export function CaseStudies({ cases }: { cases: Entry[] }) {
  return (
    <section className="section section-soft" aria-labelledby="caseTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead
          id="caseTitle" row eyebrow="Case studies" title="Real businesses. Real growth."
          action={<Link href="/case-studies" className="link-arrow">View all <Icon name="arrow" /></Link>}
        />
      </div>
      <Rail id="cases" label="Case studies">
        {cases.map((c) => <CaseCard key={c.id} c={c} />)}
      </Rail>
    </section>
  );
}

/* ---------------- Work ---------------- */
export function Work({ projects, systems, automations }: { projects: Project[]; systems: Entry[]; automations: Entry[] }) {
  return (
    <section id="work" className="section" aria-labelledby="workTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead id="workTitle" eyebrow="Portfolio" title="Our work and projects" sub="Websites, systems and automations." />

        <h3 className="group-label">Live websites</h3>
        <div className="live-grid">
          {projects.map((p, i) => (
            <Reveal as="article" key={p.id} className="live-card" delay={i * 0.08}>
              <BeforeAfter theme={p.theme} label={`Compare ${p.title} before and after`} />
              <span className="live-badge">{p.badge}</span>
              <h4><Link href={`/work/${p.slug}`}>{p.title}</Link></h4>
              <p>{p.short}</p>
              <Link className="live-link" href={`/work/${p.slug}`}>View project <Icon name="link" /></Link>
            </Reveal>
          ))}
        </div>

        <h3 className="group-label">Custom systems and dashboards</h3>
        <ul className="system-grid">
          {systems.map((s, i) => {
            const card = (
              <Link href={`/systems/${s.slug}`} className="system-card block h-full">
                <p className="sys-tag">{s.tag}</p>
                <h4>{s.title}</h4>
                <p>{s.short}</p>
                <p className="sys-demo"><Icon name="play" /> Watch the walkthrough</p>
              </Link>
            );
            // The first system is always on screen. The rest fade in as they
            // reach the bottom edge and fade back out when you scroll up.
            return i === 0
              ? <li key={s.id}>{card}</li>
              : <Reveal as="li" key={s.id} repeat>{card}</Reveal>;
          })}
        </ul>

        <h3 className="group-label">AI automations and integrations</h3>
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
                  <h4>{a.title}</h4>
                  <p>{a.summary}</p>
                </div>
                <span className="auto-go" aria-hidden="true"><Icon name="arrow" /></span>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section className="section section-soft" aria-labelledby="revTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead
          id="revTitle" row eyebrow="Client reviews" title="What our clients say"
          action={<p className="rating-line"><strong>4.9/5</strong> from 150+ clients</p>}
        />
      </div>
      <Rail id="reviews" label="Testimonials">
        {items.map((t) => (
          <figure className="review" key={t.id}>
            <Icon name="quote" className="rq" />
            <blockquote>{t.quote}</blockquote>
            <figcaption>
              <span className="avatar" style={{ ['--a1' as string]: t.tone }}>{t.initials}</span>
              <span><strong>{t.name}</strong>{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </Rail>
    </section>
  );
}

/* ---------------- Team ---------------- */
export function Team({ team }: { team: Entry[] }) {
  return (
    <section className="section section-soft" aria-labelledby="teamTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead id="teamTitle" eyebrow="Our team" title="The people behind your growth" sub="Automation, AI and e-commerce." />
        <ul className="team-grid" id="teamRail">
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
  );
}
