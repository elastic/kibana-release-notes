import type { OutputTemplate, OutputTemplateOptions } from './types';

const createEscapedTag = (str: string) => `{{=<% %>=}}{{${str}}}<%={{ }}=%>`;

export const markdownCommonTemplate = ({
  name,
  navigationTitle,
  templateNameTag = name,
  url_path = name,
}: OutputTemplateOptions): OutputTemplate => {
  // We want this to render as {{kib}} etc in the MD file, so we change the tag delimiters temporarily
  const escapedTemplateNameTag = createEscapedTag(templateNameTag);
  const kibPullTag = createEscapedTag('kib-pull');

  return {
    pages: {
      releaseNotes: `---
navigation_title: "${navigationTitle}"
mapped_pages:
  - https://www.elastic.co/guide/en/${url_path}/current/release-notes.html
  - https://www.elastic.co/guide/en/${url_path}/current/whats-new.html
  - https://www.elastic.co/guide/en/${url_path}/master/release-notes-{{version}}.html
  - https://www.elastic.co/guide/en/${url_path}/master/enhancements-and-bug-fixes-v{{version}}.html
---

# ${escapedTemplateNameTag} release notes [${name}-release-notes]

Review the changes, fixes, and more in each version of ${escapedTemplateNameTag}.

To check for security updates, go to [Security announcements for the Elastic stack](https://discuss.elastic.co/c/announcements/security-announcements/31).

% Release notes include only features, enhancements, and fixes. Add breaking changes, deprecations, and known issues to the applicable release notes sections.

% ## version.next [${name}-next-release-notes]

% ### Features and enhancements [${name}-next-features-enhancements]
% *

% ### Fixes [${name}-next-fixes]
% *

## {{version}} [${name}-{{versionWithoutPeriods}}-release-notes]

::::{NOTE}

::::


### Features and enhancements [${name}-{{versionWithoutPeriods}}-features-enhancements]

{{#prs.features}}
{{{prs.features}}}
{{/prs.features}}
{{#prs.enhancements}}
{{{prs.enhancements}}}
{{/prs.enhancements}}


### Fixes [${name}-{{versionWithoutPeriods}}-fixes]

{{#prs.fixes}}
{{{prs.fixes}}}
{{/prs.fixes}}
`,
      patchReleaseNotes: ``,
    },
    prs: {
      breaking: ``,
      deprecation: ``,
      _other_:
        `* {{{title}}} [#{{number}}](${kibPullTag}{{number}}).` +
        '{{#details}}\n////\n!!TODO!! The above PR had a lengthy release note description:\n{{{details}}}\n////{{/details}}',
    },
    prGroup: `**{{{groupTitle}}}**:\n{{{prs}}}\n`,
  };
};
