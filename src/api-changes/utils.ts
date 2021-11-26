const DEVDOC_REGEX = /(#+) (?:Dev[- ]?Docs?|(?:Plugin)?[- ]?API[- ]?(?:Changes)?)\s+([\S\s]*)/i;

export function cleanupIssueTitle(title: string) {
  return title.replace(/^\[[^\]]+]\s*/g, '');
}

/**
 * Cleans up the markdown text.
 *
 * This will check if the PR checklist made it into the text, and remove it in case.
 * It replaces all occurances of "Kibana" with {kib} which is used in our doc system instead.
 */
export function cleanupMarkdown(markdown: string | null) {
  if (!markdown) return markdown;
  return markdown.replace(/\n### Checklist[\S\s]*/g, '').replace(/(\s)Kibana(\s)/gi, '$1{kib}$2');
}

export function convertMarkdownToAsciidoc(markdown: string | null) {
  if (!markdown) return markdown;
  return (
    markdown
      // Replace markdown links with asciidoc links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$2[$1]')
      // replace headers with bold text
      .replace(/^#{1,6}\s*(.*)$/gm, '**$1**')
  );
}

export function extractContent(body: string) {
  const match = DEVDOC_REGEX.exec(body);
  if (!match) {
    return null;
  }

  const [, headerLevel, text] = match;

  // Remove all text from the next header at the same or a higher level than the Dev-Docs header was
  return text.replace(new RegExp(`^#{1,${headerLevel.length}} [\\s\\S]*`, 'img'), '').trim();
}
