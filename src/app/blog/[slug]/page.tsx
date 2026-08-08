import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import posts from '@/data/posts.json';

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = posts.find((p) => p.slug === params.slug);
  return { title: post?.title ?? 'Blog', description: post?.excerpt };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  return (
    <>
      <PageHead
        eyebrow={`${post.tag} · ${post.readingTime}`}
        title={post.title}
        lede={post.excerpt}
        crumbs={[{ href: '/', label: 'Home' }, { href: '/blog', label: 'Blog' }, { label: post.tag }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="detail-layout">
            <div className="detail-body">
              <Reveal>
                {post.body.map((para) => (
                  <p key={para.slice(0, 24)} className="section-sub" style={{ fontSize: '15.5px', marginTop: '14px' }}>{para}</p>
                ))}
              </Reveal>
            </div>
            <aside className="detail-aside">
              <h2>Want this running on your store?</h2>
              <p>Start with a free audit and we will map it out for you.</p>
              <Link href="/contact" className="btn btn-primary btn-lg">Get free audit</Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
