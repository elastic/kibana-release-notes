import type { Config } from '../config';

export const securityLabels = [
  'Team:SIEM',
  'Team:SecuritySolution',
  'Team: SecuritySolution',
  'Team:Threat Hunting',
  'Team:Detections and Resp',
  'Team:Asset Management',
  'Team:Onboarding and Lifecycle Mgt',
  'Feature:Timeline',
  'Feature:Detection Rules',
  'Feature:Detection Alerts',
  'Team: CTI',
  'Team:CTI',
];

export const securityTemplate: Config = {
  template: 'security',
  excludedLabels: [
    'release_note:skip',
    'Team:KibanaApp',
    'Team:AppServices',
    'Team:Fleet',
    'Team:apm',
    'Team:logs-metrics-ui',
    'Team:Geo',
    'Team:uptime',
    'Team:Elasticsearch UI',
    'Team:Presentation',
    ':ml',
    'Team:Docs',
    'Team:Alerting Services',
    'Team:Core',
    'Team:Security',
    'Team:Operations',
    'Team:Monitoring',
  ],
  areas: [
    {
      title: 'Elastic Security',
      labels: securityLabels,
    },
  ],
  templates: {
    pages: {
      releaseNotes: `[discrete]
[[release-notes-{{version}}]]
== {{version}}
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
==== Features
{{{prs.features}}}
{{/prs.features}}
{{#prs.enhancementsAndFixes}}

[discrete]
[[bug-fixes-{{version}}]]
==== Bug fixes and enhancements
{{{prs.enhancementsAndFixes}}}
{{/prs.enhancementsAndFixes}}
`,
    },
    prGroup: '{{{prs}}}',
    prs: {
      breaking: `*{{{title}}}*\n\n!!TODO!!\n\nSee ({pull}{{number}}[#{{number}}]) for details.\n`,
      deprecation: `*{{{title}}}*\n\n!!TODO!!\n\nSee ({pull}{{number}}[#{{number}}]) for details.\n`,
      _other_:
        '* {{{title}}} {kibana-pull}{{number}}[#{{number}}]{{#details}}\n////\n!!TODO!! The above PR had a lengthy release note description:\n{{{details}}}\n////{{/details}}',
    },
  },
};
