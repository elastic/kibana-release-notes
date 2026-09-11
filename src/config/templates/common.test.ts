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
        'Team: Security Investigations',
      ])
    );
  });

  it('recognizes current Observability solution labels', () => {
    expect(observabilityLabels).toEqual(
      expect.arrayContaining(['Feature:Streams', 'Feature:SigEvents', 'Team:obs-ai - DEPRECATED'])
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
  ])('routes %j to %s', (labels, expectedArea) => {
    expect(getAreaTitle(labels)).toBe(expectedArea);
  });

  it.each([
    [['Feature:Security ML Jobs', 'Feature:ML/AIOps'], 'Elastic Security solution'],
    [['Feature:Endpoint', 'Team:Fleet'], 'Elastic Security solution'],
    [['Feature:SigEvents', 'Team:Presentation'], 'Elastic Observability solution'],
    [['Team: Security Investigations', 'Team:agent-builder'], 'Elastic Security solution'],
    [['Feature:Streams', 'Team:streams-ui'], 'Elastic Observability solution'],
  ])('prioritizes solution routing for %j', (labels, expectedArea) => {
    expect(getAreaTitle(labels)).toBe(expectedArea);
  });

  it('leaves Team:streams-ui uncategorized when no feature label is present', () => {
    const [, ungrouped] = groupByArea([createPr(['Team:streams-ui'])], kibanaTemplate);

    expect(ungrouped).toHaveLength(1);
  });
});
