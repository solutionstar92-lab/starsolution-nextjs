'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Icon } from '@/components/Icon';
import { toggleHidden, deleteRow } from './actions';

function ToggleButton({ hidden }: { hidden: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`admin-toggle${hidden ? ' is-hidden' : ''}`}
      disabled={pending}
      title={hidden ? 'Hidden from the site — click to publish' : 'Live — click to hide'}
    >
      <Icon name="eye" />
      {pending ? '…' : hidden ? 'Hidden' : 'Live'}
    </button>
  );
}

/** Publish / hide switch. Writes straight through and revalidates the site. */
export function VisibilityToggle({
  entityKey, id, slug, hidden,
}: {
  entityKey: string; id: string; slug?: string | null; hidden: boolean;
}) {
  return (
    <form action={toggleHidden}>
      <input type="hidden" name="__entity" value={entityKey} />
      <input type="hidden" name="__id" value={id} />
      <input type="hidden" name="__slug" value={slug ?? ''} />
      <input type="hidden" name="__next" value={String(!hidden)} />
      <ToggleButton hidden={hidden} />
    </form>
  );
}

function DeleteButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admin-danger-btn" disabled={pending}>
      {pending ? 'Deleting…' : label}
    </button>
  );
}

/**
 * Delete, behind a typed confirmation.
 *
 * A single click is too cheap for something with no undo, and these rows are
 * the live site — an accidental delete on Team removes a person from the
 * public page immediately.
 */
export function DeleteRow({
  entityKey, id, slug, name, label = 'Delete',
}: {
  entityKey: string; id: string; slug?: string | null; name: string; label?: string;
}) {
  const [armed, setArmed] = React.useState(false);
  const [typed, setTyped] = React.useState('');

  if (!armed) {
    return (
      <button type="button" className="admin-danger-btn" onClick={() => setArmed(true)}>
        {label}
      </button>
    );
  }

  return (
    <form action={deleteRow} className="admin-confirm">
      <input type="hidden" name="__entity" value={entityKey} />
      <input type="hidden" name="__id" value={id} />
      <input type="hidden" name="__slug" value={slug ?? ''} />
      <p>
        This cannot be undone. Type <strong>delete</strong> to confirm removing
        {' '}<em>{name}</em>.
      </p>
      <div className="admin-confirm-row">
        <input
          type="text" value={typed} onChange={(e) => setTyped(e.target.value)}
          aria-label="Type delete to confirm" autoFocus
        />
        {typed.trim().toLowerCase() === 'delete' && <DeleteButton label={label} />}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setArmed(false); setTyped(''); }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
