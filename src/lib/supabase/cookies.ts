import type { CookieOptions } from '@supabase/ssr';

/**
 * Cookie options, adjusted for where the site is actually running.
 *
 * Supabase asks for `secure: true`, which is right in production and wrong on
 * plain http in development: a browser refuses to store a Secure cookie sent
 * over http from anything it does not treat as a trustworthy origin, and the
 * session silently fails to stick. Localhost is usually exempt, but a LAN
 * address (192.168.x.x, a phone testing against the dev server) is not, and
 * that is where it bites.
 *
 * SameSite stays 'lax', which is what auth cookies need: 'strict' drops the
 * cookie on a cross-site return such as an OAuth callback, and 'none' without
 * Secure is rejected outright.
 */
export function devSafeCookieOptions(options: CookieOptions): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    ...options,
    sameSite: options.sameSite ?? 'lax',
    secure: isProd ? options.secure ?? true : false,
    path: options.path ?? '/',
  };
}

/** Set when ADMIN_AUTH_DEBUG=1, or automatically outside production. */
export const authDebug =
  process.env.ADMIN_AUTH_DEBUG === '1' || process.env.NODE_ENV !== 'production';

export function authLog(scope: string, message: string, extra?: Record<string, unknown>) {
  if (!authDebug) return;
  const detail = extra
    ? ' ' + Object.entries(extra).map(([k, v]) => `${k}=${String(v)}`).join(' ')
    : '';
  // eslint-disable-next-line no-console
  console.log(`[auth:${scope}] ${message}${detail}`);
}
