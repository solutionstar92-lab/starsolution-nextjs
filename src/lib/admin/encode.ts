import type { Field } from './entities';

/**
 * Translation between database values and the strings an HTML form carries.
 *
 * Kept out of the server-action file because a 'use server' module may only
 * export async functions, the same constraint that split constants.ts out of
 * the leads actions.
 */

export type Row = Record<string, unknown>;

/** Database value -> the string shown in the form control. */
export function toInput(field: Field, value: unknown): string {
  if (value === null || value === undefined) return '';

  if (field.kind === 'lines') {
    return Array.isArray(value) ? (value as unknown[]).map(String).join('\n') : '';
  }

  if (field.kind === 'pairs') {
    if (!Array.isArray(value)) return '';
    return (value as unknown[])
      .map((pair) => (Array.isArray(pair) ? `${pair[0] ?? ''} | ${pair[1] ?? ''}` : String(pair)))
      .join('\n');
  }

  return String(value);
}

/**
 * Form string -> the value written to the column.
 *
 * Empty text becomes null rather than an empty string so the public site's
 * `{field && ...}` checks keep working — an empty string is truthy in JSX and
 * would render a stray element.
 */
export function fromInput(field: Field, raw: FormDataEntryValue | null): unknown {
  if (field.kind === 'boolean') return raw === 'on' || raw === 'true';

  const text = String(raw ?? '').trim();

  if (field.kind === 'number') {
    if (!text) return 0;
    const n = Number(text);
    return Number.isFinite(n) ? n : 0;
  }

  if (field.kind === 'lines') {
    return text.split('\n').map((l) => l.trim()).filter(Boolean);
  }

  if (field.kind === 'pairs') {
    return text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const i = line.indexOf('|');
        // A line without a separator is still a label; better to keep it than
        // to silently drop what someone typed.
        if (i === -1) return [line, ''];
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      });
  }

  return text || null;
}

/** Lower-case, hyphenated, URL-safe. Used to derive an id from a slug. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
