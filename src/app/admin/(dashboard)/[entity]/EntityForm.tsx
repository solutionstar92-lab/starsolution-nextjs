'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createRow, updateRow, type CmsState } from './actions';
import type { Entity, Field } from '@/lib/admin/entities';
import { toInput, slugify } from '@/lib/admin/encode';

function Save({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
      {pending ? 'Saving…' : label}
    </button>
  );
}

function Control({
  field, value, onInput,
}: {
  field: Field;
  value: string;
  onInput?: (v: string) => void;
}) {
  const id = `f-${field.name}`;

  if (field.kind === 'boolean') {
    return (
      <label className="admin-check" htmlFor={id}>
        <input id={id} name={field.name} type="checkbox" defaultChecked={value === 'true'} />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.kind === 'select') {
    return (
      <select id={id} name={field.name} defaultValue={value} className="admin-select">
        <option value="">—</option>
        {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (field.kind === 'textarea' || field.kind === 'lines' || field.kind === 'pairs') {
    return (
      <textarea
        id={id}
        name={field.name}
        defaultValue={value}
        rows={field.kind === 'textarea' ? 3 : 6}
        /* Monospace so the one-per-line formats line up and are easy to scan. */
        className={field.kind === 'textarea' ? undefined : 'admin-mono'}
      />
    );
  }

  return (
    <input
      id={id}
      name={field.name}
      type={field.kind === 'number' ? 'number' : 'text'}
      defaultValue={value}
      required={field.required}
      placeholder={field.kind === 'color' ? '#3B82F6' : undefined}
      onChange={onInput ? (e) => onInput(e.target.value) : undefined}
    />
  );
}

/**
 * One form for all eight tables, built from the entity registry.
 *
 * Create and edit differ only in which action runs and whether the id can be
 * typed, so they share this component rather than drifting apart over time.
 */
export function EntityForm({
  entity, row, mode,
}: {
  entity: Entity;
  row: Record<string, unknown> | null;
  mode: 'create' | 'edit';
}) {
  const action = mode === 'create' ? createRow : updateRow;
  const [state, formAction] = useFormState<CmsState, FormData>(action, {});

  const [id, setId] = React.useState(String(row?.id ?? ''));
  const [idTouched, setIdTouched] = React.useState(false);

  /* On create, mirror the title into the id until someone edits the id — the
     common case needs no thought, the unusual one is still possible. */
  const onTitleInput = (value: string) => {
    if (mode === 'create' && !idTouched) setId(`${entity.idPrefix}${slugify(value)}`);
  };

  return (
    <form action={formAction} className="admin-form">
      <input type="hidden" name="__entity" value={entity.key} />
      {mode === 'edit' && <input type="hidden" name="__id" value={String(row?.id ?? '')} />}
      {mode === 'edit' && entity.slugField && (
        <input type="hidden" name="__previous_slug" value={String(row?.slug ?? '')} />
      )}

      <div className="admin-form-grid">
        <div className="admin-form-field">
          <label htmlFor="f-id">Id</label>
          {mode === 'create' ? (
            <input
              id="f-id" name="id" type="text" value={id}
              onChange={(e) => { setId(e.target.value); setIdTouched(true); }}
            />
          ) : (
            <input id="f-id" type="text" value={String(row?.id ?? '')} readOnly disabled />
          )}
          <p className="admin-help">
            {mode === 'create'
              ? 'The primary key. Follows the title until you edit it.'
              : 'Primary keys are not editable — delete and recreate to change one.'}
          </p>
        </div>

        {entity.fields.map((field) => (
          <div key={field.name} className={`admin-form-field${field.wide ? ' is-wide' : ''}`}>
            {field.kind !== 'boolean' && (
              <label htmlFor={`f-${field.name}`}>
                {field.label}{field.required && <span aria-hidden="true"> *</span>}
              </label>
            )}
            <Control
              field={field}
              value={toInput(field, row?.[field.name])}
              onInput={field.name === entity.titleField ? onTitleInput : undefined}
            />
            {field.help && <p className="admin-help">{field.help}</p>}
          </div>
        ))}
      </div>

      {/* createRow ends in redirect(), and an action that redirects resolves
          with no state, so this render sees undefined rather than {}. */}
      {state?.error && <p className="admin-alert is-error">{state.error}</p>}
      {state?.ok && <p className="admin-alert is-ok">{state.ok}</p>}

      <div className="admin-form-foot">
        <Save label={mode === 'create' ? `Create ${entity.singular}` : 'Save changes'} />
      </div>
    </form>
  );
}
