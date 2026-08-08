import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * Audit request endpoint.
 *
 * Writes to the `leads` table when a service role key is present. Without one it
 * logs the submission and reports success, so the form is testable before
 * Supabase is wired up.
 */
export async function POST(request: Request) {
  let payload: Record<string, string>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = (payload.name ?? '').trim();
  const email = (payload.email ?? '').trim();

  if (name.length < 2) return NextResponse.json({ error: 'Enter your full name.' }, { status: 422 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 422 });
  }

  const lead = {
    name,
    email,
    phone: (payload.phone ?? '').trim() || null,
    company: (payload.company ?? '').trim() || null,
    message: (payload.message ?? '').trim() || null,
  };

  const db = getServiceSupabase();
  if (!db) {
    console.info('[leads] Supabase not configured — submission logged only:', lead);
    return NextResponse.json({
      message: 'Thanks — your request is in. (Running without Supabase, so it was logged to the server console.)',
      stored: false,
    });
  }

  const { error } = await db.from('leads').insert(lead);
  if (error) {
    console.error('[leads] insert failed:', error.message);
    return NextResponse.json({ error: 'Could not save your request. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Thanks — we will reply within one business day.', stored: true });
}
