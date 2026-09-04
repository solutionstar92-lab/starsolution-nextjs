import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { StickyBar } from '@/components/StickyBar';
import { PageTransition } from '@/components/PageTransition';

/**
 * The public site: header, footer, sticky CTA and the route cross-fade.
 *
 * Kept out of the root layout so /admin does not inherit any of it. See the
 * note there for why the transformed transition wrapper in particular was a
 * problem for the dashboard.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <SiteHeader />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <StickyBar />
    </>
  );
}
