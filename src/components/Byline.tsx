import Link from 'next/link';
import type { Author } from '@/lib/authors';
import { cairoIso, formatDate } from '@/lib/dates';
import { getDict, type Locale } from '@/lib/i18n';

/**
 * "By <name>" under a post title, linking to the author's team page.
 *
 * Shows the team member's photo when their entry has one, otherwise the same
 * initials badge the team cards use. Both are a fixed 30px, so nothing moves
 * when the page loads.
 */
export function Byline({ author, locale, updated }: {
  author: Author;
  locale: Locale;
  /** "YYYY-MM-DD": shown as "Updated Nov 8, 2026" at the end of the line. */
  updated?: string;
}) {
  const t = getDict(locale);
  return (
    <p className="post-byline">
      <Link href={author.href} className="post-byline-link">
        {author.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.image} alt="" width={30} height={30} className="post-byline-photo" />
        ) : (
          <span className="avatar post-byline-avatar" style={{ ['--a1' as string]: author.tone ?? 'var(--brand)' }} aria-hidden="true">
            {author.initials}
          </span>
        )}
        <span>
          {t('post.by')} <strong>{author.name}</strong>
        </span>
      </Link>
      {author.role && <span className="post-byline-role">{author.role}</span>}
      {updated && (
        <span className="post-byline-updated">
          {t('post.updated')} <time dateTime={cairoIso(updated)}>{formatDate(updated, locale)}</time>
        </span>
      )}
    </p>
  );
}
