import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client for server components, route handlers and server actions.
 *
 * Reads the session from the request cookies, so `auth.getUser()` reflects the
 * signed-in admin and every query runs under that user's RLS policies. This is
 * deliberately *not* the service role client in `lib/supabase.ts` — the
 * dashboard must be bound by the same policies as everyone else, so a bug
 * cannot leak rows the signed-in user is not entitled to.
 *
 * Called synchronously (`const supabase = createClient()`), matching Next 14's
 * synchronous `cookies()`.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        /* A server component cannot set cookies, and Next throws if you try.
           Session refresh happens in middleware, which can, so swallowing the
           error here is safe rather than merely convenient. */
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            /* read-only context */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            /* read-only context */
          }
        },
      },
    },
  );
}
