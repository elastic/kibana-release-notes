import { Config } from '../../config';
import { PrItem } from '../github-service';

export type NormalizeOptions = Config['areas'][number]['options'];

function capitalize([first, ...rest]: string): string {
  return `${first.toUpperCase()}${rest.join('')}`;
}

const VISUALIZE_TOOLS = ['lens', 'tsvb', 'vislib', 'timelion', 'vega'];

function visualizationBracketHandling(title: string): string {
  const match = title.match(/\s*\[([^\]]+)\]\s*(.*)/i);
  if (!match) {
    return title;
  }
  if (VISUALIZE_TOOLS.includes(match[1].toLowerCase())) {
    return `${match[2]} in *${match[1]}*`;
  }
  return match[2];
}

/**
 * This function will normalize the title of a PR, i.e. applies all modifications to it
 * every PR should get (no matter a specific config). These include:
 *
 * - Stripping of all versions in brackets
 * - All issue numbers mentioned in the title
 */
export function normalizeTitle(title: string, options: NormalizeOptions = {}): string {
  let normalized = title
    .replace(/\s*\[\d+\.\d+(\.\d+)?\]\s*/gi, ' ')
    .replace(/\s*\(?#\d{2,}\)?\s*/g, ' ');

  if (options.bracketHandling === 'strip' || !options.bracketHandling) {
    normalized = normalized.replace(/\s*\[[^\]]+\]\s*/gi, ' ');
  } else if (options.bracketHandling === 'visualizations') {
    normalized = visualizationBracketHandling(normalized);
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

/**
 * Finds and retrieves the actual "release note" details from a PR description (in markdown format).
 * It will look for:
 * - paragraphs beginning with release note (or slight variations of that) and the sentence till the end of line.
 */
export function findReleaseNote(markdown: string): string | undefined {
  const match = markdown.match(/(?:\n|^)\s*release[\s-]?notes?[\s\W]+(.*?)(?:(\r?\n|\r){2}|$)/is);
  return match?.[1] ?? undefined;
}

export type ReleaseNoteDetails =
  | { type: 'title'; title: string }
  | { type: 'releaseNoteTitle'; title: string; originalTitle: string }
  | { type: 'releaseNoteDetails'; title: string; details: string };

export function extractReleaseNotes(
  pr: PrItem,
  options: NormalizeOptions = { bracketHandling: 'strip' }
): ReleaseNoteDetails {
  const releaseNote = findReleaseNote(pr.body);

  // If the PR did not have any release note in its description just return the normalized title.
  if (!releaseNote) {
    return { type: 'title', title: normalizeTitle(pr.title, options) };
  }

  // If the release note details in the PR is too long we'll handle it as a description, and not replace
  // the title with it, but put it additionally in the release note, so tech writers can compress it.
  if (releaseNote.length > 120 || releaseNote.includes('\n')) {
    return {
      type: 'releaseNoteDetails',
      title: normalizeTitle(pr.title, options),
      details: releaseNote,
    };
  }

  return { type: 'releaseNoteTitle', title: releaseNote, originalTitle: pr.title };
}
