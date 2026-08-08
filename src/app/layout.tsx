import type { Metadata } from 'next';
import './globals.css';
import './design-system.css';
import './next-additions.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { StickyBar } from '@/components/StickyBar';
import { PageTransition } from '@/components/PageTransition';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.starsolution.ai'),
  title: {
    default: 'StarSolution.ai — More orders. More revenue. Less work.',
    template: '%s · StarSolution.ai',
  },
  description:
    'We automate your Shopify, social media and marketing — so your business grows while you sleep. AI automation for e-commerce brands in USA & UAE.',
  openGraph: {
    title: 'StarSolution.ai — More orders. More revenue. Less work.',
    description: 'AI automation for e-commerce brands.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="js">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700&f[]=satoshi@400,500,700&f[]=jetbrains-mono@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white font-sans text-ink antialiased">
        <a href="#main" className="skip-link">Skip to content</a>
        <SiteHeader />
        <main id="main">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <StickyBar />
      </body>
    </html>
  );
}
