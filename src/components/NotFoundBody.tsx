import Link from 'next/link';

/**
 * The 404 body, shared by two boundaries.
 *
 * Next resolves an unmatched URL against the root not-found, and a
 * notFound() call inside the site group against that group's. Both need the
 * same page, but only the root one has to bring its own chrome, since the
 * (site) layout already supplies it.
 */
export function NotFoundBody() {
  return (
    <section className="section">
      <div className="empty-state">
        <p className="eyebrow justify-center"><span className="eyebrow-dot" aria-hidden="true" /> 404</p>
        <h1>That page is off the map</h1>
        <p>The link may be old, or the page may have moved.</p>
        <Link href="/" className="btn btn-primary btn-lg mt-6">Back to home</Link>
      </div>
    </section>
  );
}
