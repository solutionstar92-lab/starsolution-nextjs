'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addLeadNote } from './actions';
import { type ActionState } from './constants';

function SubmitNote() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
      {pending ? 'Saving…' : 'Add note'}
    </button>
  );
}

/** Internal follow-up notes. Clears itself after a successful save. */
export function NoteComposer({ leadId }: { leadId: string }) {
  const [state, action] = useFormState<ActionState, FormData>(addLeadNote, {});
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state?.ok]);

  return (
    <form action={action} ref={formRef} className="admin-note-form">
      <input type="hidden" name="lead_id" value={leadId} />
      <label htmlFor="note-body" className="admin-field-label">Add an internal note</label>
      <textarea
        id="note-body"
        name="body"
        rows={3}
        placeholder="Called and left a voicemail. Following up Thursday."
        maxLength={4000}
      />
      <div className="admin-note-actions">
        <SubmitNote />
        {state?.error && <p className="admin-alert is-error">{state.error}</p>}
      </div>
    </form>
  );
}
