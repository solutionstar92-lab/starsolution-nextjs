import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead } from '@/components/PageHead';
import { Reveal } from '@/components/Reveal';
import { getDict, getPosts } from '@/lib/i18n';
import { alternates, withSeo } from '@/lib/seo';
import { JsonLd, blogPosting } from '@/lib/schema';
import { PostBody } from '@/components/PostBody';
import { Byline } from '@/components/Byline';
import { postAuthor } from '@/lib/authors';

const locale = 'en' as const;
const t = getDict(locale);
const posts = getPosts(locale);

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = posts.find((p) => p.slug === params.slug);
  return withSeo({
    alternates: alternates(locale, `/blog/${params.slug}`),
    title: post?.title ?? 'Blog',
    description: post?.excerpt,
  });
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) notFound();
  const author = await postAuthor(post, locale);

  return (
    <>
      <PageHead
        eyebrow={`${post.tag} · ${post.readingTime}`}
        title={post.title}
        byline={author ? <Byline author={author} locale={locale} updated={post.updated} /> : undefined}
        lede={post.excerpt}
        crumbs={[{ href: '/', label: 'Home' }, { href: '/blog', label: 'Blog' }, { label: post.tag }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="detail-layout">
            <div className="detail-body">
              <Reveal eager fade={false}>
                <PostBody body={post.body} locale={locale} path={`/blog/${post.slug}`} />
              </Reveal>
            </div>
            <aside className="detail-aside">
              <h2>{t('post.asideTitle')}</h2>
              <p>{t('post.asideBody')}</p>
              <Link href="/contact" className="btn btn-primary btn-lg">{t('cta.audit')}</Link>
            </aside>
          </div>
        </div>
      </section>
      <JsonLd data={blogPosting(post, locale, `/blog/${post.slug}`, author)} />
    </>
  );
}
