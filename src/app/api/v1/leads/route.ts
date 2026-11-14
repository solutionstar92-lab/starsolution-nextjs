import { createClient } from '@supabase/supabase-js';
import { URLS } from '@/lib/agent/catalog';

export const dynamic = 'force-dynamic';

/**
 * The one protected API endpoint: the lead inbox, for staff.
 *
 * The bearer token is a Supabase Auth access token (from the admin login or
 * from the Supabase OAuth 2.1 server). It is passed straight to PostgREST,
 * which verifies the signature; row-level security on `leads` decides what
 * comes back. No token, no data — and the 401 points agents at the metadata
 * that explains how to get one (RFC 9728).
 */
const unauthorized = (error: string) =>
  new Response(JSON.stringify({ error }), {
    status: 401,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'www-authenticate': `Bearer resource_metadata="${URLS.prm}"`,
    },
  });

export async function GET(request: Request) {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') ?? '');
  if (!match) return unauthorized('A bearer token is required.');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return Response.json({ error: 'Not configured.' }, { status: 503 });
  }

  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${match[1]}` } },
  });
  const { data: user } = await supabase.auth.getUser(match[1]);
  if (!user?.user) return unauthorized('The token is invalid or expired.');

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return Response.json({ error: error.message }, { status: 403 });
  return Response.json({ data }, { headers: { 'cache-control': 'no-store' } });
}
