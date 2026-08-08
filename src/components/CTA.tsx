import { Icon } from './Icon';
import { Reveal } from './Reveal';
import { ContactForm } from './ContactForm';

export function CTA() {
  return (
    <section id="contact" className="cta" aria-labelledby="ctaTitle">
      <div className="cta-wash" aria-hidden="true" />
      <svg className="cta-lines" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="60,420 210,330 340,392 470,250 640,320 790,190 950,264 1140,150" />
        <polyline points="120,120 300,180 430,110 610,168 760,96 930,150 1120,84" />
      </svg>

      <div className="cta-shell">
        <Reveal>
          <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> Get started today</p>
          <h2 id="ctaTitle" className="cta-title">Ready to grow?</h2>
          <p className="cta-sub">Free audit. No commitment.</p>
          <ul className="cta-points">
            <li><Icon name="check" /> Written growth report</li>
            <li><Icon name="check" /> A build plan you keep</li>
            <li><Icon name="check" /> Reply within a day</li>
          </ul>
          <a href="https://wa.me/+201234567890" className="btn btn-ghost btn-lg mt-7">
            <Icon name="whatsapp" className="h-5 w-5 text-[#25D366]" /> WhatsApp us instead
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
