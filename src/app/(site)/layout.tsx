import type { Metadata } from 'next';
import { LocaleDocument } from '@/components/LocaleDocument';
import { organization, website } from '@/lib/schema';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { StickyBar } from '@/components/StickyBar';
import { PageTransition } from '@/components/PageTransition';
import { ScrollQuiet } from '@/components/ScrollQuiet';
import { site } from '@/lib/content';
import { buildSearchIndex } from '@/components/ui/search-index';
import { SiteSplash } from '@/components/ui/SiteSplash';
import { MetaPixel } from '@/components/MetaPixel';
import { WebMcp } from '@/components/WebMcp';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.starsolution.ai'),
  title: {
    default: 'StarSolution.ai — More orders. More revenue. Less work.',
    template: '%s · StarSolution.ai',
  },
  description:
    'We automate your Shopify, social media and marketing — so your business grows while you sleep. AI automation for e-commerce brands in Egypt and the region.',
  openGraph: {
    title: 'StarSolution.ai — More orders. More revenue. Less work.',
    description: 'AI automation for e-commerce brands.',
    type: 'website',
    locale: 'en_US',
  },
};

/**
 * The English site — and, since the Arabic group owns its own `<html>`, a root
 * layout rather than a nested one.
 *
 * This is where the chrome lives: header, footer, sticky CTA and the route
 * cross-fade. It used to sit under a shared root that /admin also inherited,
 * so the marketing navbar rendered over the dashboard and PageTransition
 * wrapped every page in a transformed motion.div — a transform establishes a
 * containing block for position:fixed, which is what pushed the admin sidebar
 * off its own layout. /admin now has a root layout of its own and still gets
 * none of this.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Built here rather than in the header so the header stays a client
  // component and the getters stay on the server.
  const searchDocs = await buildSearchIndex();
  return (
    <LocaleDocument locale="en" jsonLd={[organization('en'), website('en')]}>
      {/* First in the tree so it paints with the first frame. /admin is a
          different layout and never gets it. */}
      <SiteSplash />
      {/* Meta Pixel — public pages only, so /admin is never tracked. */}
      <MetaPixel />
      {/* WebMCP tools for in-browser AI agents. */}
      <WebMcp />
      <a href="#main" className="skip-link">Skip to content</a>
      <SiteHeader locale="en" whatsapp={site.contact.whatsapp} searchDocs={searchDocs} />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <ScrollQuiet />
      <SiteFooter locale="en" />
      <StickyBar locale="en" whatsapp={site.contact.whatsapp} />
    </LocaleDocument>
  );
}
