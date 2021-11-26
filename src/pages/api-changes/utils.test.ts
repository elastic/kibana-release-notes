import { cleanupIssueTitle, extractContent, convertMarkdownToAsciidoc } from './utils';

describe('utils', () => {
  describe('cleanupIssueTitle', () => {
    it('should remove [bracket text] at the beginning', () => {
      expect(cleanupIssueTitle('[Search plugin] The real title')).toBe('The real title');
    });
  });

  describe('convertMarkdownToAsciidoc', () => {
    it('should convert markdown links to asciidoc', () => {
      expect(
        convertMarkdownToAsciidoc(
          'This is a text with a [link](http://example.com/foo) in the middle.'
        )
      ).toBe('This is a text with a http://example.com/foo[link] in the middle.');
      expect(convertMarkdownToAsciidoc('[Link](http://example.com/foo) in the beginning')).toBe(
        'http://example.com/foo[Link] in the beginning'
      );
      expect(convertMarkdownToAsciidoc('and one at the [end](http://example.com/foo)')).toBe(
        'and one at the http://example.com/foo[end]'
      );
      expect(convertMarkdownToAsciidoc('link at [end of line](http://example.com)\nnew line')).toBe(
        'link at http://example.com[end of line]\nnew line'
      );
      expect(
        convertMarkdownToAsciidoc(
          'convert also [multiple](http://example.com) links [in the same](http://example.com) string'
        )
      ).toBe(
        'convert also http://example.com[multiple] links http://example.com[in the same] string'
      );
    });

    it('should convert headers to bold text', () => {
      expect(convertMarkdownToAsciidoc('## Header text\nMore text')).toBe(
        '**Header text**\nMore text'
      );
      expect(
        convertMarkdownToAsciidoc('does not confuse ## hashes inside strings for headers')
      ).toBe('does not confuse ## hashes inside strings for headers');
      expect(
        convertMarkdownToAsciidoc('# convert\n## every\n### level of header\n#### in asciidoc')
      ).toBe('**convert**\n**every**\n**level of header**\n**in asciidoc**');
    });
  });

  describe('extractContent', () => {
    it('should extract simple content at the end', () => {
      const markdown = `
## Some issue

Lorem ipsum foo bar

# Dev-Docs

This should be extracted correctly.
      `;

      expect(extractContent(markdown)).toBe('This should be extracted correctly.');
    });

    it('should extract with another section after it', () => {
      const markdown = `
## Some issue

Lorem ipsum foo bar

### Dev-Docs

This should be extracted correctly.

### Another section

This should not be part anymore.
      `;

      expect(extractContent(markdown)).toBe('This should be extracted correctly.');
    });

    it('should extract with another higher section after it', () => {
      const markdown = `
## Some issue

Lorem ipsum foo bar

### Dev-Docs

This should be extracted correctly.

#### Including this

subsection

# Another section

This should not be part anymore.
      `;

      expect(extractContent(markdown)).toBe(
        `This should be extracted correctly.\n\n#### Including this\n\nsubsection`
      );
    });
  });
});
