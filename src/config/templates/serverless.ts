import type { Config } from './types';
import { kibanaAreas, kibanaPRMarkdownLink, otherPRMarkdownTemplate } from './common';

const serverlessBreakingOrDeprecationTemplate = `* {{{title}}} For more information, refer to ${kibanaPRMarkdownLink}.\n`;
const serverlessReleaseNotesTemplate = `## {{serverlessReleaseDate}} [serverless-changelog-{{version}}]

{{#prs.features}}
### Features and enhancements [serverless-changelog-{{version}}-features-enhancements]

{{{prs.features}}}
{{/prs.features}}
{{#prs.enhancements}}
{{{prs.enhancements}}}
{{/prs.enhancements}}


{{#prs.fixes}}
### Fixes [serverless-changelog-{{version}}-fixes]

{{{prs.fixes}}}
{{/prs.fixes}}


{{#prs.breaking}}
# {{serverlessReleaseDate}} [elastic-cloud-serverless-{{version}}-breaking]
{{{prs.breaking}}}
{{/prs.breaking}}


{{#prs.deprecations}}
# {{serverlessReleaseDate}} [elastic-cloud-serverless-{{version}}-deprecations]
{{{prs.deprecations}}}
{{/prs.deprecations}}
`;

export const serverlessTemplate: Config = {
  repoName: 'kibana',
  excludedLabels: ['backport', 'release_note:skip', 'reverted'],
  areas: kibanaAreas.map((area) => {
    // Remove the textOverwriteTemplate option from Security and Observability solutions
    if (area.options && 'textOverwriteTemplate' in area.options) {
      const { textOverwriteTemplate, ...restOptions } = area.options;
      return { ...area, options: restOptions };
    }
    return area;
  }),
  templates: {
    asciidoc: {
      pages: {
        releaseNotes: `[discrete]
[[release-notes-{{version}}]]
=== {{serverlessReleaseDate}}
{{#prs.breaking}}

[discrete]
[[breaking-changes-{{version}}]]
==== Breaking changes
{{{prs.breaking}}}
{{/prs.breaking}}
{{#prs.deprecations}}

[discrete]
[[deprecations-{{version}}]]
==== Deprecations
{{{prs.deprecations}}}
{{/prs.deprecations}}
{{#prs.features}}

[discrete]
[[features-{{version}}]]
==== New features
{{{prs.features}}}
{{/prs.features}}
{{#prs.enhancements}}

[discrete]
[[enhancements-{{version}}]]
==== Enhancements
{{{prs.enhancements}}}
{{/prs.enhancements}}
{{#prs.fixes}}

[discrete]
[[bug-fixes-{{version}}]]
==== Fixes
{{{prs.fixes}}}
{{/prs.fixes}}

`,
      },
      prGroup: '{{{prs}}}',
      prs: {
        breaking: `*{{{title}}}*\n\n!!TODO!!\n\nSee ({kibana-pull}{{number}}[#{{number}}]) for details.\n`,
        deprecation: `*{{{title}}}*\n\n!!TODO!!\n\nSee ({kibana-pull}{{number}}[#{{number}}]) for details.\n`,
        _other_:
          '* {{{title}}} ({kibana-pull}{{number}}[#{{number}}]).' +
          '{{#details}}\n////\n!!TODO!! The above PR had a lengthy release note description:\n{{{details}}}\n////{{/details}}',
      },
    },
    markdown: {
      pages: {
        releaseNotes: serverlessReleaseNotesTemplate,
      },
      prGroup: '{{{prs}}}',
      prs: {
        breaking: serverlessBreakingOrDeprecationTemplate,
        deprecation: serverlessBreakingOrDeprecationTemplate,
        _other_: otherPRMarkdownTemplate,
      },
    },
  },
};
