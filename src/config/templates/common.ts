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
  isPrivate,
  isBreaking,
}: OutputTemplateOptions & { isBreaking?: boolean }) => {
  return `$$$${name}-{{number}}$$$
::::{dropdown} {{{title}}} 
% **Details**<br> Description
% **Impact**<br> Impact of the ${isBreaking ? 'breaking change' : 'deprecation'}.
% **Action**<br> Steps for mitigating impact.
${isPrivate ? '' : 'View ' + kibanaPRMarkdownLink}.
::::`;
};

export const getOtherPRMarkdownTemplate = ({ isPrivate }: { isPrivate?: boolean } = {}) =>
  `* {{{title}}}${isPrivate ? '' : ' ' + kibanaPRMarkdownLink}.` +
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
      _other_: getOtherPRMarkdownTemplate(options),
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
  'Team:Detection Rule Management',
  'Team:Detection Engineering',
  'Team:Security Deployment',
  'Team:Automatic Migrations',
  'Feature:SIEMMigrations',
  'Feature:Timeline',
  'Feature:Detection Rules',
  'Feature:Detection Alerts',
  'Feature:Entity Analytics',
  'Feature:Endpoint',
  'Feature:Rule Exceptions',
  'Feature:AutomaticImport',
  'Feature:Event Correlation (EQL) Rule',
  'Feature:Security ML Jobs',
];

export const observabilityLabels = [
  'Feature:Observability Home',
  'Feature:SLO',
  'Team:obs-ux-management',
  'Team:nightshift-context-and-research',
  'Team:obs-ux-infra_services - DEPRECATED',
  'Team:obs-ux-logs',
  'Team:obs-onboarding',
  'Team:obs-knowledge',
  'Team:obs-entities',
  'Feature:Uptime',
  'Team:uptime',
  'Team:apm',
  'Team:APM',
  'Feature:Metrics UI',
  'Team:logs-metrics-ui',
  'Feature:Logs UI',
  'Feature:Infra UI',
  'Feature:Service Maps',
  'Team:actionable-obs',
  'Team:obs-exploration',
  'Team:obs-presentation',
  'Team:obs-ai',
  'Team:Observability',
  'author:actionable-obs',
  'Feature:Streams',
  'Team:streams-ui',
  'Feature:SigEvents',
  'Team:obs-ai - DEPRECATED',
];

export const kibanaAreas: AreaDefinition[] = [
  {
    title: 'Logstash',
    labels: ['Feature:Logstash Pipelines'],
  },
  {
    title: 'Agent Builder',
    labels: ['Team:agent-builder', 'feature:agent-builder'],
    priority: 20,
  },
  {
    title: 'Machine learning and inference',
    labels: [
      ':ml',
      'Team:AI Infra',
      'Feature:Anomaly Detection',
      'Feature:Data Frames',
      'Feature:File Data Viz',
      'Feature:ml-results',
      'Feature:Data Frame Analytics',
      'Feature:Inference UI',
      'Feature:ML/AIOps',
    ],
    priority: 10,
  },
  {
    title: 'Workflows',
    labels: ['Team:One Workflow'],
    priority: 10,
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
    title: 'Connectivity',
    labels: ['Feature:Actions/ConnectorTypes'],
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
      'Feature:MetricVis',
      'Team:Visualizations',
      'Feature:Canvas',
      'Feature:Maps',
    ],
    options: {
      bracketHandling: 'visualizations',
    },
  },
  {
    title: 'Discover',
    labels: [
      'Feature:Discover',
      'Team:DataDiscovery',
      'Team:ESQL',
      'Feature:BackgroundSearch',
      'Feature:DiscoverTabs',
      'Feature:UnifiedDataTable',
      'Feature:UnifiedDocViewer',
      'Feature:UnifiedFieldList',
    ],
  },
  {
    title: 'ES|QL',
    labels: ['Team:ESQL', 'Feature:ES|QL'],
    priority: 10,
  },
  {
    title: 'Sharing and reporting',
    labels: [
      'Feature:Embedding',
      'Feature:SharingURLs',
      'Feature:Reporting',
      'Team:Reporting Services',
    ],
  },
  {
    title: 'Elastic Security solution',
    labels: securityLabels,
    priority: 100,
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
    labels: observabilityLabels,
    priority: 100,
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
    labels: [
      'Feature:Alerting',
      'Team:Alerting Services',
      'Feature:Actions',
      'Team:ResponseOps',
      'Team:Cases',
      'Feature:Cases',
      'Feature:AlertingV2',
    ],
  },
  {
    title: 'Data ingestion and Fleet',
    labels: ['Team:Fleet', 'Feature:Fleet', 'Ingest', 'Feature:Ingest Node Pipelines'],
  },
  {
    title: 'Data management',
    labels: [
      'Feature:Data Views',
      'Feature:Index Patterns',
      'Feature:Index Management',
      'Feature:FieldFormatters',
      'Feature:ILM',
      'Feature:Transforms',
    ],
  },
  {
    title: 'Developer tools',
    labels: ['Feature:Console', 'Feature:Dev Tools', 'Feature:Inspector'],
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
      'EUI',
      'Team:Monitoring',
      'Feature:Telemetry',
      'Feature:Stack Monitoring',
      'Team:Operations',
      'Feature:License',
      'Kibana UI',
      'Team:Core UI',
      'Feature:Header',
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
      'Team:Security',
      'Feature:Security/Spaces',
      'Feature:users and roles',
      'Feature:Security/Authentication',
      'Feature:Security/Authorization',
      'Feature:Security/Feature Controls',
      'Feature:license',
      'Feature:watcher',
      'Feature:Kibana Management',
      'Feature:Snapshot and Restore',
      'Team:Stack Management',
      'Feature:CCR',
      'Feature:Upgrade Assistant',
      'Feature:Query Bar',
      'Feature:Courier',
      'Feature:Filters',
      'Feature:Timepicker',
      'Feature:Highlight',
      'Feature:KQL',
      'Feature:Rollups',
      'Feature:Chrome',
      'Feature:http',
      'Feature:OAS',
      'Feature:logging',
    ],
  },
  {
    title: 'Elasticsearch solution',
    labels: [
      'Team:Search',
      'Feature:Search Profiler',
      'Team:Elasticsearch UI',
      'Feature:Search',
      'Project:AsyncSearch',
    ],
  },
];
