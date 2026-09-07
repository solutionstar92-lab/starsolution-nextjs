import Link from 'next/link';
import { Icon } from './Icon';
import { Reveal } from './Reveal';

export function PageHead({
  eyebrow, title, lede, crumbs, icon, tone, aside,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  crumbs?: { href?: string; label: string }[];
  /** Draws the entry's own mark above the title, so a detail page opens with the
   *  same icon and colour as the card that was clicked to reach it. */
  icon?: string;
  tone?: string;
  /** Sits beside the title on a desktop and under the lede on a phone. The
   *  detail pages put their spec panel here: the head was half a screen of
   *  empty space to the right of the words, and the panel it holds is content
   *  the body no longer has to carry. */
  aside?: React.ReactNode;
}) {
  return (
    <header
      className={`page-head${tone ? ' has-tone' : ''}`}
      style={tone ? ({ ['--tone' as string]: tone }) : undefined}
    >
      <div className="starfield starfield-dim" aria-hidden="true">
        {Array.from({ length: 22 }, (_, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${((i * 43.3) % 100).toFixed(2)}%`,
              top: `${((i * 29.7) % 100).toFixed(2)}%`,
              width: '2px', height: '2px',
              ['--o' as string]: '0.3',
              ['--tw' as string]: `${(4 + (i % 5)).toFixed(1)}s`,
            }}
          />
        ))}
      </div>
      <div className={`page-head-inner${aside ? ' has-aside' : ''}`}>
        {crumbs && (
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={c.label} className="contents">
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
                {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
              </span>
            ))}
          </nav>
        )}
        <Reveal className="page-head-copy">
          {icon && <span className="head-mark" aria-hidden="true"><Icon name={icon} /></span>}
          {eyebrow && <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> {eyebrow}</p>}
          <h1 className="page-title">{title}</h1>
          {lede && <p className="page-lede">{lede}</p>}
        </Reveal>
        {aside && <Reveal className="page-head-aside" delay={0.1}>{aside}</Reveal>}
      </div>
    </header>
  );
}
