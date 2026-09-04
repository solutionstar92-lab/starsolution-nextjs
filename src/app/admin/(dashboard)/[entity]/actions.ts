'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { entityByKey, type Entity } from '@/lib/admin/entities';
import { fromInput, slugify } from '@/lib/admin/encode';

export interface CmsState {
  error?: string;
  ok?: string;
}

/**
 * Every write re-checks admin membership.
 *
 * RLS rejects an outsider anyway, but failing here produces a message the user
 * can act on instead of a silent no-op, and keeps the check beside the code it
 * guards. Same pattern as the leads actions.
 */
async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: 'Your session has expired. Sign in again.' };

  const { data: admin } = await supabase
    .from('admins').select('user_id').eq('user_id', user.id).maybeSingle();

  if (!admin) return { supabase, error: 'You do not have permission to do that.' };
  return { supabase, userId: user.id };
}

/**
 * Refreshes the public pages this row appears on.
 *
 * The detail routes are statically generated with no `revalidate`, so without
 * this an edit would sit in the database and never reach a visitor.
 */
function refresh(entity: Entity, slug?: string | null) {
  for (const path of entity.revalidate) {
    if (path.includes(':slug')) {
      if (slug) revalidatePath(path.replace(':slug', slug));
    } else {
      revalidatePath(path);
    }
  }
  revalidatePath(`/admin/${entity.key}`);
}

/** Reads the declared fields out of the form, in the shape the columns expect. */
function collect(entity: Entity, formData: FormData) {
  const row: Record<string, unknown> = {};
  for (const field of entity.fields) {
    row[field.name] = fromInput(field, formData.get(field.name));
  }
  return row;
}

function validate(entity: Entity, row: Record<string, unknown>) {
  for (const field of entity.fields) {
    if (!field.required) continue;
    const v = row[field.name];
    if (v === null || v === undefined || String(v).trim() === '') {
      return `${field.label} is required.`;
    }
  }
  return null;
}

export async function createRow(_prev: CmsState, formData: FormData): Promise<CmsState> {
  const key = String(formData.get('__entity') ?? '');
  const entity = entityByKey(key);
  if (!entity) return { error: 'Unknown content type.' };

  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const row = collect(entity, formData);
  const invalid = validate(entity, row);
  if (invalid) return { error: invalid };

  /* Tables with a generated primary key must not be sent one — a uuid column
     rejects the readable text id the content tables use. Everywhere else an
     explicit id wins, and otherwise one is derived from the slug or title so
     the keys stay legible (sys-accounting-system, not a uuid). */
  let id: string | null = null;
  if (!entity.generatedId) {
    const typedId = String(formData.get('id') ?? '').trim();
    const basis = String(row[entity.slugField ?? entity.titleField] ?? '');
    id = typedId || `${entity.idPrefix}${slugify(basis)}`;
    if (!id || id === entity.idPrefix) {
      return { error: 'Could not derive an id. Enter one explicitly.' };
    }
  }

  const { data: created, error } = await supabase
    .from(entity.table)
    .insert(id ? { ...row, id } : row)
    .select('id')
    .maybeSingle();
  if (error) {
    if (error.code === '23505') return { error: 'That id or slug is already taken.' };
    return { error: `Could not create the ${entity.singular}: ${error.message}` };
  }

  refresh(entity, row.slug as string | undefined);
  const newId = id ?? String((created as { id?: unknown } | null)?.id ?? '');
  redirect(`/admin/${entity.key}?created=${encodeURIComponent(newId)}`);
}

export async function updateRow(_prev: CmsState, formData: FormData): Promise<CmsState> {
  const key = String(formData.get('__entity') ?? '');
  const id = String(formData.get('__id') ?? '');
  const entity = entityByKey(key);
  if (!entity) return { error: 'Unknown content type.' };
  if (!id) return { error: 'Missing row.' };

  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const row = collect(entity, formData);
  const invalid = validate(entity, row);
  if (invalid) return { error: invalid };

  // The slug may have just changed, so the page at the old address needs
  // refreshing too or it would keep serving a route that no longer exists.
  const previousSlug = String(formData.get('__previous_slug') ?? '') || null;

  const { error } = await supabase.from(entity.table).update(row).eq('id', id);
  if (error) {
    if (error.code === '23505') return { error: 'That slug is already taken.' };
    return { error: `Could not save: ${error.message}` };
  }

  refresh(entity, row.slug as string | undefined);
  if (previousSlug && previousSlug !== row.slug) refresh(entity, previousSlug);
  revalidatePath(`/admin/${entity.key}/${id}`);

  return { ok: 'Saved.' };
}

export async function toggleHidden(formData: FormData) {
  const key = String(formData.get('__entity') ?? '');
  const id = String(formData.get('__id') ?? '');
  const slug = String(formData.get('__slug') ?? '') || null;
  const next = String(formData.get('__next') ?? '') === 'true';

  const entity = entityByKey(key);
  if (!entity || !id) return;

  const { supabase, error } = await requireAdmin();
  if (error) return;

  await supabase.from(entity.table).update({ hidden: next }).eq('id', id);
  refresh(entity, slug);
}

export async function deleteRow(formData: FormData) {
  const key = String(formData.get('__entity') ?? '');
  const id = String(formData.get('__id') ?? '');
  const slug = String(formData.get('__slug') ?? '') || null;

  const entity = entityByKey(key);
  if (!entity || !id) return;

  const { supabase, error } = await requireAdmin();
  if (error) return;

  await supabase.from(entity.table).delete().eq('id', id);
  refresh(entity, slug);
  redirect(`/admin/${entity.key}?deleted=1`);
}
