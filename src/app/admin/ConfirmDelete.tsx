'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';

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
 * A single click is too cheap for something with no undo. This was written for
 * the content tables — an accidental delete on Team takes a person off the
 * public site immediately — and then a lead had nothing at all, which was the
 * wrong way round: a testimonial you can retype, an enquiry is somebody's name,
 * address, message and every note anyone made on it, and it is gone.
 *
 * The caller supplies the action and whatever hidden inputs it needs, so the
 * confirmation itself stays the only copy. `word` is deliberately typed rather
 * than a click: it is the pause that matters, not the keystrokes.
 */
export function ConfirmDelete({
  action,
  name,
  children,
  label = 'Delete',
  word = 'delete',
  hint,
}: {
  /** Server action the confirmed form posts to. */
  action: (formData: FormData) => void | Promise<void>;
  /** What is being deleted, shown in the prompt. */
  name: string;
  /** Hidden inputs the action needs — ids, slugs, entity keys. */
  children?: React.ReactNode;
  label?: string;
  word?: string;
  /** Extra line above the prompt, for anything else that goes with it. */
  hint?: React.ReactNode;
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
    <form action={action} className="admin-confirm">
      {children}
      {hint}
      <p>
        This cannot be undone. Type <strong>{word}</strong> to confirm removing
        {' '}<em>{name}</em>.
      </p>
      <div className="admin-confirm-row">
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          aria-label={`Type ${word} to confirm`}
          autoFocus
        />
        {typed.trim().toLowerCase() === word && <DeleteButton label={label} />}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => { setArmed(false); setTyped(''); }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
