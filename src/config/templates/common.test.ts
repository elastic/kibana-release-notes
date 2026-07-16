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
      ])
    );
  });

  it('recognizes current Observability solution labels', () => {
    expect(observabilityLabels).toEqual(
      expect.arrayContaining(['Team:streams-ui', 'Feature:SigEvents', 'Team:obs-ai - DEPRECATED'])
    );
    expect(observabilityLabels).not.toContain('ci:project-deploy-observability');
  });

  it.each([
    [['feature:agent-builder', 'Team:AI Infra'], 'Agent Builder'],
    [['Feature:Inference UI', 'Team:Search'], 'Machine learning and inference'],
    [['Feature:ES|QL', 'Team:DataDiscovery'], 'ES|QL'],
    [['Team:One Workflow'], 'Workflows'],
  ])('routes %j to %s', (labels, expectedArea) => {
    expect(getAreaTitle(labels)).toBe(expectedArea);
  });

  it.each([
    [['Feature:Security ML Jobs', 'Feature:ML/AIOps'], 'Elastic Security solution'],
    [['Feature:SigEvents', 'Team:Presentation'], 'Elastic Observability solution'],
  ])('prioritizes solution routing for %j', (labels, expectedArea) => {
    expect(getAreaTitle(labels)).toBe(expectedArea);
  });
});
