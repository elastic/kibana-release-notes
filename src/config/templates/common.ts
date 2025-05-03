import { AreaDefinition } from '.';
import type { OutputTemplate, OutputTemplateOptions } from './types';

const createEscapedTag = (str: string) => `{{=<% %>=}}{{${str}}}<%={{ }}=%>`;
export const kibPullTag = createEscapedTag('kib-pull');

export const generateMarkdownTemplate = ({
  name,
  navigationTitle,
  templateNameTag = name,
  urlPath = name,
}: OutputTemplateOptions): OutputTemplate => {
  // We want this to render as {{kib}} etc in the MD file, so we change the tag delimiters temporarily
  const escapedTemplateNameTag = createEscapedTag(templateNameTag);

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

{{#prs.breaking}}
---
navigation_title: "Breaking changes"
mapped_pages:
  - https://www.elastic.co/guide/en/${urlPath}/current/breaking-changes-summary.html
---
# ${escapedTemplateNameTag} breaking changes [${name}-breaking-changes]
Breaking changes can impact your Elastic applications, potentially disrupting normal operations. Before you upgrade, carefully review the ${escapedTemplateNameTag} breaking changes and take the necessary steps to mitigate any issues. To learn how to upgrade, check [Upgrade](/deploy-manage/upgrade.md).

% ## Next version [${name}-next-breaking-changes]

## {{version}} [${name}-{{versionWithoutPeriods}}-breaking-changes]
{{{prs.breaking}}}
{{/prs.breaking}}


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
      breaking: `\n\n::::{dropdown} {{{title}}} 
% !!TODO!! Description of the breaking change.
For more information, check [#{{number}}](${kibPullTag}{{number}}).
% !!TODO!! **Impact**<br> Impact of the breaking change.
% !!TODO!! **Action**<br> Steps for mitigating deprecation impact.
::::`,
      deprecation: `\n\n::::{dropdown} {{{title}}}
% !!TODO!! Description of the deprecation.
For more information, refer to [#{{number}}](${kibPullTag}{{number}}).
% !!TODO!! **Impact**<br> Impact of deprecation.
% !!TODO!! **Action**<br> Steps for mitigating deprecation impact.
::::`,
      _other_:
        `* {{{title}}} [#{{number}}](${kibPullTag}{{number}}).` +
        '{{#details}}\n% !!TODO!! The above PR had a lengthy release note description:\n% {{{details}}}{{/details}}',
    },
    prGroup: `{{#hasPRGroups}}\n\n**{{{groupTitle}}}**:\n{{{prs}}}{{/hasPRGroups}}{{^hasPRGroups}}{{{prs}}}{{/hasPRGroups}}`,
  };
};

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

export const kibanaAreas: AreaDefinition[] = [
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
];
