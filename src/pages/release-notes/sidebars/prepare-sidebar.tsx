import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import type { FC } from 'react';

interface Props {
  onGenerate: () => void;
}

export const PrepareSidebar: FC<Props> = ({ onGenerate }) => {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiButton fill onClick={onGenerate} iconSide="right" iconType="arrowRight">
          Generate release notes
        </EuiButton>
        <EuiSpacer size="s" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}></EuiFlexItem>
    </EuiFlexGroup>
  );
};
