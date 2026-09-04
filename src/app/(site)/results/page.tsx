import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { ResultsPanel } from '@/components/ResultsPanel';
import { CaseCard } from '@/components/sections';
import { Reveal } from '@/components/Reveal';
import { site, getCaseStudies, getTestimonials } from '@/lib/content';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Results' };

export default async function ResultsPage() {
  const [cases, testimonials] = await Promise.all([getCaseStudies(), getTestimonials()]);
  return (
    <>
      <PageHead
        eyebrow="Proven results"
        title="Numbers that speak for themselves"
        lede="Real client data. Tap any figure to see it charted."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Results' }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <ResultsPanel charts={site.charts} figures={site.figures} />

          <h2 className="group-label mt-10">Where the numbers come from</h2>
          <div className="index-grid">
            {cases.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.05}><CaseCard c={c} /></Reveal>
            ))}
          </div>

          <h2 className="group-label mt-10">In their words</h2>
          <div className="index-grid">
            {testimonials.map((t, i) => (
              <Reveal as="figure" key={t.id} className="review w-full" delay={i * 0.04}>
                <Icon name="quote" className="rq" />
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <span className="avatar" style={{ ['--a1' as string]: t.tone }}>{t.initials}</span>
                  <span><strong>{t.name}</strong>{t.role}</span>
                </figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
