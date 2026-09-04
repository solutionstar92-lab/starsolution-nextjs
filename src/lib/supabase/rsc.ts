import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

/** Header names middleware uses to hand the verified identity to the render. */
export const ID_HEADERS = {
  token: 'x-sb-access-token',
  userId: 'x-sb-user-id',
  email: 'x-sb-email',
} as const;

export interface RscIdentity {
  userId: string | null;
  email: string;
  token: string | null;
}

/**
 * Reads the identity middleware attached to this request.
 *
 * Middleware strips any inbound x-sb-* headers before setting its own, so a
 * client cannot supply these. They are only ever written after getSession()
 * has produced a session on the server.
 */
export function rscIdentity(): RscIdentity {
  const h = headers();
  return {
    userId: h.get(ID_HEADERS.userId) || null,
    email: h.get(ID_HEADERS.email) || '',
    token: h.get(ID_HEADERS.token) || null,
  };
}

/**
 * Supabase client for server components.
 *
 * Deliberately not the cookie-backed @supabase/ssr client. That one manages a
 * session, and auth-js refreshes an expired token inside getSession() without
 * consulting autoRefreshToken — see __loadSession(). A server component cannot
 * write cookies, so the rotated refresh token was discarded while Supabase had
 * already invalidated the previous one, killing the session on the next
 * request. That is the bug behind "reloading makes me log in again".
 *
 * So the render gets a stateless client instead: the access token middleware
 * already refreshed, passed straight through as an Authorization header. It
 * has no storage, manages no session and cannot rotate anything. Queries still
 * run under that user's RLS policies, because PostgREST verifies the JWT.
 *
 * Middleware and server actions remain the only places a token is renewed, and
 * both can persist the result.
 */
export function createRscClient(token: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  });
}
