'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signIn, type AuthState } from '../auth-actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useFormState<AuthState, FormData>(signIn, {});

  return (
    <form action={action}>
      <input type="hidden" name="next" value={next} />

      {/* `.field` is the site's wrapper — the input styling comes from
          `.field input`, so the class belongs on the div, not the control. */}
      <div className={`field${state.error ? ' has-error' : ''}`}>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>

      <div className={`field${state.error ? ' has-error' : ''}`}>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      {state.error && <p className="admin-alert is-error">{state.error}</p>}

      <div style={{ marginTop: 14 }}><Submit /></div>
    </form>
  );
}
