'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';
import { Icon } from './Icon';

const NAV = [
  { href: '/solutions', label: 'Solutions' },
  { href: '/results', label: 'Results' },
  { href: '/process', label: 'How it works' },
  { href: '/work', label: 'Our work' },
  { href: '/case-studies', label: 'Case studies' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [stuck, setStuck] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => { setOpen(false); }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div className="promo-bar" role="region" aria-label="Current offer">
        <div className="promo-shell">
          <span className="promo-dot" aria-hidden="true" />
          <p>15% off with code <strong className="font-mono font-medium tracking-tight">STAR15</strong></p>
        </div>
      </div>

      <header id="siteHeader" className={`site-header${stuck ? ' is-stuck' : ''}`}>
        <div className="header-shell">
          <Link href="/" className="brand" aria-label="StarSolution.ai home">
            <span className="brand-mark"><Icon name="star" className="h-[18px] w-[18px]" /></span>
            <span className="brand-word">StarSolution<span className="text-brand">.ai</span></span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname.startsWith(item.href) ? 'is-active' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/contact" className="btn btn-primary btn-sm header-cta">
              Get free audit <Icon name="arrow" className="cta-arrow" />
            </Link>
            <button
              type="button"
              id="navToggle"
              className="nav-toggle lg:hidden"
              aria-expanded={open}
              aria-controls="mobileNav"
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobileNav"
            className="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              className="mobile-nav-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: [0.22, 0.75, 0.24, 1] }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <span className="brand-word text-[17px]">StarSolution<span className="text-brand">.ai</span></span>
                <button type="button" className="nav-toggle" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <Icon name="close" className="h-6 w-6" />
                </button>
              </div>

              <nav className="mobile-links" aria-label="Mobile">
                {NAV.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label} <Icon name="arrow" />
                  </Link>
                ))}
                <Link href="/team">Team <Icon name="arrow" /></Link>
                <Link href="/contact">Contact <Icon name="arrow" /></Link>
              </nav>

              <div className="mt-auto grid gap-3 px-5 pb-8">
                <Link href="/contact" className="btn btn-primary btn-lg w-full">Get free audit</Link>
                <a href="https://wa.me/+201234567890" className="btn btn-ghost btn-lg w-full">
                  <Icon name="whatsapp" className="h-5 w-5 text-[#25D366]" /> WhatsApp us
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
