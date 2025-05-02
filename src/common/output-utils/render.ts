import Mustache from 'mustache';
import { Config, OutputTemplateType } from '../../config';
import { PrItem } from '../github-service';
import { extractReleaseNotes, GroupedByArea, NormalizeOptions } from '../pr-utils';
import { groupByArea, groupPrs } from '../../common';

interface RenderPageContext {
  version: string;
  minorVersion: string;
  prs: Record<string, string | unknown>;
  nextMajorVersion: string;
  isPatchRelease: boolean;
  serverlessReleaseDate: string | undefined;
  versionWithoutPeriods: string;
}

type PrType = 'feature' | 'enhancement' | 'fix' | 'breaking' | 'deprecation';

const getTemplateTypeKey = (isMarkdown: boolean): OutputTemplateType => {
  return isMarkdown ? 'markdown' : 'asciidoc';
};

function getPRTemplate(type: PrType, config: Config, isMarkdown: boolean) {
  const templateTypeKey = getTemplateTypeKey(isMarkdown);

  if (type in config.templates[templateTypeKey].prs) {
    return config.templates[templateTypeKey].prs[
      type as keyof typeof config.templates[typeof templateTypeKey]['prs']
    ] as string;
  }

  return config.templates[templateTypeKey].prs._other_;
}

export function renderOutput(
  config: Config,
  context: RenderPageContext,
  isMarkdown: boolean
): string {
  const templateTypeKey = getTemplateTypeKey(isMarkdown);
  const template = context.isPatchRelease
    ? config.templates[templateTypeKey].pages.patchReleaseNotes ??
      config.templates[templateTypeKey].pages.releaseNotes
    : config.templates[templateTypeKey].pages.releaseNotes;

  return Mustache.render(template, context).trim();
}

function renderPr(
  pr: PrItem,
  type: PrType,
  config: Config,
  isMarkdown: boolean,
  normalizeOptions?: NormalizeOptions
) {
  const template = getPRTemplate(type, config, isMarkdown);
  const releaseNote = extractReleaseNotes(pr, normalizeOptions);

  return Mustache.render(template, {
    title: releaseNote.title,
    number: pr.number,
    details: releaseNote.type === 'releaseNoteDetails' ? releaseNote.details : undefined,
  });
}

function renderGroupedByArea(
  [areas, unknown]: GroupedByArea,
  type: PrType,
  config: Config,
  version: string,
  isMarkdown: boolean
): string {
  const output: string[] = [];
  const sortedAreas = [...config.areas].sort((a, b) => a.title.localeCompare(b.title));
  const templateTypeKey = getTemplateTypeKey(isMarkdown);

  for (const area of sortedAreas) {
    if (areas[area.title]) {
      output.push(
        Mustache.render(config.templates[templateTypeKey].prGroup, {
          groupTitle: area.title,
          // If the area has a textOverwriteTemplate render that instead of the list of PRs
          prs: area.options?.textOverwriteTemplate
            ? Mustache.render(area.options.textOverwriteTemplate, { version })
            : areas[area.title]
                .map((pr) => renderPr(pr, type, config, isMarkdown, area.options))
                .join('\n'),
        })
      );
    }
  }

  if (unknown.length > 0) {
    output.push(
      Mustache.render(config.templates[templateTypeKey].prGroup, {
        groupTitle: 'Other',
        prs: unknown.map((pr) => renderPr(pr, type, config, isMarkdown)).join('\n'),
      })
    );
  }

  return output.join('\n');
}

export const getRenderedPRGroups = (
  prs: PrItem[],
  config: Config,
  version: string,
  isMarkdown: boolean
) => {
  const grouped = groupPrs(prs, { includeFeaturesInEnhancements: true });

  return {
    breaking: grouped.breaking.map((pr) => renderPr(pr, 'breaking', config, isMarkdown)).join('\n'),
    deprecations: grouped.deprecation
      .map((pr) => renderPr(pr, 'deprecation', config, isMarkdown))
      .join('\n'),
    fixes: renderGroupedByArea(
      groupByArea(grouped.fixes, config),
      'fix',
      config,
      version,
      isMarkdown
    ),
    features: renderGroupedByArea(
      groupByArea(grouped.features, config),
      'feature',
      config,
      version,
      isMarkdown
    ),
    enhancements: renderGroupedByArea(
      groupByArea(grouped.enhancements, config),
      'enhancement',
      config,
      version,
      isMarkdown
    ),
    missingReleaseNoteLabel: grouped.missingLabel,
  };
};
