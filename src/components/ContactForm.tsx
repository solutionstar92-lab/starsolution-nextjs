'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Icon } from './Icon';

type State = 'idle' | 'sending' | 'sent' | 'error';

/** At least seven digits, so +20 10 1234 5678 and a local 0123456 both pass and
 *  a stray "07" does not. Deliberately loose about punctuation: people write
 *  numbers with spaces, dashes and brackets, and rejecting that teaches nothing. */
const phoneDigits = (v: string) => v.replace(/\D/g, '');

/**
 * Audit request form. Posts to /api/leads, which writes to Supabase when configured.
 *
 * Three fields are on show — name, email, phone — and the two that only some
 * people fill in sit behind a toggle. The whole form used to be visible, which
 * made a two-minute ask look like a form to come back to later. Collapsing the
 * optional half rather than the whole thing keeps the ask itself in plain sight:
 * a button saying "get your free audit" hides what it costs to answer.
 *
 * The optional fields stay mounted while collapsed, so anything typed into them
 * survives a change of mind, and `inert` keeps them out of the tab order while
 * they are not on screen.
 */
export function ContactForm() {
  const [state, setState] = React.useState<State>('idle');
  const [errors, setErrors] = React.useState<{ name?: string; email?: string; phone?: string }>({});
  const [message, setMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const panelId = 'lead-optional';

  /* `inert` rather than unmounting: a collapsed panel is still in the document,
     and without this its inputs stay tabbable and readable to a screen reader
     while invisible. Set through a ref because React 18 does not know the
     attribute. */
  React.useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (open) el.removeAttribute('inert');
    else el.setAttribute('inert', '');
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const next: typeof errors = {};
    if (!data.name || data.name.trim().length < 2) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email ?? '')) next.email = 'Enter a valid email address.';
    if (phoneDigits(data.phone ?? '').length < 7) next.phone = 'Enter a phone number we can reach you on.';
    setErrors(next);
    if (Object.keys(next).length) {
      // Focus the first field that needs attention rather than leaving the
      // reader to hunt for the red one. By id, not by [aria-invalid]: setErrors
      // has not rendered yet, so the DOM still carries the previous attempt.
      const firstBad = next.name ? 'fName' : next.email ? 'fEmail' : 'fPhone';
      form.querySelector<HTMLInputElement>(`#${firstBad}`)?.focus();
      return;
    }

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

        <div className={`field${errors.phone ? ' has-error' : ''}`}>
          <label htmlFor="fPhone">Phone number <span aria-hidden="true">*</span></label>
          <input
            id="fPhone" name="phone" type="tel" autoComplete="tel" inputMode="tel"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p className="err">{errors.phone}</p>}
        </div>

        <button
          type="button"
          className="form-more-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Hide extra details' : 'Add business name and project details'}
          <Icon name="arrow" className="form-more-chev" />
        </button>

        <motion.div
          id={panelId}
          ref={panelRef}
          className={`form-more${open ? ' is-open' : ''}`}
          initial={false}
          animate={open ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.34, ease: [0.16, 0.84, 0.3, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <div className="form-more-inner">
            <div className="field">
              <label htmlFor="fBusiness">Business name</label>
              <input id="fBusiness" name="company" type="text" autoComplete="organization" />
            </div>

            <div className="field">
              <label htmlFor="fMsg">Tell us about your business</label>
              <textarea id="fMsg" name="message" rows={3} placeholder="Store link and what's slowing you down" />
            </div>
          </div>
        </motion.div>

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
