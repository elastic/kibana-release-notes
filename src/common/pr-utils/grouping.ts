import { PrItem } from '../../common';
import { Config } from '../../config';

export interface ReleaseNoteGroups<T> {
  fixes: T;
  enhancements: T;
  features: T;
  deprecation: T;
  breaking: T;
  missingLabel: T;
}

export type GroupedByArea = [areas: { [areaTitle: string]: PrItem[] }, ungrouped: PrItem[]];

export interface AreaGroup {
  title: string;
  prs: PrItem[];
}

export function groupByArea(prs: PrItem[], { areas }: Config): GroupedByArea {
  // TODO: How to handle/track PRs in multiple areas.
  const grouped = prs.reduce<{ unknown: PrItem[]; areas: { [title: string]: PrItem[] } }>(
    (grouped, pr) => {
      const matchingAreas = areas.filter(
        ({ labels }) => labels && pr.labels.some(({ name }) => name && labels.includes(name))
      );

      if (matchingAreas.length === 0) {
        grouped.unknown.push(pr);
      } else {
        const [area] = matchingAreas.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
        grouped.areas[area.title] = grouped.areas[area.title] ?? [];
        grouped.areas[area.title].push(pr);
      }
      return grouped;
    },
    { unknown: [], areas: {} }
  );
  return [grouped.areas, grouped.unknown];
}

interface GroupPrOptions {
  includeFeaturesInEnhancements?: boolean;
}

/**
 * Groups a list of specified PRs according to the release_note labels they have.
 * Will return an object of the different groups pointing to an array of PRs with that label.
 */
export function groupPrs(prs: PrItem[], options: GroupPrOptions = {}): ReleaseNoteGroups<PrItem[]> {
  const groups = prs.reduce<ReleaseNoteGroups<PrItem[]>>(
    (groups, pr) => {
      // If the pr has no release_note label at all (should usually not happen)
      // it will be added to the missingLabel group, so we can warn about that in the UI.
      if (!pr.labels.some((label) => label.name?.startsWith('release_note:'))) {
        groups.missingLabel.push(pr);
        return groups;
      }

      for (const label of pr.labels) {
        switch (label.name) {
          case 'release_note:fix':
            groups.fixes.push(pr);
            break;
          case 'release_note:enhancement':
            groups.enhancements.push(pr);
            break;
          case 'release_note:deprecation':
            groups.deprecation.push(pr);
            break;
          case 'release_note:breaking':
            groups.breaking.push(pr);
            break;
          case 'release_note:feature':
            groups.features.push(pr);
            break;
        }
      }

      return groups;
    },
    { fixes: [], enhancements: [], features: [], deprecation: [], breaking: [], missingLabel: [] }
  );

  return groups;
}
