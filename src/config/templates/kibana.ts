import type { Config } from './types';
import { securityLabels } from './security';

export const kibanaTemplate: Config = {
  repoName: 'kibana',
  excludedLabels: ['release_note:skip', 'Team:Docs', 'reverted', 'backport'],
  areas: [
    {
      title: 'Logstash',
      labels: ['Feature:Logstash Pipelines'],
    },
    {
      title: 'Management',
      labels: [
        'Feature:license',
        'Feature:Console',
        'Feature:Search Profiler',
        'Feature:watcher',
        'Feature:Index Patterns',
        'Feature:Data Views',
        'Feature:Kibana Management',
        'Feature:Dev Tools',
        'Feature:Inspector',
        'Feature:Index Management',
        'Feature:Snapshot and Restore',
        'Team:Elasticsearch UI',
        'Team:Stack Management',
        'Feature:FieldFormatters',
        'Feature:CCR',
        'Feature:ILM',
        'Feature:Transforms',
        'Feature:Search',
        'Project:AsyncSearch',
        'Feature:Upgrade Assistant',
      ],
    },
    {
      title: 'Monitoring',
      labels: ['Team:Monitoring', 'Feature:Telemetry', 'Feature:Stack Monitoring'],
    },
    {
      title: 'Operations',
      labels: ['Team:Operations', 'Feature:License'],
    },
    {
      title: 'Kibana UI',
      labels: ['Kibana UI', 'Team:Core UI', 'Feature:Header'],
    },
    {
      title: 'Platform',
      labels: [
        'Team:Core',
        'Feature:Plugins',
        'Feature:New Platform',
        'Project:i18n',
        'Feature:ExpressionLanguage',
        'Feature:Saved Objects',
        'Team:Stack Services',
        'Feature:NP Migration',
        'Feature:Task Manager',
        'Team:Pulse',
      ],
    },
    {
      title: 'Machine Learning',
      labels: [
        ':ml',
        'Feature:Anomaly Detection',
        'Feature:Data Frames',
        'Feature:File Data Viz',
        'Feature:ml-results',
        'Feature:Data Frame Analytics',
      ],
    },
    {
      title: 'Maps',
      labels: ['Team:Geo'],
    },
    {
      title: 'QA',
      labels: ['Team:QA'],
    },
    {
      title: 'Kibana security',
      labels: [
        'Team:Security',
        'Feature:Security/Spaces',
        'Feature:users and roles',
        'Feature:Security/Authentication',
        'Feature:Security/Authorization',
        'Feature:Security/Feature Controls',
        'Team:Security-Scalability',
      ],
    },
    {
      title: 'Canvas',
      labels: ['Feature:Canvas'],
    },
    {
      title: 'Dashboards and Visualizations',
      labels: [
        'Feature:Dashboard',
        'Feature:Drilldowns',
        'Project:TimeToVisualize',
        'Team:Presentation',
        'Feature:Lens',
        'Feature:Timelion',
        'Feature:TSVB',
        'Feature:Coordinate Map',
        'Feature:Region Map',
        'Feature:Vega',
        'Feature:Gauge Vis',
        'Feature:Tagcloud',
        'Feature:Vis Loader',
        'Feature:Vislib',
        'Feature:Vis Editor',
        'Feature:Aggregations',
        'Feature:Input Control',
        'Feature:Visualizations',
        'Feature:Markdown',
        'Feature:Data Table',
        'Feature:Heatmap',
        'Feature:Pie Chart',
        'Feature:XYAxis',
        'Feature:Graph',
        'Feature:New Feature',
        'Feature:MetricVis',
        'Team:Visualizations',
      ],
      options: {
        bracketHandling: 'visualizations',
      },
    },
    {
      title: 'Discover',
      labels: ['Feature:Discover', 'Team:DataDiscovery', 'Team:ESQL'],
    },
    {
      title: 'Querying & Filtering',
      labels: [
        'Feature:Query Bar',
        'Feature:Courier',
        'Feature:Filters',
        'Feature:Timepicker',
        'Feature:Highlight',
        'Feature:KQL',
        'Feature:Rollups',
        'Feature:Search',
        'Project:AsyncSearch',
      ],
    },
    {
      title: 'Reporting',
      labels: ['Feature:Reporting', 'Team:Reporting Services'],
    },
    {
      title: 'Sharing',
      labels: ['Feature:Embedding', 'Feature:SharingURLs'],
    },
    {
      title: 'Elastic Security solution',
      labels: securityLabels,
      options: {
        textOverwriteTemplate:
          'For the Elastic Security {{version}} release information, refer to {security-guide}/release-notes.html[_Elastic Security Solution Release Notes_].',
      },
    },
    {
      title: 'Code',
      labels: ['Team:Code'],
    },
    {
      title: 'Elastic Observability Solution',
      labels: [
        'Feature:Observability Home',
        'Feature:SLO',
        'Team:obs-ux-management',
        'Team:Obs AI Assistant',
        'Team:obs-ux-infra_services',
        'Team:obs-ux-logs',
        'Team:obs-knowledge',
        'Team:obs-entities',
        'ci:project-deploy-observability',
      ],
    },
    {
      title: 'Infrastructure',
      labels: ['Feature:Infra UI', 'Feature:Service Maps'],
    },
    {
      title: 'Logs',
      labels: ['Feature:Logs UI'],
    },
    {
      title: 'Uptime',
      labels: ['Feature:Uptime', 'Team:uptime'],
    },
    {
      title: 'Beats Management',
      labels: ['Feature:beats-cm', 'Team:Beats'],
    },
    {
      title: 'APM',
      labels: ['Team:apm', 'Team:APM'],
      priority: 100,
    },
    {
      title: 'Alerting',
      labels: ['Feature:Alerting', 'Team:Alerting Services', 'Feature:Actions', 'Team:ResponseOps'],
    },
    {
      title: 'Metrics',
      labels: ['Feature:Metrics UI', 'Team:logs-metrics-ui'],
    },
    {
      title: 'Data ingestion and Fleet',
      labels: ['Team:Fleet', 'Ingest', 'Feature:Ingest Node Pipelines'],
    },
    {
      title: 'Kibana platform',
      labels: [
        'Team:SharedUX',
        'Team:Design',
        'Project:Accessibility',
        'Feature:Add Data',
        'Feature:Home',
        'Team:Cloud',
      ],
    },
    {
      title: 'Elastic Search solution',
      labels: ['Team:Search'],
    },
  ],
  templates: {
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
} as const;
