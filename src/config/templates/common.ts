import { AreaDefinition } from '.';
import type { OutputTemplate, OutputTemplateOptions } from './types';

/*
 * We want this to render as {{str}} in the MD file to allow rendering again later in the docs pipeline.
 * So we change the tag delimiters temporarily
 **/
const createEscapedTag = (str: string) => `{{=<% %>=}}{{${str}}}<%={{ }}=%>`;
const kibPullTag = createEscapedTag('kib-pull');
export const kibanaPRMarkdownLink = `[#{{number}}](${kibPullTag}{{number}})`;

const getPatchMarkdownTemplate = ({ name }: OutputTemplateOptions) => {
  return `% FEATURES, ENHANCEMENTS, FIXES
% Paste in index.md

## {{version}} [${name}-{{version}}-release-notes]

% ::::{NOTE}
% ::::


{{#prs.featuresAndEnhancements}}
### Features and enhancements [${name}-{{version}}-features-enhancements]
{{{prs.featuresAndEnhancements}}}
{{/prs.featuresAndEnhancements}}


{{#prs.fixes}}
### Fixes [${name}-{{version}}-fixes]
{{{prs.fixes}}}
{{/prs.fixes}}`;
};

const getFullMarkdownTemplate = ({
  name,
  patchTemplate,
}: OutputTemplateOptions & { patchTemplate: string }) => {
  return (
    patchTemplate +
    `

{{#prs.breaking}}
% BREAKING CHANGES
% Paste in breaking-changes.md

## {{version}} [${name}-{{version}}-breaking-changes]
{{{prs.breaking}}}
{{/prs.breaking}}


{{#prs.deprecations}}
% DEPRECATIONS
% Paste in deprecations.md

## {{version}} [${name}-{{version}}-deprecations]
{{{prs.deprecations}}}
{{/prs.deprecations}}
`
  );
};

const getBreakingOrDeprecationPRTemplate = ({
  name,
  isBreaking,
}: OutputTemplateOptions & { isBreaking?: boolean }) => {
  return `$$$${name}-{{number}}$$$
::::{dropdown} {{{title}}} 
% **Details**<br> Description
% **Impact**<br> Impact of the ${isBreaking ? 'breaking change' : 'deprecation'}.
% **Action**<br> Steps for mitigating impact.
View ${kibanaPRMarkdownLink}.
::::`;
};

export const otherPRMarkdownTemplate =
  `* {{{title}}} ${kibanaPRMarkdownLink}.` +
  '{{#details}}\n% !!TODO!! The above PR had a lengthy release note description:\n% {{{details}}}{{/details}}';

const dynamicPRGroupTemplate = `{{#hasPRGroups}}\n\n**{{{groupTitle}}}**:\n{{{prs}}}{{/hasPRGroups}}{{^hasPRGroups}}{{{prs}}}{{/hasPRGroups}}`;

export const generateMarkdownTemplate = (options: OutputTemplateOptions): OutputTemplate => {
  const patchTemplate = getPatchMarkdownTemplate(options);

  return {
    pages: {
      releaseNotes: getFullMarkdownTemplate({ ...options, patchTemplate }),
      patchReleaseNotes: patchTemplate,
    },
    prs: {
      breaking: getBreakingOrDeprecationPRTemplate({ ...options, isBreaking: true }),
      deprecation: getBreakingOrDeprecationPRTemplate(options),
      _other_: otherPRMarkdownTemplate,
    },
    prGroup: dynamicPRGroupTemplate,
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
    title: 'Theme',
    labels: ['EUI'],
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
      'Feature:Data Views',
      'Feature:Kibana Management',
      'Feature:Dev Tools',
      'Feature:Inspector',
      'Feature:Index Management',
      'Feature:Streams',
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
      'Feature:Inference UI',
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
    title: 'ES|QL',
    labels: ['Team:ESQL'],
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
        'For the Elastic Security {{version}} release information, refer to [Elastic Security Solution Release Notes](docs-content://release-notes/elastic-security/index.md).',
    },
  },
  {
    title: 'Code',
    labels: ['Team:Code'],
  },
  {
    title: 'Elastic Observability solution',
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
      'Feature:Uptime',
      'Team:uptime',
      'Team:apm',
      'Team:APM',
      'Feature:Metrics UI',
      'Team:logs-metrics-ui',
      'Feature:Logs UI',
      'Feature:Infra UI',
      'Feature:Service Maps',
    ],
    options: {
      textOverwriteTemplate:
        'For the Elastic Observability {{version}} release information, refer to [Elastic Observability Solution Release Notes](docs-content://release-notes/elastic-observability/index.md).',
    },
  },
  {
    title: 'Beats Management',
    labels: ['Feature:beats-cm', 'Team:Beats'],
  },
  {
    title: 'Alerting',
    labels: ['Feature:Alerting', 'Team:Alerting Services', 'Feature:Actions', 'Team:ResponseOps'],
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
    title: 'Search',
    labels: ['Team:Search'],
  },
];
