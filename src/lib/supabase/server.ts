import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { authLog, devSafeCookieOptions } from './cookies';

/**
 * Supabase client for server components, route handlers and server actions.
 *
 * Reads the session from the request cookies, so auth.getUser() reflects the
 * signed-in admin and every query runs under that user's RLS policies. This is
 * deliberately not the service role client in lib/supabase.ts — the dashboard
 * must be bound by the same policies as everyone else, so a bug cannot leak
 * rows the signed-in user is not entitled to.
 *
 * Uses getAll/setAll rather than the legacy per-cookie interface: an auth
 * token over 3180 bytes is split across sb-<ref>-auth-token.0, .1 and the
 * library can only reassemble the chunks when it is handed the whole jar.
 *
 * Called synchronously, matching Next 14's synchronous cookies().
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set({ name, value, ...devSafeCookieOptions(options ?? {}) });
            }
          } catch {
            /* A server component cannot set cookies and Next throws if you
               try. Session renewal happens in middleware and in server
               actions, both of which can, so this is safe to ignore rather
               than merely convenient — but log it, because a *server action*
               landing here would mean a sign-in that never persisted. */
            authLog('server', 'cookie write refused (read-only render context)');
          }
        },
      },
    },
  );
}
