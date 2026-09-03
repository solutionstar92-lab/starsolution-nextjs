'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { signOut } from './auth-actions';

const NAV = [
  { group: 'Overview', items: [{ href: '/admin', label: 'Dashboard', icon: 'chart' }] },
  { group: 'Enquiries', items: [{ href: '/admin/leads', label: 'Leads', icon: 'mail' }] },
];

function initialsOf(name: string, email: string) {
  const source = name.trim() || email.split('@')[0] || '?';
  const parts = source.split(/[\s._-]+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

/**
 * Dashboard navigation. Off-canvas below 1024px, sticky above it — the CSS
 * handles the switch, this only tracks the open state and closes on navigation.
 */
export function Sidebar({ email, fullName }: { email: string; fullName?: string | null }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // A tap on a link would otherwise leave the drawer covering the page it
  // just opened.
  React.useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="admin-burger"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" />
      </button>

      {open && <div className="admin-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside className={`admin-sidebar${open ? ' is-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="brand-word">StarSolution</span>
          <span className="admin-chip">Admin</span>
        </div>

        <nav className="admin-nav" aria-label="Dashboard">
          {NAV.map((section) => (
            <div className="admin-nav-group" key={section.group}>
              <p className="admin-nav-label">{section.group}</p>
              {section.items.map((item) => {
                // /admin must not stay lit on /admin/leads.
                const active = item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={active ? 'is-active' : undefined}>
                    <Icon name={item.icon} /> {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <Link href="/" className="admin-view-site" target="_blank" rel="noopener noreferrer">
            <Icon name="link" /> View site
          </Link>

          <div className="admin-user">
            <span className="avatar" style={{ ['--a1' as string]: '#3B82F6' }}>
              {initialsOf(fullName ?? '', email)}
            </span>
            <div className="admin-user-meta">
              <strong>{fullName || 'Admin'}</strong>
              <span>{email}</span>
            </div>
          </div>

          <form action={signOut}>
            <button type="submit" className="admin-signout">
              <Icon name="left" /> Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
