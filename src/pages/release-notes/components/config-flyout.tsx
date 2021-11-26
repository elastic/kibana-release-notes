import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlyout,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiBadge,
} from '@elastic/eui';
import { useState } from 'react';
import type { FC } from 'react';
import MonacoEditor, { DiffEditor } from '@monaco-editor/react';
import {
  discardConfigChanges,
  getConfig,
  getDefaultConfig,
  hasConfigChanges,
  setConfig,
  TemplateId,
} from '../../../config';
import { MarkerSeverity } from 'monaco-editor';

interface Props {
  templateId: TemplateId;
  onSaved: () => void;
  onClose: () => void;
}

export const ConfigFlyout: FC<Props> = ({ templateId, onSaved, onClose }) => {
  const [configString, setConfigString] = useState<string>(() =>
    JSON.stringify(getConfig(templateId), null, 2)
  );
  const [isValid, setValid] = useState(true);
  const [viewChanges, setViewChanged] = useState(false);

  const onViewChanges = (): void => {
    setViewChanged(!viewChanges);
  };

  const onSave = (): void => {
    setConfig(JSON.parse(configString), templateId);
    onSaved();
  };

  const onDiscard = (): void => {
    discardConfigChanges(templateId);
    onSaved();
  };

  return (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutHeader style={{ marginBottom: '8px' }}>
        <EuiTitle size="m">
          <h2>
            Customize config: {templateId}{' '}
            {hasConfigChanges(templateId) && (
              <EuiBadge color="accent" iconType="pencil">
                modified
              </EuiBadge>
            )}
          </h2>
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
          original={JSON.stringify(getDefaultConfig(templateId), null, 2)}
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
              {hasConfigChanges(templateId) && (
                <>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      iconType={viewChanges ? 'pencil' : 'eye'}
                      onClick={onViewChanges}
                    >
                      {viewChanges ? 'Edit config' : 'View changes'}
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiButtonEmpty onClick={onDiscard} iconType="eraser">
                      Discard config customizations
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                </>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};
