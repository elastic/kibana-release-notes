import type { Config } from './types';

export const securityLabels = [
  'Team:SIEM',
  'Team:SecuritySolution',
  'Team: SecuritySolution',
  'Team:Endpoint Response',
  'Team:Entity Analytics',
  'Team:Security Generative AI',
  'Team:Threat Hunting',
  'Team:Threat Hunting:Explore',
  'Team:Threat Hunting:Investigations',
  'Team:Detections and Resp',
  'Team:Asset Management',
  'Team:Onboarding and Lifecycle Mgt',
  'Team:Security Solution Platform',
  'Team:Detection Alerts',
  'Team: CTI',
  'Team:CTI',
  'Team:Threat Hunting:Cases',
  'Team:Cloud Security',
  'Team:Detection Engine',
  'Team:Defend Workflows',
  'Team:Detection Rules',
  'Team:Security-Scalability',
  'Feature:Timeline',
  'Feature:Detection Rules',
  'Feature:Detection Alerts',
  'Feature:Entity Analytics',
  'Feature:Rule Exceptions',
  'Feature:AutomaticImport',
];

export const securityTemplate: Config = {
  repoName: 'kibana',
  includedLabels: securityLabels,
  excludedLabels: ['backport', 'release_note:skip'],
  areas: [
    {
      title: 'Elastic Security',
      labels: securityLabels,
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
    markdown: {
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
  },
};
