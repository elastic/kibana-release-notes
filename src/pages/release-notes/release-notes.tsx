import {
  EuiBadge,
  EuiEmptyPrompt,
  EuiPageTemplate,
  EuiProgress,
  EuiSpacer,
  EuiTitle,
  EuiHorizontalRule,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
} from '@elastic/eui';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { PrItem, useGitHubService } from '../../common';
import { useActiveConfig, getActiveTemplateId } from '../../config/config';
import { GenerateSidebar, PrepareSidebar } from './sidebars';
import { Subscription } from 'rxjs';
import { PrepareReleaseNotes } from './prepare-release-notes';
import { ReleaseNoteOutput } from './release-note-output';
import { ConfigFlyout } from './components';

interface Props {
  version: string;
  onVersionChange: () => void;
}

export const ReleaseNotes: FC<Props> = ({ version, onVersionChange }) => {
  const subscriptionRef = useRef<Subscription>();
  const [github, errorHandler] = useGitHubService();
  const config = useActiveConfig();
  const [showConfigFlyout, setShowConfigFlyout] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [progress, setProgress] = useState<number>();
  const [prs, setPrs] = useState<PrItem[]>([]);
  const [step, setStep] = useState<'prepare' | 'generate'>('prepare');

  const loadPrs = useCallback(async () => {
    setLoading(true);
    setProgress(undefined);
    try {
      subscriptionRef.current = (
        await github.getPrsForVersion(version, config.excludedLabels, config.includedLabels)
      ).subscribe((status) => {
        if (status.type === 'complete') {
          setLoading(false);
          setProgress(100);
          setPrs(status.items);
        } else {
          setProgress(status.percentage);
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log('run into error?');
      errorHandler(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config.excludedLabels), github, version]);

  useEffect(() => {
    loadPrs();
    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = undefined;
    };
  }, [loadPrs]);

  useEffect(() => {
    return () => {
      // When component unmounts unregister from potentially running subscription
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  return (
    <EuiPageTemplate
      pageSideBarProps={{ style: { padding: '12px' } }}
      pageSideBar={
        step === 'prepare' ? (
          <PrepareSidebar onGenerate={() => setStep('generate')} />
        ) : (
          <GenerateSidebar onPrepare={() => setStep('prepare')} />
        )
      }
      pageContentBodyProps={{ style: { height: '100%' } }}
      pageBodyProps={{ paddingSize: 'm' }}
    >
      {isLoading && (
        <EuiEmptyPrompt
          body={
            <>
              <EuiTitle size="m">
                <h2>Fetching {version} pull requests …</h2>
              </EuiTitle>
              <EuiSpacer size="xxl" />
              <EuiProgress
                value={progress}
                max={progress === undefined ? undefined : 1}
                size="s"
                color="accent"
              />
            </>
          }
        />
      )}
      {!isLoading && (
        <>
          {step === 'prepare' && (
            <>
              <EuiFlexGroup alignItems="center" gutterSize="s">
                <EuiFlexItem grow={false}>
                  <EuiBadge onClick={onVersionChange} onClickAriaLabel="Change version">
                    {version}
                  </EuiBadge>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>{prs.length} PRs found</EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty onClick={loadPrs} iconType="refresh" size="s">
                    Reload PRs
                  </EuiButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem />
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty
                    size="s"
                    onClick={() => setShowConfigFlyout(true)}
                    iconType="gear"
                  >
                    Configuration
                  </EuiButtonEmpty>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiHorizontalRule margin="m" />
              {showConfigFlyout && (
                <ConfigFlyout
                  templateId={getActiveTemplateId()}
                  onClose={() => setShowConfigFlyout(false)}
                  onSaved={() => setShowConfigFlyout(false)}
                />
              )}
            </>
          )}
          {step === 'prepare' ? (
            <PrepareReleaseNotes prs={prs} />
          ) : (
            <ReleaseNoteOutput prs={prs} version={version} />
          )}
        </>
      )}
    </EuiPageTemplate>
  );
};
