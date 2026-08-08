'use client';

import Link from 'next/link';
import * as React from 'react';
import { Icon } from './Icon';

export function StickyBar() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 620);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`sticky-bar${visible ? ' is-visible' : ''}`} aria-label="Quick actions">
      <Link href="/contact" className="btn btn-primary btn-lg flex-1">Get free audit</Link>
      <a href="https://wa.me/+201234567890" className="wa-btn" aria-label="Chat on WhatsApp">
        <Icon name="whatsapp" />
      </a>
    </div>
  );
}
