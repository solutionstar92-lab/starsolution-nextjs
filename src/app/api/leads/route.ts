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
  const phone = (payload.phone ?? '').trim();
  // The AI-agent popup in the header asks for a name and a number and nothing
  // else, deliberately — it interrupts, so it asks for the least that still
  // lets someone be called back.
  const fromAgent = payload.source === 'agent';

  if (name.length < 2) return NextResponse.json({ error: 'Enter your full name.' }, { status: 422 });

  // What a lead actually has to have is a way to reach them. The contact form
  // still requires an email because it asks for one; the callback requires a
  // number. Neither is allowed to arrive with no route back at all.
  const phoneDigits = phone.replace(/[^\d]/g, '');
  if (fromAgent) {
    if (phoneDigits.length < 7) {
      return NextResponse.json({ error: 'Enter a phone number we can call.' }, { status: 422 });
    }
  } else {
    // The audit form asks for both, so it has to check both — a client-side
    // rule is a courtesy to whoever is typing, not a guarantee about what
    // arrives here.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 422 });
    }
    if (phoneDigits.length < 7) {
      return NextResponse.json({ error: 'Enter a phone number we can reach you on.' }, { status: 422 });
    }
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 422 });
  }

  const note = (payload.message ?? '').trim();
  const lead = {
    name,
    email: email || null,
    phone: phone || null,
    company: (payload.company ?? '').trim() || null,
    // Tagged so it is obvious in /admin/leads where it came from and why there
    // is no email address on it.
    message: fromAgent
      ? [note, 'Callback requested from the AI agent widget.'].filter(Boolean).join('\n\n')
      : note || null,
  };

  const db = getServiceSupabase();
  if (!db) {
    console.info('[leads] Supabase not configured — submission logged only:', lead);
    return NextResponse.json({
      message: 'Thanks — your request is in. (Running without Supabase, so it was logged to the server console.)',
      stored: false,
    });
  }

  let { error } = await db.from('leads').insert(lead);

  // 23502 is not_null_violation: supabase/migrations/0002 has not been run yet,
  // so email is still NOT NULL and a callback lead has none. Losing a real
  // enquiry over a pending migration is not an acceptable failure, and '' reads
  // as "no address" everywhere in the admin, exactly as null does.
  if (error?.code === '23502' && lead.email === null) {
    console.warn('[leads] email is still NOT NULL — run supabase/migrations/0002_leads_email_nullable.sql');
    ({ error } = await db.from('leads').insert({ ...lead, email: '' }));
  }

  if (error) {
    console.error('[leads] insert failed:', error.message);
    return NextResponse.json({ error: 'Could not save your request. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({
    message: fromAgent
      ? 'Got it — our agent will call you back, usually the same day.'
      : 'Thanks — we will reply within one business day.',
    stored: true,
  });
}
