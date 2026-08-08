'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';

type State = 'idle' | 'sending' | 'sent' | 'error';

/** Audit request form. Posts to /api/leads, which writes to Supabase when configured. */
export function ContactForm() {
  const [state, setState] = React.useState<State>('idle');
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({});
  const [message, setMessage] = React.useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const next: typeof errors = {};
    if (!data.name || data.name.trim().length < 2) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email ?? '')) next.email = 'Enter a valid email address.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setState('sending');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Request failed');
      setMessage(body.message ?? 'Thanks — we will reply within one business day.');
      setState('sent');
      form.reset();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
      setState('error');
    }
  }

  return (
    <div className="form-card">
      <h3>Get your free audit</h3>
      <form onSubmit={onSubmit} noValidate>
        <div className={`field${errors.name ? ' has-error' : ''}`}>
          <label htmlFor="fName">Full name <span aria-hidden="true">*</span></label>
          <input id="fName" name="name" type="text" autoComplete="name" aria-invalid={!!errors.name} />
          {errors.name && <p className="err">{errors.name}</p>}
        </div>

        <div className={`field${errors.email ? ' has-error' : ''}`}>
          <label htmlFor="fEmail">Email address <span aria-hidden="true">*</span></label>
          <input id="fEmail" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
          {errors.email && <p className="err">{errors.email}</p>}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="fPhone">Phone number</label>
            <input id="fPhone" name="phone" type="tel" autoComplete="tel" inputMode="tel" />
          </div>
          <div className="field">
            <label htmlFor="fCompany">Business name</label>
            <input id="fCompany" name="company" type="text" autoComplete="organization" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="fMsg">Tell us about your business</label>
          <textarea id="fMsg" name="message" rows={3} placeholder="Store link and what's slowing you down" />
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Get free audit'}
          {state !== 'sending' && <Icon name="arrow" className="h-[18px] w-[18px]" />}
        </button>

        <p className="form-note">No spam.</p>

        {(state === 'sent' || state === 'error') && (
          <motion.p
            className="form-success"
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={state === 'error' ? { background: '#FEF2F2', borderColor: '#FBD5D5', color: '#B42318' } : undefined}
          >
            {message}
          </motion.p>
        )}
      </form>
    </div>
  );
}
