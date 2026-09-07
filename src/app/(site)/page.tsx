import { Hero } from '@/components/Hero';
import { ResultsPanel } from '@/components/ResultsPanel';
import { CTA } from '@/components/CTA';
import { SectionHead, Goals, Systems, Process, CaseStudies, Work, Automations, Testimonials, Team } from '@/components/sections';
import {
  site, getGoals, getCaseStudies, getSystems, getAutomations, getTeam,
  getTestimonials, getProjects,
} from '@/lib/content';

export default async function HomePage() {
  // getSolutions() is gone with the bento it fed: it was still a Supabase
  // round trip on every render for a section that no longer exists. The
  // /solutions page and its route are untouched.
  const [goals, cases, systems, automations, team, testimonials, projects] = await Promise.all([
    getGoals(), getCaseStudies(), getSystems(), getAutomations(),
    getTeam(), getTestimonials(), getProjects(),
  ]);

  return (
    <>
      <Hero nodes={site.heroNodes} stats={site.heroStats} platforms={site.platforms} />
      <Goals goals={goals} />
      <Systems systems={systems} />

      <section id="results" className="section section-soft stats-section" aria-labelledby="statsTitle">
        <div className="starfield starfield-dim" aria-hidden="true" />
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <SectionHead id="statsTitle" eyebrow="Proven results" title="Numbers that speak for themselves" sub="Real client data." />
          <ResultsPanel charts={site.charts} figures={site.figures} />
        </div>
      </section>

      <Process steps={site.process} log={site.nightLog} stats={site.nightStats} />
      <CaseStudies cases={cases} />
      <Work projects={projects} />
      <Automations automations={automations} />
      <Testimonials items={testimonials} />
      <Team team={team} />
      <CTA />
    </>
  );
}
