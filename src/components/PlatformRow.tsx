import { Icon } from './Icon';
import { BRANDS } from './brands';

/**
 * The platform row under the hero.
 *
 * Brand marks in their own colours with the name beside them, rather than the
 * bordered chips this used to be — a logo row reads as "these are real tools we
 * work in", where identical pills read as tags.
 *
 * Names come from site.platforms, so the row still follows the data; anything
 * without a mark falls back to the wordmark alone, which is what OpenAI does.
 */
export function PlatformRow({ platforms }: { platforms: string[] }) {
  return (
    <ul className="platform-row">
      {platforms.map((name) => {
        const brand = BRANDS[name];
        return (
          <li key={name}>
            <span className="platform-mark" style={{ color: brand?.hex ?? 'var(--ink)' }}>
              {brand?.path ? (
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path d={brand.path} fill="currentColor" />
                </svg>
              ) : (
                <Icon name="bot" />
              )}
            </span>
            <span className="platform-name">{name}</span>
          </li>
        );
      })}
    </ul>
  );
}
