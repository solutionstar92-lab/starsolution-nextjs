import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import './design-system.css';
import './next-additions.css';

/** The logo face. Exposed as a CSS variable so Tailwind's `font-jakarta`
 *  can reach it from any component. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

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
    // suppressHydrationWarning covers this one element, one level deep: the
    // pre-paint script below sets --splash on <html>, so the DOM React hydrates
    // carries an attribute the server never rendered. This is the documented
    // escape hatch for that, and the same one theme scripts use.
    <html lang="en" className={`js ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs before first paint: sets --splash on <html> when the splash has
            already been shown this session, so the CSS can hide it with no flash.
            A custom property rather than a class on purpose — className on <html>
            is rendered by the layout and hydrated against, so adding to it here
            made the client and server disagree and React logged a mismatch on
            every load after the first.
            Kept to one try/catch — sessionStorage throws, not returns null, in
            some privacy modes, and an exception here would block the parser. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(sessionStorage.getItem('ss-splash-seen'))document.documentElement.style.setProperty('--splash','none')}catch(e){}",
          }}
        />
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
