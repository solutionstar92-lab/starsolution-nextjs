import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { BeforeAfter } from '@/components/BeforeAfter';
import { getProjects } from '@/lib/content';

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = (await getProjects()).find((p) => p.slug === params.slug);
  return { title: project?.title ?? 'Project', description: project?.summary };
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <>
      <PageHead
        eyebrow={project.badge}
        title={project.title}
        lede={project.summary}
        crumbs={[{ href: '/', label: 'Home' }, { href: '/work', label: 'Our work' }, { label: project.title }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="detail-layout">
            <div className="detail-body">
              <Reveal>
                <BeforeAfter theme={project.theme} label={`Compare ${project.title} before and after`} />
                <h2>What we built</h2>
                <ul className="detail-points">
                  {project.points.map((p) => <li key={p}><Icon name="check" /> {p}</li>)}
                </ul>
              </Reveal>
            </div>
            <aside className="detail-aside">
              <h2>Visit the live store</h2>
              <p>See the finished build in production.</p>
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
                Open {project.title} <Icon name="link" className="h-4 w-4" />
              </a>
              <Link href="/contact" className="btn btn-ghost btn-lg mt-2 w-full">Get free audit</Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
