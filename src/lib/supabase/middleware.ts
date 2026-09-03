import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { authLog, devSafeCookieOptions } from './cookies';

const LOGIN = '/admin/login';

/**
 * Refreshes the Supabase auth cookie and keeps anonymous visitors out of
 * /admin.
 *
 * Two things here were getting the session lost, and both are worth knowing.
 *
 * 1. Cookie chunking. @supabase/ssr splits an auth token larger than 3180
 *    bytes across sb-<ref>-auth-token.0, .1 and so on. The legacy get/set/
 *    remove interface hands the library one cookie at a time and it cannot
 *    reliably reassemble the pieces; getAll/setAll passes the whole jar, which
 *    is why it is the interface the package now expects.
 *
 * 2. Rotated refresh tokens. Supabase issues a new refresh token on every
 *    renewal, so a response that drops the cookies it was just given leaves
 *    the browser replaying a spent token. Writes are collected and replayed
 *    onto whichever response is returned, redirects included.
 *
 * On speed: this is a routing gate, not the security boundary, so it reads the
 * session from the cookie rather than calling getUser(), which is a network
 * round trip to Supabase on every navigation and prefetch. getSession() still
 * renews an expired token. Authorisation happens where it counts — the admins
 * query runs against PostgREST, which verifies the JWT signature, and RLS is
 * the final gate.
 */
export async function updateSession(request: NextRequest) {
  const started = Date.now();
  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN;
  // Next asks for the RSC payload on client-side navigation; useful to see
  // which hits are real page loads and which are prefetches.
  const kind = request.headers.get('rsc') ? 'rsc' : 'doc';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    authLog('mw', 'supabase not configured', { path: pathname });
    if (isLogin) return NextResponse.next({ request: { headers: request.headers } });
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
          // Visible to the server components rendered by this same request.
          request.cookies.set(name, value);
          pending.push({ name, value, options: devSafeCookieOptions(options ?? {}) as Record<string, unknown> });
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
    authLog('mw', 'redirect -> login', { from: pathname, reason: 'no session cookie', kind });
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

  return withSession(NextResponse.next({ request: { headers: request.headers } }));
}
