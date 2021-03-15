import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import type { FC } from 'react';

interface Props {
  onPrepare: () => void;
}

export const GenerateSidebar: FC<Props> = ({ onPrepare }) => {
  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <EuiButton fill onClick={onPrepare} iconType="arrowLeft">
          Prepare release notes
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
