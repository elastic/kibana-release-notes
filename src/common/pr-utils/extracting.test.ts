import { PrItem } from '../github-service';
import { normalizeTitle, findReleaseNote, extractReleaseNotes } from './extracting';

describe('extraction tools', () => {
  describe('normalizeTitle', () => {
    it('should remove versions in brackets', () => {
      expect(normalizeTitle('[7.12] With a pr title [8.12.0] or at the end [10.2]')).toBe(
        'With a pr title or at the end'
      );
    });

    it('should remove linked issue numbers', () => {
      expect(normalizeTitle('Add a new feature (#7213)')).toBe('Adds a new feature');
      expect(normalizeTitle('#123 fixing bug')).toBe('Fixing bug');
    });

    it('should remove trailing/leading non word characters', () => {
      expect(normalizeTitle(' - Fix something: ')).toBe('Fixes something');
    });

    it('should strip all bracket content', () => {
      expect(normalizeTitle('[ML] Some machine learning', { bracketHandling: 'strip' })).toBe(
        'Some machine learning'
      );
      // strip should also be the default setting
      expect(normalizeTitle('[ML] Some machine learning')).toBe('Some machine learning');
    });

    it('should keep bracket content when configured', () => {
      expect(normalizeTitle('[ML] Some machine learning', { bracketHandling: 'keep' })).toBe(
        '[ML] Some machine learning'
      );
    });

    it('should capitalize the first letter', () => {
      expect(normalizeTitle('adds a new feature')).toBe('Adds a new feature');
    });

    it('should strip of points at the end of the release note', () => {
      expect(normalizeTitle('Adds a new feature to Lens.')).toBe('Adds a new feature to Lens');
    });

    it('should handle visualization brackets correctly', () => {
      expect(normalizeTitle('[TSVB] Add feature xyz', { bracketHandling: 'visualizations' })).toBe(
        'Adds feature xyz in *TSVB*'
      );
      // Does only handle known visualization tools
      expect(normalizeTitle('[Tool] An unknown tool', { bracketHandling: 'visualizations' })).toBe(
        'An unknown tool'
      );
      // It does not duplicate an already existing "in {tool}"
      expect(
        normalizeTitle('[TSVB] Add runtime fields to TSVB', { bracketHandling: 'visualizations' })
      ).toBe('Adds runtime fields to *TSVB*');
    });

    it('should handle add/fix at the beginning', () => {
      expect(normalizeTitle('Add something to add a new thing')).toBe(
        'Adds something to add a new thing'
      );
      expect(normalizeTitle('fix something to fix a new thing')).toBe(
        'Fixes something to fix a new thing'
      );
    });
  });

  describe('findReleaseNotes', () => {
    it('should extract in paragraph release notes', () => {
      expect(
        findReleaseNote(`
        # Title

        Release Notes: This is the extracted sentence.

        Next paragraph
      `)
      ).toBe('This is the extracted sentence.');
    });

    it('should extract the full paragraph', () => {
      expect(
        findReleaseNote(`
# Title

Release Notes: This release note details is spanning
multiple lines, but all should be extracted.

Next paragraph
      `)
      ).toBe('This release note details is spanning\nmultiple lines, but all should be extracted.');
    });

    it('should extract from using a release note header', () => {
      expect(
        findReleaseNote(`
          ## Summary
          This is the short summary of the PR.
          
          ## Release Note
          Extract this please
          
          ### Checklist
          A regular PR checklist
      `)
      ).toBe('Extract this please');
    });

    it('should extract different variations of the label release notes', () => {
      expect(findReleaseNote('Release Notes: This is the extracted sentence.')).toBe(
        'This is the extracted sentence.'
      );
      expect(findReleaseNote('Release-Notes: This is the extracted sentence.')).toBe(
        'This is the extracted sentence.'
      );
      expect(findReleaseNote('release notes: This is the extracted sentence.')).toBe(
        'This is the extracted sentence.'
      );
      expect(findReleaseNote('Release Note: This is the extracted sentence.')).toBe(
        'This is the extracted sentence.'
      );
      expect(findReleaseNote('Release Notes - This is the extracted sentence.')).toBe(
        'This is the extracted sentence.'
      );
    });
  });

  describe('extractReleaseNotes', () => {
    it('should work for complex visualizations example', () => {
      const actual = extractReleaseNotes(
        {
          title: '[TSVB] Adds feature to TSVB (#123)',
          body: `
      Some paragraphs explaining the features.

      Release Notes: Adds cool feature
      `,
        } as PrItem,
        { bracketHandling: 'visualizations' }
      );

      expect(actual.type).toBe('releaseNoteTitle');
      expect(actual.title).toBe('Adds cool feature in *TSVB*');
    });
  });
});
