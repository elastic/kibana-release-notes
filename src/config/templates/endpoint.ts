import type { Config } from './types';

export const endpointLabels = [
  'feature:hostisolation',
  'feature:memoryscan',
  'feature:harden',
  'feature:memoryprotection',
  'feature:comms',
  'feature:performance',
  'feature:malware',
  'feature:events',
  'feature:install',
  'feature:policy',
  'feature:ransomware',
  'feature:security',
  'feature:testing',
  'feature:rules',
  'feature:ASR',
  'feature:shipper',
  'feature:code_quality',
  'feature:false-positives',
  'feature:filescore',
  'feature:telemetry',
  'feature:agentintegration',
  'feature:user_experience',
];

export const endpointTemplate: Config = {
  repoName: 'endpoint-dev',
  includedLabels: endpointLabels,
  excludedLabels: ['backport', 'release_note:skip'],
  areas: [
    {
      title: 'Elastic Endpoint',
      labels: endpointLabels,
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
==== Bug fixes
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
};
