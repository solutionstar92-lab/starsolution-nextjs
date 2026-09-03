'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

import { LEAD_STATUSES, STATUS_LABEL, type ActionState, type LeadStatus } from './constants';

/**
 * Every write re-checks admin membership.
 *
 * RLS would reject an outsider anyway, but failing here gives a clear message
 * instead of a silent no-op, and keeps the check next to the code it guards.
 */
async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: 'Your session has expired. Sign in again.' };

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) return { supabase, error: 'You do not have permission to do that.' };
  return { supabase, userId: user.id };
}

export async function updateLeadStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '') as LeadStatus;

  if (!id) return { error: 'Missing lead.' };
  if (!LEAD_STATUSES.includes(status)) return { error: 'Unknown status.' };

  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.from('leads').update({ status }).eq('id', id);
  if (error) return { error: 'Could not update the status. Please try again.' };

  revalidatePath('/admin/leads');
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath('/admin');
  return { ok: `Status set to ${STATUS_LABEL[status]}.` };
}

export async function addLeadNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const leadId = String(formData.get('lead_id') ?? '');
  const body = String(formData.get('body') ?? '').trim();

  if (!leadId) return { error: 'Missing lead.' };
  if (!body) return { error: 'Write something before saving.' };
  if (body.length > 4000) return { error: 'That note is too long (4000 characters max).' };

  const { supabase, userId, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.from('lead_notes').insert({
    lead_id: leadId,
    author_id: userId,
    body,
  });
  if (error) return { error: 'Could not save the note. Please try again.' };

  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: 'Note added.' };
}

export async function deleteLeadNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const noteId = String(formData.get('note_id') ?? '');
  const leadId = String(formData.get('lead_id') ?? '');
  if (!noteId) return { error: 'Missing note.' };

  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.from('lead_notes').delete().eq('id', noteId);
  if (error) return { error: 'Could not delete that note.' };

  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: 'Note deleted.' };
}

export async function deleteLead(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const { supabase, error } = await requireAdmin();
  if (error) return;

  await supabase.from('leads').delete().eq('id', id);
  revalidatePath('/admin/leads');
  revalidatePath('/admin');
}
