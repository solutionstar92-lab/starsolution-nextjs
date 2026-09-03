import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const LOGIN = '/admin/login';

/**
 * Refreshes the Supabase auth cookie and keeps anonymous visitors out of
 * /admin.
 *
 * This is a routing concern, not the security boundary: it only checks that
 * somebody is signed in. Admin membership is verified again in the dashboard
 * layout and in every server action, and RLS is the final gate — see
 * is_admin() in supabase/admin.sql.
 *
 * The subtle part is cookie handling. Supabase *rotates* the refresh token
 * whenever it renews a session, so if a response drops the cookies it just
 * issued, the token the browser keeps sending is already spent. Every
 * subsequent request then fails to refresh and the user is bounced to the
 * login page — which is exactly what happens if you build a redirect with a
 * fresh NextResponse and forget to copy the cookies onto it. Writes are
 * therefore collected and replayed onto whichever response is returned.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /* Without credentials nobody can be authenticated, so the panel stays shut.
     The login page renders its own explanation. */
  if (!url || !key) {
    if (isLogin) return NextResponse.next({ request: { headers: request.headers } });
    const to = request.nextUrl.clone();
    to.pathname = LOGIN;
    to.search = '';
    return NextResponse.redirect(to);
  }

  const pending: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Mutating the request makes the new value visible to the server
        // components rendered by this same request.
        request.cookies.set({ name, value, ...options });
        pending.push({ name, value, options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        pending.push({ name, value: '', options });
      },
    },
  });

  // getUser() validates the token with Supabase and renews it when needed.
  // getSession() only decodes the cookie, which a client could forge.
  const { data: { user } } = await supabase.auth.getUser();

  /** Replays any renewed cookies onto the response we actually return. */
  const withSession = (response: NextResponse) => {
    for (const c of pending) response.cookies.set({ name: c.name, value: c.value, ...c.options });
    return response;
  };

  if (!user && !isLogin) {
    const to = request.nextUrl.clone();
    to.pathname = LOGIN;
    to.search = '';
    to.searchParams.set('next', pathname);
    return withSession(NextResponse.redirect(to));
  }

  if (user && isLogin) {
    const to = request.nextUrl.clone();
    to.pathname = '/admin';
    to.search = '';
    return withSession(NextResponse.redirect(to));
  }

  // Built after getUser() so the mutated request cookies are carried through.
  return withSession(NextResponse.next({ request: { headers: request.headers } }));
}
