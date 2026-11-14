import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Two jobs:
 *
 * 1. /admin — refreshes the Supabase auth cookie and guards the dashboard.
 *    The real logic lives in lib/supabase/middleware.ts.
 * 2. Markdown for agents — a page request with `Accept: text/markdown` is
 *    rewritten to /api/markdown, which returns the same page as Markdown.
 *    Everyone else gets the HTML exactly as before.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return updateSession(request);

  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('text/markdown') && !request.headers.get('x-md-internal')) {
    // The page path travels in a header: Next keeps the original query string
    // on a rewrite, so a ?path= parameter would not survive reliably.
    const headers = new Headers(request.headers);
    headers.set('x-md-path', pathname);
    return NextResponse.rewrite(new URL('/api/markdown', request.url), { request: { headers } });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    // Pages only: no API, Next assets, well-known files or anything with an extension.
    '/((?!api/|_next/|\\.well-known/|mcp$|a2a$|.*\\.[a-zA-Z0-9]+$).*)',
  ],
};
