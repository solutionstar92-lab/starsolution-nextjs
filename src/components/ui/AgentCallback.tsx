'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from '../Icon';

type State = { status: 'idle' | 'sending' | 'done' | 'error'; message?: string };

/** Loose on purpose: 7+ digits after stripping punctuation and an optional +. */
const PHONE_OK = (v: string) => v.replace(/[^\d]/g, '').length >= 7;

/**
 * "Talk to our AI agent" — a callback request in two fields.
 *
 * The contact form asks for five things because it is the bottom of the page
 * and the visitor has already decided. This is the opposite: it interrupts, so
 * it asks for the least that still lets someone be called back — a name and a
 * number. Anything more and the interruption is not worth taking.
 *
 * It writes to the same `leads` table the contact form does, tagged in the
 * message so it is obvious in /admin/leads where the enquiry came from and
 * that there is no email address to reply to.
 */
export function AgentCallback() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [state, setState] = React.useState<State>({ status: 'idle' });
  const nameRef = React.useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => nameRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const valid = name.trim().length >= 2 && PHONE_OK(phone);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || state.status === 'sending') return;
    setState({ status: 'sending' });
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), source: 'agent' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: 'error', message: data.error ?? 'Could not send that. Please try again.' });
        return;
      }
      setState({ status: 'done', message: data.message });
    } catch {
      setState({ status: 'error', message: 'Network problem. Please try again.' });
    }
  }

  function close() {
    setOpen(false);
    // Let the exit animation finish before the content swaps back.
    setTimeout(() => { setState({ status: 'idle' }); setName(''); setPhone(''); }, 260);
  }

  return (
    <>
      <button
        type="button"
        className="head-icon head-icon-agent"
        aria-label="Talk to our AI agent"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="bot" />
        <span className="head-icon-dot" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ac-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="acTitle"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
          >
            <motion.div
              className="ac-panel"
              initial={reduce ? false : { y: 18, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 12, opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.26, ease: [0.16, 0.84, 0.3, 1] }}
            >
              <button type="button" className="ac-close" onClick={close} aria-label="Close">
                <Icon name="close" />
              </button>

              {state.status === 'done' ? (
                <div className="ac-done">
                  <span className="ac-tick"><Icon name="check" /></span>
                  <h2 id="acTitle">Thanks, {name.trim().split(' ')[0]}.</h2>
                  <p>{state.message ?? 'Our agent will call you back shortly.'}</p>
                  <button type="button" className="btn btn-ghost btn-lg w-full" onClick={close}>Close</button>
                </div>
              ) : (
                <>
                  <span className="ac-orb" aria-hidden="true"><Icon name="bot" /></span>
                  <h2 id="acTitle">Talk to our AI agent</h2>
                  <p className="ac-lede">
                    Leave your name and number. The agent picks it up and we call you back — usually the same day.
                  </p>

                  <form onSubmit={submit} className="ac-form" noValidate>
                    <label>
                      <span>Your name</span>
                      <input
                        ref={nameRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        placeholder="Heba Hesham"
                        required
                      />
                    </label>
                    <label>
                      <span>Phone number</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="+20 100 000 0000"
                        required
                      />
                    </label>

                    {state.status === 'error' && <p className="ac-error">{state.message}</p>}

                    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={!valid || state.status === 'sending'}>
                      {state.status === 'sending' ? 'Sending…' : 'Request a callback'}
                      {state.status !== 'sending' && <Icon name="arrow" className="h-[18px] w-[18px]" />}
                    </button>
                    <p className="ac-fine">No spam. We only use it to call you back.</p>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
