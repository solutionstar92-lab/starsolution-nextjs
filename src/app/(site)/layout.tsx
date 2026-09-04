import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { StickyBar } from '@/components/StickyBar';
import { PageTransition } from '@/components/PageTransition';
import { site } from '@/lib/content';
import { SiteSplash } from '@/components/ui/SiteSplash';

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
      {/* First in the tree so it paints with the first frame. /admin is a
          different layout and never gets it. */}
      <SiteSplash />
      <a href="#main" className="skip-link">Skip to content</a>
      <SiteHeader whatsapp={site.contact.whatsapp} />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <StickyBar whatsapp={site.contact.whatsapp} />
    </>
  );
}
