import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { NotFoundBody } from '@/components/NotFoundBody';
import { site } from '@/lib/content';
import { buildSearchIndex } from '@/components/ui/search-index';

/**
 * The boundary for a URL that matches no route at all.
 *
 * It sits above the (site) group, so it renders outside that layout and has to
 * bring the header and footer itself — a stray link should still land
 * somewhere that looks like the site.
 */
export default async function RootNotFound() {
  // A 404 is exactly where someone wants to search for what they meant.
  const searchDocs = await buildSearchIndex();
  return (
    <>
      <SiteHeader whatsapp={site.contact.whatsapp} searchDocs={searchDocs} />
      <main id="main"><NotFoundBody /></main>
      <SiteFooter />
    </>
  );
}
