'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateLeadStatus } from './actions';
import { LEAD_STATUSES, STATUS_LABEL, type ActionState, type LeadStatus } from './constants';

function AutoSubmit() {
  const { pending } = useFormStatus();
  return <span className="admin-saving">{pending ? 'Saving…' : ''}</span>;
}

/** Status dropdown that submits on change — no separate save button. */
export function StatusPicker({ id, status }: { id: string; status: LeadStatus }) {
  const [state, action] = useFormState<ActionState, FormData>(updateLeadStatus, {});

  return (
    <form action={action} className="admin-status-form">
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`status-${id}`} className="admin-field-label">Status</label>
      <div className="admin-select-row">
        <select
          id={`status-${id}`}
          name="status"
          defaultValue={status}
          className="admin-select"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          {LEAD_STATUSES.map((value) => (
            <option key={value} value={value}>{STATUS_LABEL[value]}</option>
          ))}
        </select>
        <AutoSubmit />
      </div>
      {state.error && <p className="admin-alert is-error">{state.error}</p>}
      {state.ok && <p className="admin-alert is-ok">{state.ok}</p>}
    </form>
  );
}
