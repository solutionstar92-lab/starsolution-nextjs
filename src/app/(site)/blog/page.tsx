import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import posts from '@/data/posts.json';

export const metadata: Metadata = { title: 'Blog' };

export default function BlogIndexPage() {
  return (
    <>
      <PageHead
        eyebrow="Blog"
        title="Notes on automating e-commerce"
        lede="What we learn building these systems, written up for the people running the stores."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Blog' }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="index-grid">
            {posts.map((post, i) => (
              <Reveal as="article" key={post.slug} delay={i * 0.06}>
                <Link href={`/blog/${post.slug}`} className="index-card post-card h-full">
                  <p className="post-meta">{post.tag} · {post.readingTime}</p>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <span className="index-more">Read post <Icon name="arrow" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
