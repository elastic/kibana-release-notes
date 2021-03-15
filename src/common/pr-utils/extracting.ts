import { Config } from '../../config';

export type NormalizeOptions = Config['areas'][number]['options'];

function capitalize([first, ...rest]: string): string {
  return `${first.toUpperCase()}${rest.join('')}`;
}

/**
 * This function will normalize the title of a PR, i.e. applies all modifications to it
 * every PR should get (no matter a specific config). These include:
 *
 * - Stripping of all versions in brackets
 * - All issue numbers mentioned in the title
 */
export function normalizeTitle(
  title: string,
  options: NormalizeOptions = { bracketHandling: 'strip' }
): string {
  let normalized = title
    .replace(/\s*\[\d+\.\d+(\.\d+)?\]\s*/gi, ' ')
    .replace(/\s*\(?#\d{2,}\)?\s*/g, ' ');

  if (options.bracketHandling === 'strip' || !options.bracketHandling) {
    normalized = normalized.replace(/\s*\[[^\]]+\]\s*/gi, ' ');
  }

  return capitalize(
    normalized
      // Remove some special trailing/leading non word characters, mostly left over from messages we stripped something
      // in the front/end
      .replace(/^[\s-:]*/g, '')
      .replace(/[\s-:]+$/g, '')
      // Replace duplicate whitespace (most likely introduced by some removal above) by a single space
      .replace(/\s{2,}/g, ' ')
      // Trim the title
      .trim()
  );
}
