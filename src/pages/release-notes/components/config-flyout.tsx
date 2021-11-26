import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlyout,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiContextMenu,
  EuiPopover,
} from '@elastic/eui';
import { useState } from 'react';
import type { FC } from 'react';
import MonacoEditor, { DiffEditor } from '@monaco-editor/react';
import {
  Config,
  getConfig,
  getTemplate,
  hasConfigChanges,
  resetConfigOverwrite,
  setConfig,
} from '../../../config';
import { MarkerSeverity } from 'monaco-editor';

interface Props {
  onSaved: (config: Config) => void;
  onClose: () => void;
}

export const ConfigFlyout: FC<Props> = ({ onSaved, onClose }) => {
  const [configString, setConfigString] = useState<string>(() =>
    JSON.stringify(getConfig(), null, 2)
  );
  const [isValid, setValid] = useState(true);
  const [viewChanges, setViewChanged] = useState(false);
  const [isTemplatePopoverOpen, setTemplatePopoverOpen] = useState(false);

  const onViewChanges = (): void => {
    setViewChanged(!viewChanges);
  };

  const onSave = (): void => {
    onSaved(setConfig(JSON.parse(configString)));
  };

  const onLoadTemplate = (template: 'kibana' | 'security'): void => {
    resetConfigOverwrite(template);
    setTemplatePopoverOpen(false);
    setConfigString(JSON.stringify(getConfig(), null, 2));
  };

  return (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutHeader style={{ marginBottom: '8px' }}>
        <EuiTitle size="m">
          <h2>Config {hasConfigChanges() && <>(changed)</>}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      {!viewChanges ? (
        <MonacoEditor
          height="100%"
          value={configString}
          language="json"
          onChange={(value) => setConfigString(value ?? '')}
          onValidate={(markers) =>
            setValid(
              markers.filter(({ severity }) => severity === MarkerSeverity.Error).length === 0
            )
          }
        />
      ) : (
        <DiffEditor
          original={JSON.stringify(getTemplate(JSON.parse(configString).template), null, 2)}
          modified={configString}
          language="json"
          options={{ readOnly: true, renderSideBySide: false }}
        />
      )}
      <EuiFlyoutFooter>
        <EuiFlexGroup direction="rowReverse" justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiButton fill disabled={!isValid} onClick={onSave}>
              Save
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiPopover
                  button={
                    <EuiButtonEmpty
                      onClick={() => setTemplatePopoverOpen(!isTemplatePopoverOpen)}
                      iconType="folderOpen"
                    >
                      Load template
                    </EuiButtonEmpty>
                  }
                  panelPaddingSize="none"
                  isOpen={isTemplatePopoverOpen}
                  closePopover={() => setTemplatePopoverOpen(false)}
                  anchorPosition="upLeft"
                >
                  <EuiContextMenu
                    initialPanelId={0}
                    panels={[
                      {
                        id: 0,
                        items: [
                          {
                            name: 'Kibana',
                            icon: 'logoKibana',
                            onClick: () => onLoadTemplate('kibana'),
                          },
                          {
                            name: 'Security',
                            icon: 'logoSecurity',
                            onClick: () => onLoadTemplate('security'),
                          },
                        ],
                      },
                    ]}
                  />
                </EuiPopover>
              </EuiFlexItem>
              {hasConfigChanges() && (
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty iconType={viewChanges ? 'pencil' : 'eye'} onClick={onViewChanges}>
                    {viewChanges ? 'Edit config' : 'View changes'}
                  </EuiButtonEmpty>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};
