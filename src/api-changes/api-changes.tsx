import { EuiButton, EuiEmptyPrompt, EuiPageTemplate } from '@elastic/eui';
import type { FC } from 'react';

export const ApiChangesPage: FC = () => {
  return (
    <EuiPageTemplate pageHeader={{ pageTitle: 'API Changes' }}>
      <EuiEmptyPrompt
        body={<p>Will be available here soon.</p>}
        actions={
          <EuiButton href="https://devdocs.kibana.team" fill iconType="popout" iconSide="right">
            Devdocs Tool
          </EuiButton>
        }
      />
    </EuiPageTemplate>
  );
};
