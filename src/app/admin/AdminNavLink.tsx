'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';

/**
 * A sidebar link that acknowledges the click immediately.
 *
 * Every admin route is force-dynamic, so a navigation waits on the server
 * before anything can change. Plain <Link> leaves the old item highlighted for
 * the whole trip, which reads as the click not registering. useTransition marks
 * the target as pending the moment it is clicked, and React keeps the current
 * page interactive while the next one loads instead of blocking on it.
 *
 * Still a real anchor, so middle-click, ctrl-click and "open in new tab" behave
 * the way they should.
 */
export function AdminNavLink({
  href, label, icon, active, onNavigate,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Leave the browser to handle anything that is not a plain left click.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate?.();
    startTransition(() => router.push(href));
  };

  return (
    <a
      href={href}
      onClick={go}
      aria-current={active ? 'page' : undefined}
      className={`${active ? 'is-active' : ''}${pending ? ' is-pending' : ''}`.trim() || undefined}
    >
      <Icon name={icon} />
      <span>{label}</span>
      {pending && <span className="admin-nav-spin" aria-hidden="true" />}
    </a>
  );
}
