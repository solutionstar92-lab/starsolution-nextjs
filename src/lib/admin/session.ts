import { cache } from 'react';
import { authLog } from '@/lib/supabase/cookies';
import { createRscClient, rscIdentity } from '@/lib/supabase/rsc';

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
 * The identity comes from headers middleware set on this request, so the
 * render makes no auth call at all — no getSession(), no getUser(), and
 * therefore no chance of rotating a refresh token it cannot persist, which is
 * what was ending sessions on reload.
 *
 * Only one network call remains: the admins lookup, which is also the thing
 * that actually authorises. It runs against PostgREST with the access token,
 * and PostgREST verifies the JWT signature, so a forged token yields no row.
 *
 * cache() keeps the layout and the page rendering inside it to a single
 * lookup rather than one each.
 *
 * lookupError exists because "the query failed" and "you are not an admin"
 * must not be treated alike. Collapsing them meant a dropped connection
 * logged the user out mid-session.
 */
export const getAdminContext = cache(async (): Promise<AdminContext> => {
  const started = Date.now();
  const { userId, email, token } = rscIdentity();

  if (!userId || !token) {
    authLog('ctx', 'no identity headers', { userId: userId ?? '-', hasToken: Boolean(token) });
    return { userId: null, email: '', fullName: null, isAdmin: false, lookupError: null };
  }

  const supabase = createRscClient(token);
  const { data: admin, error } = await supabase
    .from('admins')
    .select('user_id, full_name')
    .eq('user_id', userId)
    .maybeSingle();

  authLog('ctx', 'resolved', {
    user: email || userId,
    isAdmin: Boolean(admin),
    adminQueryMs: Date.now() - started,
    ...(error ? { error: error.message } : {}),
  });

  return {
    userId,
    email,
    fullName: admin?.full_name ?? null,
    isAdmin: Boolean(admin),
    lookupError: error ? error.message : null,
  };
});

/** Supabase client for a server component, scoped to the signed-in admin. */
export function rscSupabase() {
  return createRscClient(rscIdentity().token);
}
