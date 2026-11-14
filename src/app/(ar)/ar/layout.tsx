import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import '@/app/rtl.css';
import { LocaleDocument } from '@/components/LocaleDocument';
import { organization, website } from '@/lib/schema';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { StickyBar } from '@/components/StickyBar';
import { PageTransition } from '@/components/PageTransition';
import { ScrollQuiet } from '@/components/ScrollQuiet';
import { SiteSplash } from '@/components/ui/SiteSplash';
import { MetaPixel } from '@/components/MetaPixel';
import { WebMcp } from '@/components/WebMcp';
import { buildSearchIndex } from '@/components/ui/search-index';
import { getContent, getDict } from '@/lib/i18n';

const t = getDict('ar');

/** Same family and weights as the Google Fonts link it replaces, now
 *  self-hosted and preloaded. rtl.css uses it through --font-plex-ar. */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-ar',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.starsolution.ai'),
  title: {
    default: 'ستار سوليوشن — طلبات أكثر. إيرادات أكبر. جهد أقل.',
    template: '%s · ستار سوليوشن',
  },
  description:
    'نجعل متجرك على شوبيفاي وصفحاتك على السوشيال ميديا وإعلاناتك تعمل وحدها — لينمو عملك وأنت نائم.',
  openGraph: {
    title: 'ستار سوليوشن — طلبات أكثر. إيرادات أكبر. جهد أقل.',
    description: 'أتمتة بالذكاء الاصطناعي للمتاجر الإلكترونية.',
    type: 'website',
    locale: 'ar_EG',
  },
};

/**
 * The Arabic site. A root layout, not a nested one: `dir="rtl"` belongs on
 * `<html>`, and the only ways to vary that from a shared root are to read the
 * request — which makes every page dynamic — or to set it from script after
 * hydration, which is a flash of the wrong direction and a mismatch warning.
 *
 * rtl.css is imported here and nowhere else. Every rule in it is scoped to
 * [dir='rtl'], so it would be inert on English pages, but it would still be
 * bytes they download.
 */
export default async function ArabicLayout({ children }: { children: React.ReactNode }) {
  const searchDocs = await buildSearchIndex('ar');
  const c = getContent('ar');
  return (
    <LocaleDocument locale="ar" fontClass={plexArabic.variable} jsonLd={[organization('ar'), website('ar')]}>
      <SiteSplash />
      {/* Meta Pixel — public pages only, so /admin is never tracked. */}
      <MetaPixel />
      {/* WebMCP tools for in-browser AI agents. */}
      <WebMcp />
      <a href="#main" className="skip-link">{t('a11y.skip')}</a>
      <SiteHeader locale="ar" whatsapp={c.contact.whatsapp} searchDocs={searchDocs} />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <ScrollQuiet />
      <SiteFooter locale="ar" />
      <StickyBar locale="ar" whatsapp={c.contact.whatsapp} />
    </LocaleDocument>
  );
}
