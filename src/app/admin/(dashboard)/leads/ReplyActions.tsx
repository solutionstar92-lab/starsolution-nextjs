'use client';

import * as React from 'react';
import { Icon } from '@/components/Icon';

/**
 * Ways to reply to a lead.
 *
 * "Reply by email" was a bare mailto: link, and on a machine with no mail
 * client registered — which is the normal state of a Windows box where mail
 * lives in a browser tab — clicking it does nothing at all. No error, no new
 * window: the browser has nowhere to hand the URL. Gmail's compose endpoint is
 * therefore the primary action, since it works anywhere there is a browser,
 * with the mailto: kept as a secondary for anyone who does have a mail app.
 *
 * Copy is here because it always works, whatever is or is not installed.
 */
export function ReplyActions({
  email, name, phone,
}: {
  email: string;
  name: string;
  phone?: string | null;
}) {
  const [copied, setCopied] = React.useState(false);

  const subject = `Re: your enquiry — StarSolution.ai`;
  const body =
    `Hi ${name.split(' ')[0] || 'there'},\n\n` +
    `Thanks for getting in touch with StarSolution.ai.\n\n`;

  const gmail =
    'https://mail.google.com/mail/?view=cm&fs=1'
    + `&to=${encodeURIComponent(email)}`
    + `&su=${encodeURIComponent(subject)}`
    + `&body=${encodeURIComponent(body)}`;

  const mailto =
    `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const digits = (phone ?? '').replace(/[^\d]/g, '');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard needs a secure context and permission; if it is refused the
         address is still selectable in the Submission panel above. */
    }
  };

  return (
    <div className="admin-side-actions">
      <a
        href={gmail}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary btn-sm w-full"
      >
        <Icon name="mail" className="h-4 w-4" /> Reply in Gmail
      </a>

      {digits && (
        <a
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm w-full"
        >
          <Icon name="whatsapp" className="h-4 w-4 text-[#25D366]" /> WhatsApp
        </a>
      )}

      <button type="button" onClick={copy} className="btn btn-ghost btn-sm w-full">
        <Icon name={copied ? 'check' : 'quote'} className="h-4 w-4" />
        {copied ? 'Address copied' : 'Copy email address'}
      </button>

      <a href={mailto} className="admin-side-alt">
        Or open in your mail app
      </a>
    </div>
  );
}
