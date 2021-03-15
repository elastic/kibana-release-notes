import Mustache from 'mustache';
import { Config } from '../../config';
import { PrItem } from '../github-service';
import { GroupedByArea, NormalizeOptions, normalizeTitle } from '../pr-utils';

export function renderPageAsAsciidoc(template: string, context: unknown): string {
  return Mustache.render(template, context);
}

type PrType = 'feature' | 'enhancement' | 'fix' | 'breaking' | 'deprecation';

function hasTemplate(
  type: PrType | keyof Config['templates']['prs'],
  config: Config
): type is keyof Config['templates']['prs'] {
  return type in config.templates.prs;
}

export function renderPrAsAsciidoc(
  pr: PrItem,
  type: PrType,
  config: Config,
  normalizeOptions?: NormalizeOptions
): string {
  const template = hasTemplate(type, config)
    ? (config.templates.prs[type] as string)
    : config.templates.prs._other_;

  return Mustache.render(template, {
    title: normalizeTitle(pr.title, normalizeOptions),
    number: pr.number,
  });
}

export function renderGroupedByArea(
  [areas, unknown]: GroupedByArea,
  type: PrType,
  config: Config,
  version: string
): string {
  const output: string[] = [];
  const sortedAreas = [...config.areas].sort((a, b) => a.title.localeCompare(b.title));
  for (const area of sortedAreas) {
    if (areas[area.title]) {
      output.push(
        Mustache.render(config.templates.prGroup, {
          groupTitle: area.title,
          // If the area has a textOverwriteTemplate render that instead of the list of PRs
          prs: area.options?.textOverwriteTemplate
            ? Mustache.render(area.options.textOverwriteTemplate, { version })
            : areas[area.title]
                .map((pr) => renderPrAsAsciidoc(pr, type, config, area.options))
                .join('\n'),
        })
      );
    }
  }
  if (unknown.length > 0) {
    output.push(
      Mustache.render(config.templates.prGroup, {
        groupTitle: 'Other',
        prs: unknown.map((pr) => renderPrAsAsciidoc(pr, type, config)).join('\n'),
      })
    );
  }
  return output.join('\n');
}
