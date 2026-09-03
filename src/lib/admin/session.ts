import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { authLog } from '@/lib/supabase/cookies';

export interface AdminContext {
  userId: string | null;
  email: string;
  fullName: string | null;
  isAdmin: boolean;
  /** Set when the membership lookup itself failed, as opposed to coming back empty. */
  lookupError: string | null;
}

/**
 * Who is signed in, and are they an admin.
 *
 * Wrapped in React's cache() so the dashboard layout and the page rendering
 * inside it share one lookup instead of each paying for its own — every admin
 * page was otherwise repeating the layout's work on the same request.
 *
 * getSession() reads the cookie locally rather than calling out to Supabase,
 * which getUser() does on every single request. That is safe here because it
 * is not what grants access: the admins query below runs against PostgREST
 * with the session's access token, and PostgREST verifies the JWT signature,
 * so a forged cookie yields no row and is refused.
 *
 * lookupError exists because "the query failed" and "you are not an admin"
 * must not be treated alike. Collapsing them meant a dropped connection logged
 * the user out mid-session, which reads as the session being unreliable.
 */
export const getAdminContext = cache(async (): Promise<AdminContext> => {
  const started = Date.now();
  const empty = { userId: null, email: '', fullName: null, isAdmin: false, lookupError: null };

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const afterSession = Date.now();

  const user = session?.user;
  if (!user) {
    authLog('ctx', 'no session', { ms: afterSession - started });
    return empty;
  }

  const { data: admin, error } = await supabase
    .from('admins')
    .select('user_id, full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  authLog('ctx', 'resolved', {
    user: user.email ?? user.id,
    isAdmin: Boolean(admin),
    sessionMs: afterSession - started,
    adminQueryMs: Date.now() - afterSession,
    ...(error ? { error: error.message } : {}),
  });

  return {
    userId: user.id,
    email: user.email ?? '',
    fullName: admin?.full_name ?? null,
    isAdmin: Boolean(admin),
    lookupError: error ? error.message : null,
  };
});
