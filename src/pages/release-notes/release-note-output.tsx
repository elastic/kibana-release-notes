import { EuiFlexGroup, EuiFlexItem, EuiCallOut, EuiCode } from '@elastic/eui';
import { FC, useMemo } from 'react';
import { groupByArea, groupPrs, PrItem, useGitHubService } from '../../common';
import semver from 'semver';
import {
  renderGroupedByArea,
  renderPageAsAsciidoc,
  renderPrAsAsciidoc,
} from '../../common/output-utils';
import { useActiveConfig } from '../../config';
import MonacoEditor from '@monaco-editor/react';

interface Props {
  version: string;
  prs: PrItem[];
}

export const ReleaseNoteOutput: FC<Props> = ({ prs, version: ver }) => {
  const [github] = useGitHubService();
  const config = useActiveConfig();
  const isServerless = ver === 'serverless';
  const version = isServerless ? github.serverlessReleaseTag : ver.replace(/^v(.*)$/, '$1');
  const isPatchVersion = isServerless ? false : semver.patch(version) !== 0;

  const renderedGroups = useMemo(() => {
    const grouped = groupPrs(prs, { includeFeaturesInEnhancements: true });
    return {
      breaking: grouped.breaking.map((pr) => renderPrAsAsciidoc(pr, 'breaking', config)).join('\n'),
      deprecations: grouped.deprecation
        .map((pr) => renderPrAsAsciidoc(pr, 'deprecation', config))
        .join('\n'),
      fixes: renderGroupedByArea(groupByArea(grouped.fixes, config), 'fix', config, version),
      features: renderGroupedByArea(
        groupByArea(grouped.features, config),
        'feature',
        config,
        version
      ),
      enhancements: renderGroupedByArea(
        groupByArea(grouped.enhancements, config),
        'enhancement',
        config,
        version
      ),
      missingReleaseNoteLabel: grouped.missingLabel,
    };
  }, [config, prs, version]);

  const asciidoc = useMemo(
    () =>
      renderPageAsAsciidoc(
        isPatchVersion
          ? config.templates.pages.patchReleaseNotes ?? config.templates.pages.releaseNotes
          : config.templates.pages.releaseNotes,
        {
          version,
          minorVersion: version.replace(/\.\d+$/, ''),
          prs: renderedGroups,
          nextMajorVersion: isServerless ? '' : `${semver.major(version) + 1}.0.0`,
          isPatchRelease: isPatchVersion,
          serverlessReleaseDate: github.serverlessReleaseDate,
        }
      ).trim(),
    [
      config.templates.pages.patchReleaseNotes,
      config.templates.pages.releaseNotes,
      github.serverlessReleaseDate,
      isPatchVersion,
      isServerless,
      renderedGroups,
      version,
    ]
  );

  return (
    <EuiFlexGroup direction="column" responsive={false} style={{ height: '100%' }}>
      {renderedGroups.missingReleaseNoteLabel.length > 0 && (
        <EuiFlexItem grow={false}>
          <EuiCallOut
            color="danger"
            iconType="alert"
            title={
              <>
                {renderedGroups.missingReleaseNoteLabel.length} PRs have been ignored, because of
                missing <EuiCode>release_note:</EuiCode> labels.
              </>
            }
          ></EuiCallOut>
        </EuiFlexItem>
      )}
      <EuiFlexItem>
        <MonacoEditor height="100%" options={{ readOnly: true }} value={asciidoc} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
