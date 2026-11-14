import type { Entry } from './types';
import type { Locale, Post } from './i18n';
import { getContent, localeHref } from './i18n';
import { cairoIso } from './dates';

/**
 * Structured data (schema.org JSON-LD) for Google.
 *
 * Everything here renders as <script type="application/ld+json"> — invisible
 * to visitors, read by search engines. Nothing in this file changes how a
 * page looks.
 *
 * Rule for every builder: only state what the page itself shows. Google
 * treats markup that claims more than the visible page as spam.
 */

export const SITE_URL = 'https://www.starsolution.ai';

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

const NAME: Record<Locale, string> = { en: 'StarSolution.ai', ar: 'ستار سوليوشن' };

const DESCRIPTION: Record<Locale, string> = {
  en: 'AI automation for e-commerce brands in Egypt and the region: Shopify, ads, social media and customer support.',
  ar: 'أتمتة بالذكاء الاصطناعي للمتاجر الإلكترونية في مصر والمنطقة: شوبيفاي والإعلانات والسوشيال ميديا وخدمة العملاء.',
};

/**
 * Business details for the ProfessionalService block.
 *
 * Fill these in with the real values. Anything left empty is simply left out
 * of the markup — an empty field is better than a wrong one. The phone number
 * in site.json is still the "+20 123 456 7890" placeholder, so it is not used
 * here until it is replaced.
 */
export const BUSINESS = {
  /** Full street address, e.g. '12 Example St, Nasr City'. */
  streetAddress: '',
  addressLocality: 'Cairo',
  addressRegion: 'Cairo Governorate',
  postalCode: '',
  addressCountry: 'EG',
  /** International format, e.g. '+201001234567'. Empty = taken from site.json if it is real. */
  telephone: '',
  /** e.g. ['Su-Th 10:00-18:00']. */
  openingHours: [] as string[],
  /** Public profile URLs: LinkedIn, Facebook, Instagram, Google Business Profile, Clutch… */
  sameAs: [] as string[],
  /** Absolute URL of a square PNG/JPG logo, at least 112×112. public/logo.png is the site's own mark. */
  logo: `${SITE_URL}/logo.png`,
};

const PLACEHOLDER_PHONE = /123\s*456\s*7890/;

export function abs(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Drops empty strings, empty arrays and undefined, so unfilled fields vanish. */
function clean<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)),
  ) as T;
}

function phone(locale: Locale) {
  if (BUSINESS.telephone) return BUSINESS.telephone;
  const p = getContent(locale).contact.phone;
  return p && !PLACEHOLDER_PHONE.test(p) ? p.replace(/\s/g, '') : '';
}

/* ------------------------------------------------------------------ */
/* Site-wide                                                           */
/* ------------------------------------------------------------------ */

export function organization(locale: Locale) {
  const contact = getContent(locale).contact;
  const tel = phone(locale);
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'StarSolution.ai',
    alternateName: ['StarSolution', 'Star Solution', 'ستار سوليوشن'],
    url: SITE_URL,
    logo: BUSINESS.logo,
    description: DESCRIPTION[locale],
    email: contact.email,
    telephone: tel,
    sameAs: BUSINESS.sameAs,
    contactPoint: [clean({
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: contact.email,
      telephone: tel,
      url: contact.whatsapp,
      areaServed: 'EG',
      availableLanguage: ['English', 'Arabic'],
    })],
  });
}

export function website(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_ID}-${locale}`,
    name: NAME[locale],
    alternateName: locale === 'en' ? 'StarSolution' : 'StarSolution.ai',
    url: abs(localeHref(locale, '/')),
    inLanguage: locale,
    publisher: { '@id': ORG_ID },
  };
}

/** Local-business block: home and contact pages. */
export function professionalService(locale: Locale) {
  const contact = getContent(locale).contact;
  return clean({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#business`,
    name: NAME[locale],
    url: abs(localeHref(locale, '/')),
    image: BUSINESS.logo,
    description: DESCRIPTION[locale],
    email: contact.email,
    telephone: phone(locale),
    address: clean({
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      addressRegion: BUSINESS.addressRegion,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    }),
    areaServed: { '@type': 'Country', name: 'Egypt' },
    openingHours: BUSINESS.openingHours,
    sameAs: BUSINESS.sameAs,
    parentOrganization: { '@id': ORG_ID },
  });
}

