import { URLS, json } from '@/lib/agent/catalog';
import { supabaseIssuer } from '@/lib/agent/oauth';
import { SITE_URL } from '@/lib/schema';

/** OAuth Protected Resource Metadata (RFC 9728) for /api/v1/leads. */
export const dynamic = 'force-static';

export function GET() {
  const issuer = supabaseIssuer();
  if (!issuer) return json({ error: 'not_found' }, { status: 404 });
  return json({
    resource: SITE_URL,
    resource_name: 'StarSolution.ai API',
    authorization_servers: [issuer],
    scopes_supported: ['openid', 'email', 'profile'],
    bearer_methods_supported: ['header'],
    resource_documentation: URLS.authMd,
  });
}
