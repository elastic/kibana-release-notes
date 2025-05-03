import type { Config } from './types';
import { generateMarkdownTemplate, kibanaAreas } from './common';

export const kibanaTemplate: Config = {
  repoName: 'kibana',
  excludedLabels: ['release_note:skip', 'Team:Docs', 'reverted', 'backport'],
  areas: kibanaAreas,
  templates: {
    asciidoc: {
      pages: {
        releaseNotes: `[[release-notes-{{version}}]]
== {kib} {{version}}

coming::[{{version}}]

Review the following information about the {kib} {{version}} release.

{{#prs.breaking}}
[float]
[[breaking-changes-{{version}}]]
=== Breaking changes

Breaking changes can prevent your application from optimal operation and performance.
Before you upgrade to {{version}}, review the breaking changes, then mitigate the impact to your application.

{{{prs.breaking}}}
{{/prs.breaking}}
{{#prs.deprecations}}
[float]
[[deprecations-{{version}}]]
=== Deprecations

The following functionality is deprecated in {{version}}, and will be removed in {{nextMajorVersion}}.
Deprecated functionality does not have an immediate impact on your application, but we strongly recommend
you make the necessary updates after you upgrade to {{version}}.

{{{prs.deprecations}}}
{{/prs.deprecations}}
{{#prs.features}}
[float]
[[features-{{version}}]]
=== Features
{kib} {{version}} adds the following new and notable features.

{{{prs.features}}}
{{/prs.features}}

For more information about the features introduced in {{version}}, refer to <<whats-new,What's new in {{minorVersion}}>>.

[[enhancements-and-bug-fixes-v{{version}}]]
{{^isPatchRelease}}=== Enhancements and fixes{{/isPatchRelease}}{{#isPatchRelease}}=== {kib} {{version}}{{/isPatchRelease}}

For detailed information about the {{version}} release, review the enhancements and fixes.

{{#prs.breaking}}
[float]
[[breaking-v{{version}}]]
=== Breaking
{{{prs.breaking}}}

{{/prs.breaking}}
{{#prs.deprecations}}
[float]
[[deprecation-v{{version}}]]
=== Deprecations
{{{prs.deprecations}}}

{{/prs.deprecations}}
{{#prs.enhancements}}
[float]
[[enhancement-v{{version}}]]
=== Enhancements
{{{prs.enhancements}}}

{{/prs.enhancements}}
{{#prs.fixes}}
[float]
[[fixes-v{{version}}]]
=== Fixes
{{{prs.fixes}}}
{{/prs.fixes}}
      `,
        patchReleaseNotes: `[[release-notes-{{version}}]]
== {kib} {{version}}

The {{version}} release includes the following fixes.

{{#prs.enhancements}}
[float]
[[enhancement-v{{version}}]]
=== Enhancements
{{{prs.enhancements}}}

{{/prs.enhancements}}
{{#prs.fixes}}
[float]
[[fixes-v{{version}}]]
=== Fixes
{{{prs.fixes}}}
{{/prs.fixes}}
      `,
      },
      prs: {
        breaking: `[discrete]
[[breaking-{{number}}]]
* {{{title}}}.
[%collapsible]
====
*Details* +
!!TODO!!

*Impact* +
!!TODO!!

View ({kibana-pull}{{number}}[#{{number}}])
====
      `,
        deprecation: `[discrete]
[[deprecation-{{number}}]]
* {{{title}}}.
[%collapsible]
====
*Details* +
!!TODO!!

*Impact* +
!!TODO!!

View ({kibana-pull}{{number}}[#{{number}}])
====
      `,
        _other_:
          '* {{{title}}} ({kibana-pull}{{number}}[#{{number}}]).' +
          '{{#details}}\n////\n!!TODO!! The above PR had a lengthy release note description:\n{{{details}}}\n////{{/details}}',
      },
      prGroup: `{{{groupTitle}}}::\n{{{prs}}}`,
    },
    markdown: generateMarkdownTemplate({
      navigationTitle: 'Kibana',
      name: 'kibana',
      templateNameTag: 'kib',
    }),
  },
} as const;
