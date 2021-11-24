import {
  EuiButton,
  EuiButtonEmpty,
  EuiEmptyPrompt,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiPageTemplate,
  EuiText,
} from '@elastic/eui';
import { FC, useEffect, useState } from 'react';
import { useGitHubService } from '../common';
import { ConfigFlyout } from './components';

interface Props {
  onVersionSelected: (version: string) => void;
}

export const VersionSelection: FC<Props> = ({ onVersionSelected }) => {
  const [github, errorHandler] = useGitHubService();

  const [labels, setLabels] = useState<string[]>();
  const [manualLabel, setManualLabel] = useState<string>('');
  const [showConfigFlyout, setShowConfigFlyout] = useState(false);

  useEffect(() => {
    github.getUpcomingReleaseVersions().then(
      (labels) => setLabels(labels),
      (e) => errorHandler(e)
    );
  }, [errorHandler, github]);

  const onSubmitManualLabel = (ev: React.FormEvent): void => {
    ev.preventDefault();
    onVersionSelected(manualLabel);
  };

  return (
    <EuiPageTemplate template="centeredBody">
      {showConfigFlyout && (
        <ConfigFlyout
          onClose={() => setShowConfigFlyout(false)}
          onSaved={() => setShowConfigFlyout(false)}
        />
      )}
      <EuiEmptyPrompt
        hasBorder={false}
        title={<h2>Select a version</h2>}
        body={
          <EuiFlexGroup direction="column" responsive={false} alignItems="center">
            {!labels && (
              <EuiFlexItem>
                <EuiLoadingSpinner size="l" />
              </EuiFlexItem>
            )}
            {Boolean(labels?.length) && (
              <>
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup wrap={true} justifyContent="center">
                    {labels?.map((label) => (
                      <EuiFlexItem grow={false} key={label}>
                        <EuiButton fill size="s" onClick={() => onVersionSelected(label)}>
                          {label}
                        </EuiButton>
                      </EuiFlexItem>
                    ))}
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="m">or enter a version</EuiText>
                </EuiFlexItem>
              </>
            )}
            <EuiFlexItem grow={false}>
              <form onSubmit={onSubmitManualLabel}>
                <EuiFlexGroup gutterSize="xs">
                  <EuiFlexItem grow={false}>
                    <EuiFieldText
                      compressed={true}
                      placeholder="e.g. v7.12.0"
                      value={manualLabel}
                      onChange={(ev) => setManualLabel(ev.target.value)}
                      isInvalid={!!manualLabel && !manualLabel.match(/^v\d+\.\d+\.\d+$/)}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty size="s" type="submit">
                      Apply
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </form>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
      />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty size="s" onClick={() => setShowConfigFlyout(true)} iconType="gear">
            Configuration
          </EuiButtonEmpty>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPageTemplate>
  );
};
