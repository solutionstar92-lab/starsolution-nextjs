import { Hero } from '@/components/Hero';
import { ResultsPanel } from '@/components/ResultsPanel';
import { CTA } from '@/components/CTA';
import { SectionHead, Goals, Solutions, Process, CaseStudies, Work, Testimonials, Tech, Team } from '@/components/sections';
import {
  site, getSolutions, getGoals, getCaseStudies, getSystems, getAutomations, getTeam,
  getTestimonials, getProjects,
} from '@/lib/content';

export default async function HomePage() {
  const [solutions, goals, cases, systems, automations, team, testimonials, projects] = await Promise.all([
    getSolutions(), getGoals(), getCaseStudies(), getSystems(), getAutomations(),
    getTeam(), getTestimonials(), getProjects(),
  ]);

  return (
    <>
      <Hero nodes={site.heroNodes} stats={site.heroStats} platforms={site.platforms} />
      <Goals goals={goals} />
      <Solutions solutions={solutions} />

      <section id="results" className="section section-soft stats-section" aria-labelledby="statsTitle">
        <div className="starfield starfield-dim" aria-hidden="true" />
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <SectionHead id="statsTitle" eyebrow="Proven results" title="Numbers that speak for themselves" sub="Real client data." />
          <ResultsPanel charts={site.charts} figures={site.figures} />
        </div>
      </section>

      <Process steps={site.process} log={site.nightLog} stats={site.nightStats} />
      <CaseStudies cases={cases} />
      <Work projects={projects} systems={systems} automations={automations} />
      <Testimonials items={testimonials} />
      <Tech platforms={site.platforms} />
      <Team team={team} />
      <CTA />
    </>
  );
}
