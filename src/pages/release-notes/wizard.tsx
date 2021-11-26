import {
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiCheckableCard,
  EuiEmptyPrompt,
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
  EuiTitle,
} from '@elastic/eui';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useGitHubService } from '../../common';
import { getTemplateInfos, setActiveTemplate, TemplateId } from '../../config';
import { ConfigFlyout } from './components';

interface Props {
  onVersionSelected: (version: string) => void;
}

export const ReleaseNotesWizard: FC<Props> = ({ onVersionSelected }) => {
  const [github, errorHandler] = useGitHubService();

  const [labels, setLabels] = useState<string[]>();
  const [manualLabel, setManualLabel] = useState<string>('');
  const [showConfigFlyout, setShowConfigFlyout] = useState<TemplateId>();
  const [templates, setTemplates] = useState(getTemplateInfos());

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

  const steps: EuiStepsProps['steps'] = [
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
                    <EuiFlexItem grow={true}>{template.name}</EuiFlexItem>
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
                <EuiButton fill onClick={() => onVersionSelected(label)}>
                  {label}
                </EuiButton>
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
                    iconSide="right"
                    iconType="arrowRight"
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
  ];

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
