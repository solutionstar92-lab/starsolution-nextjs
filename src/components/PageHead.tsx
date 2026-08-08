import Link from 'next/link';
import { Reveal } from './Reveal';

export function PageHead({
  eyebrow, title, lede, crumbs,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  crumbs?: { href?: string; label: string }[];
}) {
  return (
    <header className="page-head">
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
      <div className="page-head-inner">
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
        <Reveal>
          {eyebrow && <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> {eyebrow}</p>}
          <h1 className="page-title">{title}</h1>
          {lede && <p className="page-lede">{lede}</p>}
        </Reveal>
      </div>
    </header>
  );
}
