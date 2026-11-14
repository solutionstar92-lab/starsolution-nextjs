import type { Locale } from '@/lib/i18n';

const TZ = 'Africa/Cairo';

/** Cairo's UTC offset on a given day, e.g. "+03:00" in summer, "+02:00" in winter. */
function cairoOffset(date: string): string {
  // 06:00 UTC is 08:00-09:00 in Cairo, well clear of the midnight DST switch.
  const name = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' })
    .formatToParts(new Date(`${date}T06:00:00Z`))
    .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+02:00';
  const m = name.match(/GMT([+-]\d{2}):?(\d{2})?/);
  return m ? `${m[1]}:${m[2] ?? '00'}` : '+02:00';
}

/**
 * A "YYYY-MM-DD" date as full ISO 8601 at 09:00 Cairo time, with the offset
 * Cairo actually had that day (Egypt observes daylight saving), e.g.
 * "2026-07-28T09:00:00+03:00". What Google's Rich Results Test expects.
 */
export function cairoIso(date: string): string {
  return `${date}T09:00:00${cairoOffset(date)}`;
}

/** "Nov 8, 2026" / "8 نوفمبر 2026" (Western digits, as the rest of the site). */
export function formatDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
    timeZone: TZ, day: 'numeric', month: locale === 'ar' ? 'long' : 'short', year: 'numeric',
  }).format(new Date(cairoIso(date)));
}
