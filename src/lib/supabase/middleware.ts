import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { authLog, devSafeCookieOptions } from './cookies';
import { ID_HEADERS } from './rsc';

const LOGIN = '/admin/login';

/**
 * The single place a Supabase token is renewed.
 *
 * Three things were losing the session, and all three are worth knowing.
 *
 * 1. Cookie chunking. @supabase/ssr splits an auth token over 3180 bytes
 *    across sb-<ref>-auth-token.0, .1 and so on. The legacy get/set/remove
 *    interface hands it one cookie at a time and it cannot reassemble the
 *    pieces; getAll/setAll passes the whole jar.
 *
 * 2. Rotated refresh tokens dropped on redirects. Supabase issues a new
 *    refresh token on every renewal, so a response that discards the cookies
 *    it was just handed leaves the browser replaying a spent token. Writes are
 *    collected and replayed onto whichever response is returned.
 *
 * 3. Renders rotating tokens they cannot persist. auth-js refreshes an expired
 *    token inside getSession() regardless of autoRefreshToken, and a server
 *    component cannot write cookies — so the new token was thrown away while
 *    the old one was already void. Middleware therefore hands the render a
 *    verified identity and the current access token in request headers, and
 *    server components use a stateless client that cannot renew anything.
 *
 * On speed: this is a routing gate, so it reads the session from the cookie
 * rather than calling getUser(), which is a network round trip on every
 * navigation. Authorisation still happens against PostgREST, which verifies
 * the JWT signature, with RLS as the final gate.
 */
export async function updateSession(request: NextRequest) {
  const started = Date.now();
  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN;
  const kind = request.headers.get('rsc') ? 'rsc' : 'doc';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /* Built for every response. Any inbound x-sb-* header is removed first:
     without this a client could simply send x-sb-user-id and be believed. */
  const forwarded = (token?: string, userId?: string, email?: string) => {
    const h = new Headers(request.headers);
    for (const name of Object.values(ID_HEADERS)) h.delete(name);
    if (token) h.set(ID_HEADERS.token, token);
    if (userId) h.set(ID_HEADERS.userId, userId);
    if (email) h.set(ID_HEADERS.email, email);
    return h;
  };

  if (!url || !key) {
    authLog('mw', 'supabase not configured', { path: pathname });
    if (isLogin) return NextResponse.next({ request: { headers: forwarded() } });
    const to = request.nextUrl.clone();
    to.pathname = LOGIN;
    to.search = '';
    return NextResponse.redirect(to);
  }

  const pending: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          pending.push({
            name,
            value,
            options: devSafeCookieOptions(options ?? {}) as Record<string, unknown>,
          });
        }
      },
    },
  });

  const { data: { session }, error } = await supabase.auth.getSession();
  const took = Date.now() - started;

  const jar = request.cookies.getAll().filter((c) => c.name.startsWith('sb-'));
  authLog('mw', 'request', {
    path: pathname,
    kind,
    authCookies: jar.length,
    chunked: jar.some((c) => /\.\d+$/.test(c.name)) ? 'yes' : 'no',
    session: session ? 'yes' : 'no',
    user: session?.user?.email ?? '-',
    renewed: pending.length,
    ms: took,
    ...(error ? { error: error.message } : {}),
  });

  /** Replays renewed cookies onto the response we actually return. */
  const withSession = (response: NextResponse) => {
    for (const c of pending) {
      response.cookies.set({ name: c.name, value: c.value, ...c.options });
    }
    return response;
  };

  if (!session && !isLogin) {
    authLog('mw', 'redirect -> login', {
      from: pathname, reason: 'no session cookie', kind, authCookies: jar.length,
    });
    const to = request.nextUrl.clone();
    to.pathname = LOGIN;
    to.search = '';
    to.searchParams.set('next', pathname);
    return withSession(NextResponse.redirect(to));
  }

  if (session && isLogin) {
    authLog('mw', 'redirect -> /admin', { reason: 'already signed in' });
    const to = request.nextUrl.clone();
    to.pathname = '/admin';
    to.search = '';
    return withSession(NextResponse.redirect(to));
  }

  return withSession(
    NextResponse.next({
      request: {
        headers: forwarded(
          session?.access_token,
          session?.user?.id,
          session?.user?.email ?? '',
        ),
      },
    }),
  );
}
