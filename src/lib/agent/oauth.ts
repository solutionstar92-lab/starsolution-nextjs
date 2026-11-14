/**
 * OAuth discovery for the one protected endpoint (/api/v1/leads).
 *
 * The authorization server is the project's own Supabase Auth, acting as an
 * OAuth 2.1 / OIDC provider. This site does not invent that metadata — it
 * relays what Supabase publishes. If the OAuth 2.1 server is not switched on
 * in Supabase (Authentication → OAuth Server), Supabase's document lacks an
 * authorization endpoint and these routes answer 404 rather than advertise a
 * login that does not exist.
 */
export const supabaseIssuer = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('your-project') ? `${url.replace(/\/$/, '')}/auth/v1` : null;
};

const REQUIRED = ['issuer', 'authorization_endpoint', 'token_endpoint', 'jwks_uri', 'response_types_supported'];

export async function relayMetadata(kind: 'openid' | 'oauth') {
  const issuer = supabaseIssuer();
  if (!issuer) return null;
  const base = issuer.replace(/\/auth\/v1$/, '');
  const src = kind === 'openid'
    ? `${issuer}/.well-known/openid-configuration`
    : `${base}/.well-known/oauth-authorization-server/auth/v1`;
  try {
    const res = await fetch(src, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const meta = (await res.json()) as Record<string, unknown>;
    if (!REQUIRED.every((k) => meta[k])) return null;
    return {
      grant_types_supported: ['authorization_code', 'refresh_token'],
      ...meta,
    };
  } catch {
    return null;
  }
}
