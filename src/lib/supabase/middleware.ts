import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const LOGIN = '/admin/login';

/**
 * Refreshes the Supabase auth cookie and keeps anonymous visitors out of
 * /admin.
 *
 * This is a routing concern, not the security boundary: it runs at the edge and
 * only checks that *someone* is signed in. Admin membership is verified again
 * in the dashboard layout and in every server action, and RLS is the final
 * gate — see `is_admin()` in supabase/admin.sql.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === LOGIN;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /* Without credentials there is no way to authenticate anyone, so the whole
     panel has to stay shut. The login page renders its own explanation. */
  if (!url || !key) {
    if (isLogin) return NextResponse.next({ request: { headers: request.headers } });
    const to = request.nextUrl.clone();
    to.pathname = LOGIN;
    to.search = '';
    return NextResponse.redirect(to);
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // getUser() revalidates the token with Supabase; getSession() only decodes
  // the cookie, which a client could forge.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const to = request.nextUrl.clone();
    to.pathname = LOGIN;
    to.search = '';
    to.searchParams.set('next', pathname);
    return NextResponse.redirect(to);
  }

  if (user && isLogin) {
    const to = request.nextUrl.clone();
    to.pathname = '/admin';
    to.search = '';
    return NextResponse.redirect(to);
  }

  return response;
}
