import type { Config } from './types';

export const endpointTemplate: Config = {
  repoName: 'endpoint-dev',
  excludedLabels: ['backport', 'release_note:skip'],
  areas: [
    {
      title: 'Elastic Endpoint',
    },
  ],
  templates: {
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
      breaking: `*{{{title}}}*\n\n!!TODO!!\n`,
      deprecation: `*{{{title}}}*\n\n!!TODO!!\n`,
      _other_:
        '* {{{title}}}.' +
        '{{#details}}\n////\n!!TODO!! The above PR had a lengthy release note description:\n{{{details}}}\n////{{/details}}',
    },
  },
};
