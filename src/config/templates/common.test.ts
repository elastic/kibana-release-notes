import type { PrItem } from '../../common/github-service';
import { groupByArea } from '../../common/pr-utils/grouping';
import { observabilityLabels, securityLabels } from './common';
import { kibanaTemplate } from './kibana';

const createPr = (labels: string[]): PrItem =>
  ({
    labels: labels.map((name) => ({ name })),
  } as PrItem);

const getAreaTitle = (labels: string[]): string => {
  const [groupedAreas] = groupByArea([createPr(labels)], kibanaTemplate);

  return Object.keys(groupedAreas)[0];
};

describe('Kibana release note areas', () => {
  it('recognizes current Security solution labels', () => {
    expect(securityLabels).toEqual(
      expect.arrayContaining([
        'Team:Detection Engineering',
        'Team:Security Deployment',
        'Team:Automatic Migrations',
        'Feature:Security ML Jobs',
        'Feature:Endpoint',
        'Team:Security Investigations',
        'Team:security-siem-conduit',
        'Team:Security Solution',
      ])
    );
  });

  it('recognizes current Observability solution labels', () => {
    expect(observabilityLabels).toEqual(
      expect.arrayContaining([
        'Feature:Streams',
        'Feature:SigEvents',
        'Team:obs-ai - DEPRECATED',
        'Team:obs-signals-metrics',
        'Team:obs-signals-logs',
        'Feature:Synthetics',
        'Team:nightshift-sre-agent',
        'Feature: Nightshift Detection Engine',
      ])
    );
    expect(observabilityLabels).not.toContain('ci:project-deploy-observability');
    expect(observabilityLabels).not.toContain('Team:streams-ui');
  });

  it.each([
    [['feature:agent-builder', 'Team:AI Infra'], 'Agent Builder'],
    [['Feature:Inference UI', 'Team:Search'], 'Machine learning and inference'],
    [['Feature:ES|QL', 'Team:DataDiscovery'], 'ES|QL'],
    [['Team:One Workflow'], 'Workflows'],
    [['Feature:AlertingV2'], 'Alerting'],
    [['Feature:Security/User Profile'], 'Kibana platform'],
    [['Feature:Users/Roles/API Keys'], 'Kibana platform'],
    [['Feature:Fleet', 'Team:streams-ui'], 'Data ingestion and Fleet'],
    [['Team:Search & ML UX'], 'Machine learning and inference'],
    [['Team:Discover'], 'Discover'],
    [['Feature:ES|QL editor'], 'ES|QL'],
    [['Team:Dashboards'], 'Dashboards and Visualizations'],
    [['Team:Kibana Management'], 'Kibana platform'],
    [['Feature:Reporting:CSV'], 'Sharing and reporting'],
  ])('routes %j to %s', (labels, expectedArea) => {
    expect(getAreaTitle(labels)).toBe(expectedArea);
  });

  it.each([
    [['Feature:Security ML Jobs', 'Feature:ML/AIOps'], 'Elastic Security solution'],
    [['Feature:Endpoint', 'Team:Fleet'], 'Elastic Security solution'],
    [['Feature:SigEvents', 'Team:Presentation'], 'Elastic Observability solution'],
    [['Team:Security Investigations', 'Team:agent-builder'], 'Elastic Security solution'],
    [['Feature:Streams', 'Team:streams-ui'], 'Elastic Observability solution'],
    [['Team:obs-signals-metrics', 'Team:Discover'], 'Elastic Observability solution'],
    [
      ['Feature: Nightshift Detection Engine', 'Team:nightshift-sre-agent'],
      'Elastic Observability solution',
    ],
    [['Team:security-siem-conduit'], 'Elastic Security solution'],
  ])('prioritizes solution routing for %j', (labels, expectedArea) => {
    expect(getAreaTitle(labels)).toBe(expectedArea);
  });

  it.each([
    [['Team:streams-ui'], 'Data ingestion and Fleet'],
    [['Team:streams-ui', 'Feature:Streams'], 'Elastic Observability solution'],
    [['Team:streams-ui', 'Feature: Observability Onboarding'], 'Elastic Observability solution'],
    [['Feature: AI Infra'], 'Machine learning and inference'],
    [['Feature: AI Infra', 'Team:Search'], 'Machine learning and inference'],
    [['feature:agent-builder', 'Feature: AI Infra'], 'Agent Builder'],
    [['Team:context', 'feature:agent-builder'], 'Context Engine'],
    [['Team:Security Investigations', 'Team:Cases'], 'Elastic Security solution'],
    [['Team:ResponseOps', 'author:actionable-obs'], 'Alerting'],
    [['Feature:AlertingV2', 'author:actionable-obs'], 'Alerting'],
    [['Team:rna-project', 'author:actionable-obs'], 'Alerting'],
  ])('routes %j to %s by priority', (labels, expectedArea) => {
    expect(getAreaTitle(labels)).toBe(expectedArea);
  });
});
