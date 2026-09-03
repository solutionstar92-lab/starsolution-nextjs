'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface AuthState {
  error?: string;
}

/**
 * Signs an admin in.
 *
 * Membership is not checked here — the dashboard layout does that and sends a
 * signed-in non-admin to /admin/login?denied=1. Keeping the two apart means a
 * wrong password and a valid account without access give different, honest
 * messages.
 */
export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/admin');

  if (!email || !password) return { error: 'Enter your email and password.' };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Deliberately vague: distinguishing "no such user" from "wrong password"
  // tells an attacker which emails are real.
  if (error) return { error: 'Those details did not match. Please try again.' };

  // Only ever bounce back into our own admin area.
  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
