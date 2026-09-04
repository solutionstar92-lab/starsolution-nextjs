import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { ContactForm } from './ContactForm';
import { site } from '@/lib/content';

export function CTA() {
  return (
    <section id="contact" className="cta" aria-labelledby="ctaTitle">
      <div className="cta-wash" aria-hidden="true" />
      <svg className="cta-lines" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="60,420 210,330 340,392 470,250 640,320 790,190 950,264 1140,150" />
        <polyline points="120,120 300,180 430,110 610,168 760,96 930,150 1120,84" />
      </svg>

      {/* Three children, not two. On a phone the shell is one column, so the
          WhatsApp link used to land above the form — "instead" pointing at
          something the reader had not reached yet. As its own child it can sit
          after the form on a phone and stay under the checklist on desktop,
          where the grid places it explicitly. */}
      <div className="cta-shell">
        <Reveal className="cta-copy">
          <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> Get started today</p>
          <h2 id="ctaTitle" className="cta-title">Ready to grow?</h2>
          <p className="cta-sub">Free audit. No commitment.</p>
          <ul className="cta-points">
            <li><Icon name="check" /> Written growth report</li>
            <li><Icon name="check" /> A build plan you keep</li>
            <li><Icon name="check" /> Reply within a day</li>
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="cta-form">
          <ContactForm />
        </Reveal>

        <div className="cta-alt">
          <a href={site.contact.whatsapp} className="btn btn-ghost btn-lg">
            <Icon name="whatsapp" className="h-5 w-5 text-[#25D366]" /> WhatsApp us instead
          </a>
        </div>
      </div>
    </section>
  );
}