/* ------------------------------------------------------------------ */
/* Per page                                                            */
/* ------------------------------------------------------------------ */

export type Crumb = { href?: string; label: string };

/**
 * From the crumbs PageHead already draws. The last crumb is the current page
 * and has no link; Google allows the last item without `item`.
 */
export function breadcrumbs(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => clean({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: c.href ? abs(c.href) : undefined,
    })),
  };
}

/** The author of a post, as BlogPosting needs it. */
export type PostAuthor = { name: string; href: string; personId: string };

/**
 * Blog posts. `path` is locale-free, e.g. '/blog/my-post'. With an author the
 * byline's person is the author, under the same @id as the Person on their
 * team page; without one, the Organization stays the author as before.
 */
export function blogPosting(post: Post, locale: Locale, path: string, author?: PostAuthor | null) {
  const url = abs(localeHref(locale, path));
  return clean({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.excerpt,
    // Full ISO 8601 with Cairo's offset for that day; a bare date fails the
    // Rich Results Test ("missing a timezone").
    datePublished: cairoIso(post.date),
    dateModified: post.updated ? cairoIso(post.updated) : undefined,
    inLanguage: locale,
    articleSection: post.tag,
    author: author
      ? { '@type': 'Person', '@id': author.personId, name: author.name, url: abs(author.href) }
      : { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  });
}

/**
 * The plain name of each solution's service, for `serviceType`. The page title
 * is a marketing headline; this is what the service is called when searched.
 */
const SOLUTION_SERVICE_TYPE: Record<string, Record<Locale, string>> = {
  'revenue-automation': { en: 'E-commerce automation', ar: 'أتمتة المتاجر الإلكترونية' },
  'order-fulfillment': { en: 'Shopify order automation', ar: 'اتمتة متجر شوبيفاي' },
  'social-media-growth': { en: 'Social media management', ar: 'إدارة صفحات السوشيال ميديا' },
  'shopify-optimization': { en: 'Shopify store design and optimization', ar: 'تصميم متجر شوبيفاي' },
  'ai-smart-ads': { en: 'Facebook and Google ads management', ar: 'إدارة إعلانات ممولة' },
  'ai-customer-support': { en: 'AI customer service', ar: 'خدمة عملاء بالذكاء الاصطناعي' },
};

/**
 * Solutions, automations and systems. No `inLanguage`: schema.org does not
 * define it for Service, and the validator flags it. `serviceType` is the
 * plain service name for a solution, and the entry title for anything else.
 */
export function service(entry: Entry, locale: Locale, path: string) {
  const url = abs(localeHref(locale, path));
  const isSolution = path.startsWith('/solutions/');
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    url,
    name: entry.title,
    description: entry.summary,
    serviceType: (isSolution && SOLUTION_SERVICE_TYPE[entry.slug]?.[locale]) || entry.title,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Egypt' },
  });
}

export type FaqItem = { q: string; a: string };

/**
 * FAQ block. Only for questions printed on the same page (the Faq component
 * renders from the same items), since Google ignores FAQ markup that is not
 * visible to the reader.
 */
export function faqPage(items: FaqItem[], locale: Locale, path: string) {
  const url = abs(localeHref(locale, path));
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    url,
    inLanguage: locale,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/** Team member pages. */
export function profilePage(entry: Entry, locale: Locale, path: string) {
  const url = abs(localeHref(locale, path));
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    inLanguage: locale,
    mainEntity: clean({
      '@type': 'Person',
      '@id': `${abs(localeHref('en', path))}#person`,
      name: entry.title,
      jobTitle: entry.role,
      description: entry.summary,
      knowsAbout: entry.points,
      worksFor: { '@id': ORG_ID },
    }),
  };
}

/* ------------------------------------------------------------------ */
/* Renderer                                                            */
/* ------------------------------------------------------------------ */

/**
 * `<` is escaped so a title containing "</script>" cannot end the tag early.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
