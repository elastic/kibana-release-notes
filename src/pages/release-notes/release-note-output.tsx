import { EuiFlexGroup, EuiFlexItem, EuiCallOut, EuiCode } from '@elastic/eui';
import { FC, useMemo } from 'react';
import { PrItem, useGitHubService } from '../../common';
import semver from 'semver';
import { renderOutput, getRenderedPRGroups } from '../../common/output-utils';
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
  // Docs output changed from ascii to markdown in 9.0.0
  const isMarkdown = isServerless || semver.gte(ver, '9.0.0');

  const renderedGroups = useMemo(
    () => getRenderedPRGroups(prs, config, version, isMarkdown),
    [config, prs, version, isMarkdown]
  );

  const renderedOutput = useMemo(
    () =>
      renderOutput(
        config,
        {
          version,
          minorVersion: version.replace(/\.\d+$/, ''),
          prs: renderedGroups,
          nextMajorVersion: isServerless ? '' : `${semver.major(version) + 1}.0.0`,
          isPatchRelease: isPatchVersion,
          serverlessReleaseDate: github.serverlessReleaseDate,
        },
        isMarkdown
      ),
    [
      config,
      github.serverlessReleaseDate,
      isMarkdown,
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
        <MonacoEditor
          height="100%"
          options={{ readOnly: true }}
          value={renderedOutput}
          language={isMarkdown ? 'markdown' : undefined}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
