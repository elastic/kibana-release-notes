export const config = {
  excludedLabels: ['release_note:skip', 'Team:Docs', 'reverted', 'backport'],
  areas: [
    {
      title: 'Design',
      labels: ['Team:Design', 'Project:Accessibility'],
    },
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
        'Feature:Kibana Management',
        'Feature:Dev Tools',
        'Feature:Inspector',
        'Feature:Index Management',
        'Feature:Snapshot and Restore',
        'Team:Elasticsearch UI',
        'Feature:FieldFormatters',
        'Feature:CCR',
        'Feature:ILM',
        'Feature:Transforms',
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
      title: 'Security',
      labels: [
        'Team:Security',
        'Feature:Security/Spaces',
        'Feature:users and roles',
        'Feature:Security/Authentication',
        'Feature:Security/Authorization',
        'Feature:Security/Feature Controls',
      ],
    },
    {
      title: 'Canvas',
      labels: ['Feature:Canvas'],
    },
    {
      title: 'Dashboard',
      labels: ['Feature:Dashboard', 'Feature:Drilldowns'],
    },
    {
      title: 'Discover',
      labels: ['Feature:Discover'],
    },
    {
      title: 'Kibana Home & Add Data',
      labels: ['Feature:Add Data', 'Feature:Home'],
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
      title: 'Lens & Visualizations',
      labels: [
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
      ],
      options: {
        bracketHandling: 'visualizations',
      },
    },
    {
      title: 'Elastic Security',
      labels: [
        'Team:SIEM',
        'Team:SecuritySolution',
        'Team: SecuritySolution',
        'Team:Threat Hunting',
        'Team:Detections and Resp',
        'Team:Asset Management',
      ],
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
      labels: ['Team:apm'],
    },
    {
      title: 'Alerting',
      labels: ['Feature:Alerting', 'Team:Alerting Services', 'Feature:Actions'],
    },
    {
      title: 'Metrics',
      labels: ['Feature:Metrics UI', 'Team:logs-metrics-ui'],
    },
    {
      title: 'Data ingest',
      labels: ['Ingest', 'Feature:Ingest Node Pipelines'],
    },
    {
      title: 'Fleet',
      labels: ['Team:Fleet'],
    },
  ],
  templates: {
    pages: {
      releaseNotes: `[[release-notes-{{version}}]]
== {kib} {{version}}

coming::[{{version}}]

For information about the {kib} {{version}} release, review the following information.

{{#prs.breaking}}
[float]
[[breaking-changes-{{version}}]]
=== Breaking changes

Breaking changes can prevent your application from optiomal operation and performance.
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

For more information about the new features introduced in {{version}}, refer to !!TODO!!.

For detailed information about the {{version}} release, refer to <<enhancements-and-bug-fixes-v{{version}},Enhancements and bug fixes>>.

[[enhancements-and-bug-fixes-v{{version}}]]
{{^isPatchRelease}}=== Enhancements and bug fixes{{/isPatchRelease}}{{#isPatchRelease}}=== {kib} {{version}}{{/isPatchRelease}}

The {{version}} release includes the following {{#prs.enhancements}}enhancements and {{/prs.enhancements}}bug fixes.

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
=== Bug Fixes
{{{prs.fixes}}}
{{/prs.fixes}}
      `,
      patchReleaseNotes: `[[release-notes-{{version}}]]
== {kib} {{version}}

The {{version}} release includes the following bug fixes.

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
=== Bug Fixes
{{{prs.fixes}}}
{{/prs.fixes}}
      `,
    },
    prs: {
      breaking: `[discrete]
[[breaking-{{number}}]]
.{{{title}}}
[%collapsible]
====
*Details* +
!!TODO!! For more information, refer to {kibana-pull}{{number}}[#{{number}}]

*Impact* +
!!TODO!!
====
      `,
      deprecation: `[discrete]
[[deprecation-{{number}}]]
.{{{title}}}
[%collapsible]
====
*Details* +
!!TODO!! For more information, refer to {kibana-pull}{{number}}[#{{number}}]

*Impact* +
!!TODO!!
====
      `,
      _other_:
        '* {{{title}}} {kibana-pull}{{number}}[#{{number}}]{{#details}}\n////\n!!TODO!! The above PR had a lengthy release note description:\n{{{details}}}\n////{{/details}}',
    },
    prGroup: `{{{groupTitle}}}::\n{{{prs}}}`,
  },
} as const;
