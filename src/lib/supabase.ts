import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True once both public env vars are present in .env.local. */
export const supabaseConfigured = Boolean(url && anonKey && !url.includes('your-project'));

/**
 * Browser/anon client. Returns null when Supabase is not configured, so every
 * caller has to handle the offline case — that is what keeps the site running
 * from the bundled seed data out of the box.
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  return createClient(url!, anonKey!, { auth: { persistSession: false } });
}

/** Server-side client with the service role key, for writes (contact form). */
export function getServiceSupabase(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || serviceKey.includes('your-service')) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
