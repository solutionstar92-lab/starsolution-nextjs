import type { Metadata } from 'next';
import { PageHead } from '@/components/PageHead';
import { ContactForm } from '@/components/ContactForm';
import { Reveal } from '@/components/Reveal';
import { Icon } from '@/components/Icon';
import { site } from '@/lib/content';
import { supabaseConfigured } from '@/lib/supabase';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  const { contact } = site;
  return (
    <>
      <PageHead
        eyebrow="Get started today"
        title="Ready to grow?"
        lede="Free audit of your business. We will show you where AI can double your revenue — no commitment."
        crumbs={[{ href: '/', label: 'Home' }, { label: 'Contact' }]}
      />
      <section className="section">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <div className="contact-grid">
            <Reveal>
              <h2 className="section-title">Talk to us</h2>
              <ul className="contact-list">
                <li><a href={`mailto:${contact.email}`}><Icon name="mail" /> {contact.email}</a></li>
                <li><a href={`tel:${contact.phone.replace(/\s/g, '')}`}><Icon name="phone" /> {contact.phone}</a></li>
                <li><a href={contact.whatsapp}><Icon name="whatsapp" /> WhatsApp us</a></li>
                <li><span><Icon name="pin" /> {contact.locations}</span></li>
              </ul>
              <p className="section-sub mt-6">
                Submissions are stored in Supabase when the project is connected.
                {' '}
                <span className={`source-flag${supabaseConfigured ? '' : ' is-seed'}`}>
                  <i aria-hidden="true" /> {supabaseConfigured ? 'Supabase connected' : 'Seed data mode'}
                </span>
              </p>
            </Reveal>
            <Reveal delay={0.1}><ContactForm /></Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
