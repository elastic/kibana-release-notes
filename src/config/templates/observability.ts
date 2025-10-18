import type { Config } from './types';
import { generateMarkdownTemplate, observabilityLabels } from './common';

export const observabilityTemplate: Config = {
  repoName: 'kibana',
  includedLabels: observabilityLabels,
  excludedLabels: ['backport', 'release_note:skip'],
  areas: [
    {
      title: 'Elastic Observability',
      labels: observabilityLabels,
    },
  ],
  templates: {
    asciidoc: {
      pages: {
        releaseNotes: `[discrete]
[[release-notes-{{version}}]]
=== {{version}}
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
    markdown: generateMarkdownTemplate({ name: 'elastic-observability' }),
  },
};
