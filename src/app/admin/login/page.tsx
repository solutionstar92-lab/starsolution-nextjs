import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseConfigured } from '@/lib/supabase';
import { LoginForm } from './LoginForm';
import { LogoAnimated } from '@/components/ui/LogoAnimated';

export const metadata: Metadata = { title: 'Sign in' };

/* The form posts a server action that sets a session cookie, so this page must
   never be cached. */
export const dynamic = 'force-dynamic';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; denied?: string };
}) {
  // Only ever hand an in-app path to the redirect, never an absolute URL.
  const raw = searchParams.next ?? '/admin';
  const next = raw.startsWith('/admin') ? raw : '/admin';

  return (
    <main className="admin-auth">
      <div className="admin-auth-card">
        {/* The one screen on the site with nothing else happening on it, and
            the one people stare at while typing a password. */}
        <LogoAnimated size={46} layout="stacked" className="admin-auth-logo" />
        <h1>Admin sign in</h1>
        <p className="admin-auth-lede">Manage leads and site content.</p>

        {!supabaseConfigured && (
          <p className="admin-alert is-warn">
            Supabase is not configured, so sign-in is unavailable. Set
            <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </p>
        )}

        {searchParams.denied && (
          <p className="admin-alert is-error">
            That account is signed in but is not an admin. Ask an owner to add you to
            the <code>admins</code> table.
          </p>
        )}

        <LoginForm next={next} />

        <Link href="/" className="admin-auth-back">Back to the site</Link>
      </div>
    </main>
  );
}
