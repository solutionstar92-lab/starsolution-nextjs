import Link from 'next/link';

export default function NotFound() {
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
