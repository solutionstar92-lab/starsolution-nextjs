import type { Metadata } from 'next';
import './globals.css';
import './design-system.css';
import './next-additions.css';

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

/**
 * The document, and nothing else.
 *
 * The public header, footer, sticky bar and route cross-fade used to live here,
 * which meant /admin inherited all of them: the marketing navbar rendered over
 * the dashboard, and — less obviously — PageTransition wrapped every page in a
 * transformed motion.div. A transform establishes a containing block for
 * position:fixed and a new stacking context, so the admin sidebar was being
 * positioned against that wrapper rather than the viewport, which is what
 * pushed the layout sideways and clipped both edges.
 *
 * The chrome now belongs to the (site) group, so it applies to the public
 * pages and to nothing else.
 */
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
      <body className="bg-white font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
