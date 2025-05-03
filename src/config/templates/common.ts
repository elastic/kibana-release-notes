import type { OutputTemplate, OutputTemplateOptions } from './types';

const createEscapedTag = (str: string) => `{{=<% %>=}}{{${str}}}<%={{ }}=%>`;

export const generateMarkdownTemplate = ({
  name,
  navigationTitle,
  templateNameTag = name,
  urlPath = name,
}: OutputTemplateOptions): OutputTemplate => {
  // We want this to render as {{kib}} etc in the MD file, so we change the tag delimiters temporarily
  const escapedTemplateNameTag = createEscapedTag(templateNameTag);
  const kibPullTag = createEscapedTag('kib-pull');

  const patchTemplate = `---
navigation_title: "${navigationTitle}"
mapped_pages:
  - https://www.elastic.co/guide/en/${urlPath}/current/release-notes.html
  - https://www.elastic.co/guide/en/${urlPath}/current/whats-new.html
  - https://www.elastic.co/guide/en/${urlPath}/master/release-notes-{{version}}.html
  - https://www.elastic.co/guide/en/${urlPath}/master/enhancements-and-bug-fixes-v{{version}}.html
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


{{#prs.enhancements}}
{{#prs.features}}
### Features and enhancements [${name}-{{versionWithoutPeriods}}-features-enhancements]
{{{prs.features}}}
{{/prs.features}}
{{{prs.enhancements}}}
{{/prs.enhancements}}


{{#prs.fixes}}
### Fixes [${name}-{{versionWithoutPeriods}}-fixes]
{{{prs.fixes}}}
{{/prs.fixes}}`;

  return {
    pages: {
      releaseNotes:
        patchTemplate +
        `

{{#prs.deprecations}}
---
navigation_title: "Deprecations"
---

# ${escapedTemplateNameTag} deprecations [${name}-deprecations]
Over time, certain Elastic functionality becomes outdated and is replaced or removed. To help with the transition, Elastic deprecates functionality for a period before removal, giving you time to update your applications.

Review the deprecated functionality for ${escapedTemplateNameTag}. While deprecations have no immediate impact, we strongly encourage you update your implementation after you upgrade. To learn how to upgrade, check out [Upgrade](docs-content://deploy-manage/upgrade.md).

% ## Next version [${name}-next-deprecations]

## {{version}} [${name}-{{versionWithoutPeriods}}-deprecations]

{{{prs.deprecations}}}
{{/prs.deprecations}}
`,
      patchReleaseNotes: patchTemplate,
    },
    prs: {
      breaking: ``,
      deprecation: `\n\n::::{dropdown} {{{title}}}
% !!TODO!! Description of the deprecation.
For more information, refer to [#{{number}}](${kibPullTag}{{number}}).
**Impact**<br> Impact of deprecation.
**Action**<br> Steps for mitigating deprecation impact.
::::`,
      _other_:
        `* {{{title}}} [#{{number}}](${kibPullTag}{{number}}).` +
        '{{#details}}\n% !!TODO!! The above PR had a lengthy release note description:\n% {{{details}}}\n{{/details}}',
    },
    prGroup: `{{#hasPRGroups}}\n\n**{{{groupTitle}}}**:\n{{{prs}}}{{/hasPRGroups}}{{^hasPRGroups}}{{{prs}}}{{/hasPRGroups}}`,
  };
};
