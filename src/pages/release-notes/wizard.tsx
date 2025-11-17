import {
  EuiButton,
  EuiButtonEmpty,
  EuiCheckableCard,
  EuiCheckboxGroup,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormFieldset,
  EuiFormRow,
  EuiIcon,
  EuiPageTemplate,
  EuiSpacer,
  EuiSteps,
  EuiStepsProps,
  EuiText,
  EuiTextColor,
} from '@elastic/eui';
import React, { FC, useEffect, useMemo, useState, useCallback } from 'react';
import { ServerlessRelease, useGitHubService } from '../../common';
import { getTemplateInfos, setActiveTemplate, TemplateId, getActiveTemplateId } from '../../config';
import { ConfigFlyout } from './components';

const DEFAULT_SERVERLESS_SHAS = 2;

interface Props {
  onVersionSelected: (version: string) => void;
  selectedServerlessSHAs: Set<string>;
  setSelectedServerlessSHAs: (sha: Set<string>) => void;
}

export const ReleaseNotesWizard: FC<Props> = ({
  onVersionSelected,
  selectedServerlessSHAs,
  setSelectedServerlessSHAs,
}) => {
  const [github, errorHandler, githubLoading] = useGitHubService();
  const [labels, setLabels] = useState<string[]>();
  const [manualLabel, setManualLabel] = useState<string>('');
  const [showConfigFlyout, setShowConfigFlyout] = useState<TemplateId>();
  const [templates, setTemplates] = useState(getTemplateInfos());
  const isServerless = getActiveTemplateId() === 'serverless';
  const [serverlessReleases, setServerlessReleases] = useState<ServerlessRelease[]>([]);

  useEffect(() => {
    if (isServerless) {
      github.getServerlessReleases().then(
        (releases) => setServerlessReleases(releases),
        (e) => errorHandler(e)
      );
    } else {
      github.getUpcomingReleaseVersions().then(
        (labels) => setLabels(labels),
        (e) => errorHandler(e)
      );
    }
  }, [errorHandler, github, isServerless]);

  const onSubmitManualLabel = useCallback(
    (ev: React.FormEvent): void => {
      ev.preventDefault();
      onVersionSelected(manualLabel);
      setManualLabel('');
    },
    [manualLabel, onVersionSelected]
  );

  const onServerlessReleaseChange = useCallback(
    (optionId: string) => {
      const newIndices = new Set(selectedServerlessSHAs);

      if (selectedServerlessSHAs.has(optionId)) {
        newIndices.delete(optionId);
      } else if (selectedServerlessSHAs.size < DEFAULT_SERVERLESS_SHAS) {
        newIndices.add(optionId);
      }

      setSelectedServerlessSHAs(newIndices);
    },
    [selectedServerlessSHAs, setSelectedServerlessSHAs]
  );

  const onGenerateReleaseNotes = useCallback(() => {
    if (isServerless) {
      onVersionSelected('serverless');
    }
  }, [isServerless, onVersionSelected]);

  const steps = useMemo(() => {
    const baseSteps: EuiStepsProps['steps'] = [
      {
        title: 'Select release notes to generate',
        children: (
          <EuiFormFieldset>
            {templates.map((template) => (
              <React.Fragment key={template.id}>
                <EuiCheckableCard
                  id={template.id}
                  onChange={() => {
                    setTemplates(setActiveTemplate(template.id));
                  }}
                  checked={template.active}
                  label={
                    <EuiFlexGroup gutterSize="s" alignItems="center">
                      <EuiFlexItem grow={false}>
                        <EuiIcon type={template.icon} />
                      </EuiFlexItem>
                      <EuiFlexItem grow={true}>
                        <EuiText size="m">{template.name}</EuiText>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButtonEmpty
                          iconType="gear"
                          size="xs"
                          onClick={() => setShowConfigFlyout(template.id)}
                        >
                          Customize config
                          {template.modified && <> (modified)</>}
                        </EuiButtonEmpty>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}></EuiFlexItem>
                    </EuiFlexGroup>
                  }
                />
                <EuiSpacer size="m" />
              </React.Fragment>
            ))}
          </EuiFormFieldset>
        ),
      },
    ];

    if (isServerless) {
      const checkboxOptions = serverlessReleases
        .sort((a, b) => {
          if (a?.releaseDate && b?.releaseDate) {
            return Number(b.releaseDate) - Number(a.releaseDate);
          }

          return 0;
        })
        .map(({ releaseDate, releaseTag, kibanaSha }) => {
          return {
            id: kibanaSha,
            label: `${releaseDate?.toLocaleDateString()} (${releaseTag?.name}, ${kibanaSha})`,
          };
        });

      return baseSteps.concat([
        {
          title: 'Select two Serverless releases',
          status: githubLoading ? 'loading' : 'current',
          children: githubLoading ? (
            'Loading serverless releases …'
          ) : (
            <>
              <EuiFormRow
                label="Select exactly two releases to compare"
                isInvalid={selectedServerlessSHAs.size !== DEFAULT_SERVERLESS_SHAS}
              >
                <EuiCheckboxGroup
                  options={checkboxOptions}
                  idToSelectedMap={Object.fromEntries(
                    checkboxOptions.map(({ id }) => {
                      return [id, selectedServerlessSHAs.has(id)];
                    })
                  )}
                  onChange={onServerlessReleaseChange}
                />
              </EuiFormRow>
            </>
          ),
        },
        {
          title: 'Generate notes for PRs between the two Serverless releases',
          status:
            selectedServerlessSHAs.size === DEFAULT_SERVERLESS_SHAS ? 'current' : 'incomplete',
          children: (
            <>
              {selectedServerlessSHAs.size !== DEFAULT_SERVERLESS_SHAS ? (
                <EuiTextColor color="subdued">
                  Please select exactly two releases above to continue.
                </EuiTextColor>
              ) : (
                <EuiButton
                  fill
                  onClick={onGenerateReleaseNotes}
                  disabled={selectedServerlessSHAs.size !== DEFAULT_SERVERLESS_SHAS}
                >
                  Generate release notes
                </EuiButton>
              )}
            </>
          ),
        },
      ]);
    }

    return baseSteps.concat([
      {
        title: 'Select a version',
        status: labels ? 'current' : 'loading',
        children: !labels ? (
          'Loading labels …'
        ) : (
          <>
            <EuiFlexGroup wrap={true} justifyContent="flexStart">
              {labels?.map((label) => (
                <EuiFlexItem grow={false} key={label}>
                  <EuiButton onClick={() => onVersionSelected(label)}>{label}</EuiButton>
                </EuiFlexItem>
              ))}
            </EuiFlexGroup>
            <EuiSpacer size="l" />
            <form onSubmit={onSubmitManualLabel}>
              <EuiFlexGroup gutterSize="s">
                <EuiFlexItem grow={false}>
                  <EuiFormRow
                    label="or enter a version"
                    error={'Version must be in format vX.Y.Z'}
                    isInvalid={!!manualLabel && !manualLabel.match(/^v\d+\.\d+\.\d+$/)}
                  >
                    <EuiFieldText
                      placeholder="e.g. v7.12.0"
                      value={manualLabel}
                      onChange={(ev) => setManualLabel(ev.target.value)}
                      isInvalid={!!manualLabel && !manualLabel.match(/^v\d+\.\d+\.\d+$/)}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFormRow hasEmptyLabelSpace>
                    <EuiButton
                      disabled={!manualLabel || !manualLabel?.match(/^v\d+\.\d+\.\d+$/)}
                      type="submit"
                    >
                      Apply
                    </EuiButton>
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
            </form>
          </>
        ),
      },
    ]);
  }, [
    githubLoading,
    serverlessReleases,
    isServerless,
    labels,
    manualLabel,
    onGenerateReleaseNotes,
    onServerlessReleaseChange,
    onSubmitManualLabel,
    onVersionSelected,
    selectedServerlessSHAs,
    templates,
  ]);

  return (
    <EuiPageTemplate pageHeader={{ pageTitle: 'Release Notes' }}>
      <EuiSteps steps={steps} />
      {showConfigFlyout && (
        <ConfigFlyout
          templateId={showConfigFlyout}
          onSaved={() => {
            setShowConfigFlyout(undefined);
            setTemplates(getTemplateInfos());
          }}
          onClose={() => setShowConfigFlyout(undefined)}
        />
      )}
    </EuiPageTemplate>
  );
};
