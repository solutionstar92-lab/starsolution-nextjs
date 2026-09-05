import Link from 'next/link';
import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { Rail } from './Rail';
import { ProjectCard } from './ProjectCard';
import { GoalMotif } from './ui/GoalMotif';
import { SystemCard } from './ui/SystemCard';
import type { Entry, Project, Testimonial } from '@/lib/types';

/* Every automation carries its own icon and tone, in site.json and — since the
   schema gained the columns — in Supabase too. These remain as a fallback for a
   row that arrives without them, but note it is a guess from array position, so
   it only lands correctly while the order matches the ring below. */
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
                {/* First child so it paints under everything after it — see
                    the stacking note in the CSS. */}
                <GoalMotif icon={g.icon} />
                <span className="goal-icon" style={{ ['--g1' as string]: g.tone }}><Icon name={g.icon ?? 'star'} /></span>
                <h3>{g.title}</h3>
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

/* ---------------- Systems ---------------- */
/**
 * Custom systems and dashboards.
 *
 * Promoted out of the Work section, where it was a `group-label` and a row of
 * plain cards between the portfolio and the automations, and given the slot the
 * solutions bento used to hold. It is the thing the business actually builds,
 * so it gets a section head and cards with the same weight as the goals above.
 */
export function Systems({ systems }: { systems: Entry[] }) {
  if (!systems.length) return null;
  return (
    <section id="systems" className="section" aria-labelledby="sysTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead
          id="sysTitle"
          eyebrow="Built for you"
          title="Custom systems and dashboards"
          sub="Software of your own, not another subscription."
        />
        <ul className="system-list">
          {systems.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 0.06}>
              <SystemCard system={s} index={i} heading="h3" />
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
export function Process({ steps, log, stats, bare = false }: {
  steps: { num: string; icon: string; title: string; text: string }[];
  log: { time: string; title: string; text: string }[];
  stats: [string, string][];
  /**
   * Drop the section head. /process already states "Simple process — Three
   * steps to automated growth" in its PageHead, so rendering it again here put
   * the same eyebrow and the same H1-sized title twice, one directly under the
   * other.
   */
  bare?: boolean;
}) {
  return (
    <section id="how" className="section" aria-labelledby={bare ? undefined : 'howTitle'}>
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        {!bare && (
          <SectionHead id="howTitle" eyebrow="Simple process" title="Three steps to automated growth" sub="Most clients are live in under 14 days." />
        )}
        {/* With the section head suppressed there is no h2 between the page's
            h1 and these, so they step up to keep the outline contiguous. */}
        <ol className="steps">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.num} className="step" delay={i * 0.08}>
              <p className="step-num">{s.num}</p>
              <span className="step-icon"><Icon name={s.icon} /></span>
              {bare ? <h2>{s.title}</h2> : <h3>{s.title}</h3>}
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="sleep-panel">
          <div className="sleep-head">
            <p className="eyebrow eyebrow-invert"><span className="eyebrow-dot" aria-hidden="true" /> While you sleep</p>
            {bare
              ? <h2>Your automations don&apos;t clock out</h2>
              : <h3>Your automations don&apos;t clock out</h3>}
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
/* `systems` is gone from here: it has its own section further up the page now. */
export function Work({ projects, automations }: { projects: Project[]; automations: Entry[] }) {
  return (
    <section id="work" className="section" aria-labelledby="workTitle">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead id="workTitle" eyebrow="Portfolio" title="Our work and projects" sub="Websites, systems and automations." />

        <h3 className="group-label">Live websites</h3>
        <div className="live-grid">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} delay={i * 0.08} heading="h4" />
          ))}
        </div>

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
