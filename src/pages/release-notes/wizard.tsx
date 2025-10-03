import {
  EuiAccordion,
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
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
  EuiSwitch,
  EuiText,
  EuiTextColor,
  EuiTitle,
} from '@elastic/eui';
import React, { FC, useEffect, useMemo, useState, useCallback } from 'react';
import { useGitHubService } from '../../common';
import { getTemplateInfos, setActiveTemplate, TemplateId, getActiveTemplateId } from '../../config';
import { ConfigFlyout } from './components';

interface Props {
  onVersionSelected: (version: string, ignoreVersions?: string[]) => void;
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
  const [validateVersion, setValidateVersion] = useState<string>();
  const [isValidatingVersion, setIsValidatingVersion] = useState(false);
  const [previousMissingReleases, setPreviousMissingReleases] = useState<Record<string, boolean>>();
  const isServerless = getActiveTemplateId() === 'serverless';

  useEffect(() => {
    if (isServerless) {
      github.getServerlessReleases().catch((e) => errorHandler(e));
    } else {
      github.getUpcomingReleaseVersions().then(
        (labels) => setLabels(labels),
        (e) => errorHandler(e)
      );
    }
  }, [errorHandler, github, isServerless]);

  const onValidateVersion = useCallback(
    async (version: string): Promise<void> => {
      setValidateVersion(version);
      setIsValidatingVersion(true);
      try {
        const missingReleases = await github.getUnreleasedPastLabels(version);
        setIsValidatingVersion(false);
        if (missingReleases.length === 0) {
          onVersionSelected(version);
        } else {
          setPreviousMissingReleases(
            Object.fromEntries(missingReleases.map((release) => [release, false]))
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        errorHandler(e);
      }
    },
    [errorHandler, github, onVersionSelected]
  );

  const onSubmitManualLabel = useCallback(
    (ev: React.FormEvent): void => {
      ev.preventDefault();
      onValidateVersion(manualLabel);
      setManualLabel('');
    },
    [manualLabel, onValidateVersion]
  );

  const onServerlessReleaseChange = useCallback(
    (optionId: string) => {
      const newIndices = new Set(selectedServerlessSHAs);

      if (selectedServerlessSHAs.has(optionId)) {
        newIndices.delete(optionId);
      } else if (selectedServerlessSHAs.size < 2) {
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

    if (validateVersion) {
      onVersionSelected(
        validateVersion,
        Object.entries(previousMissingReleases ?? {})
          .filter(([, plannedRelease]) => !plannedRelease)
          .map(([release]) => release)
      );
    }
  }, [isServerless, onVersionSelected, previousMissingReleases, validateVersion]);

  const getSteps = useMemo(() => {
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
      const checkboxOptions = github.serverlessReleases.map((release) => {
        const releaseDate = release.releaseDate?.toLocaleDateString();
        const tagName = release.releaseTag?.name;
        return {
          id: release.kibanaSha,
          label: `${releaseDate} (${tagName})`,
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
                isInvalid={selectedServerlessSHAs.size !== 2}
                error={
                  selectedServerlessSHAs.size !== 2 ? 'Please select only two releases' : undefined
                }
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
          status: selectedServerlessSHAs.size === 2 ? 'current' : 'incomplete',
          children: (
            <>
              {selectedServerlessSHAs.size !== 2 ? (
                <EuiTextColor color="subdued">
                  Please select exactly two releases above to continue.
                </EuiTextColor>
              ) : (
                <EuiButton
                  fill
                  onClick={onGenerateReleaseNotes}
                  disabled={selectedServerlessSHAs.size !== 2}
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
                  <EuiButton
                    disabled={isValidatingVersion}
                    fill={!validateVersion || validateVersion === label}
                    onClick={() => onValidateVersion(label)}
                    iconType={validateVersion === label ? 'check' : undefined}
                  >
                    {label}
                  </EuiButton>
                </EuiFlexItem>
              ))}
              {validateVersion && !labels.includes(validateVersion) && (
                <EuiFlexItem grow={false}>
                  <EuiButton disabled={isValidatingVersion} fill iconType="check">
                    {validateVersion}
                  </EuiButton>
                </EuiFlexItem>
              )}
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
      {
        title: previousMissingReleases
          ? 'Found version labels without release'
          : 'Validate release version',
        status: isValidatingVersion ? 'loading' : validateVersion ? 'warning' : 'incomplete',
        children: (
          <>
            {isValidatingVersion && <EuiTextColor>Checking previous releases …</EuiTextColor>}
            {!isValidatingVersion && !validateVersion && (
              <EuiTextColor color="subdued">
                Please select a version above to continue.
              </EuiTextColor>
            )}
            {!isValidatingVersion && validateVersion && (
              <>
                <EuiCallOut color="warning" size="m">
                  <EuiText size="relative">
                    The following older version labels exist in the repository, but actually have
                    not been released (yet). For the release note generation to work, please mark
                    versions that will still be released. Leave versions unmarked if there is no
                    release planned for this version.
                    <EuiSpacer size="s" />
                    <EuiAccordion id="unreleasedVersionMoreDetails" buttonContent="More details">
                      <EuiSpacer size="s" />
                      <p>
                        <strong>How does this tool determine PRs for a version?</strong> Version
                        labels on PRs determine in which version's release note a PR appears. The
                        way version labels are used in the repository, can cause a PR to have
                        multiple version labels attached. That PR should nevertheless only show up
                        in the earliest version it got released, e.g. a PR with the labels v7.10.2,
                        v7.11.0 and v8.0.0 should only appear in the v7.10.2 release notes. This
                        tool makes sure it will only be included in the release note of the earliest
                        version.
                      </p>
                      <p>
                        <strong>What is the problem with unreleased version labels?</strong> PRs
                        with a version label assigned for a version that never will be released are
                        causing problems. Scenario: a PR has the labels v7.10.3, v7.11.1, v7.12.0,
                        v8.0.0 with 7.10.3 never being an actual release. This tool would now assume
                        that this PR should show up in v7.10.3's release notes, which never existed,
                        and thus the PR will never be listed in any release notes.
                      </p>
                      <p>
                        <strong>Why do those unreleased labels exist?</strong> Sometimes the release
                        was originally planned and then canceled, sometimes some engineer created
                        that label while that release was never planned and then the label ended up
                        on more and more PRs.
                      </p>
                      <p>
                        <strong>What do I need to do here?</strong> This tool retrieves a list of
                        existing version labels from the two minor versions prior to the selected
                        version. It will check if any of them does not match an existing release.
                        For each of those version labels without a matching release you'll need to
                        specify how it should be treated:
                      </p>
                      <div>
                        <EuiSwitch
                          checked={true}
                          onChange={() => null}
                          compressed
                          label=""
                          style={{ cursor: 'default' }}
                        />{' '}
                        The version will still be released, it just hasn't happened <em>yet</em>. No
                        special behavior will be applied.
                      </div>
                      <EuiSpacer size="s" />
                      <div>
                        <EuiSwitch
                          checked={false}
                          onChange={() => null}
                          compressed
                          label=""
                          style={{ cursor: 'default' }}
                        />{' '}
                        The version will never be released. The tool will ignore this label and
                        treat PRs, like they wouldn't have this label attached, i.e. they move into
                        the release notes for the next highest version label attached.
                      </div>
                    </EuiAccordion>
                  </EuiText>
                </EuiCallOut>
                <EuiSpacer />
                <EuiTitle size="xs">
                  <h3>Which versions will still be released?</h3>
                </EuiTitle>
                <EuiSpacer size="m" />
                {previousMissingReleases &&
                  Object.entries(previousMissingReleases).map(([release, checked]) => (
                    <EuiFormRow key={release}>
                      <EuiSwitch
                        label={release}
                        checked={checked}
                        onChange={() =>
                          setPreviousMissingReleases((prev) => ({ ...prev, [release]: !checked }))
                        }
                        compressed
                      />
                    </EuiFormRow>
                  ))}
                <EuiSpacer />
                <EuiButton fill onClick={onGenerateReleaseNotes}>
                  Generate release notes
                </EuiButton>
              </>
            )}
          </>
        ),
      },
    ]);
  }, [
    githubLoading,
    github.serverlessReleases,
    isServerless,
    isValidatingVersion,
    labels,
    manualLabel,
    onGenerateReleaseNotes,
    onServerlessReleaseChange,
    onSubmitManualLabel,
    onValidateVersion,
    previousMissingReleases,
    selectedServerlessSHAs,
    templates,
    validateVersion,
  ]);

  return (
    <EuiPageTemplate pageHeader={{ pageTitle: 'Release Notes' }}>
      <EuiSteps steps={getSteps} />
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
