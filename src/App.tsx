import React, { useState } from 'react';
import { GitHubSettings } from './github';
import {
  EuiHeader,
  EuiHeaderLogo,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
} from '@elastic/eui';
import { GITHUB_TOKEN } from './common';
import { ReleaseNotesPage } from './release-notes';
import { ApiChangesPage } from './api-changes';

type Page = 'releaseNotes' | 'devdocs' | 'github';

export const App: React.FC = () => {
  const [page, setPage] = useState<Page>('releaseNotes');
  const isGitHubTokenSet = !!localStorage.getItem(GITHUB_TOKEN);

  return (
    <>
      <EuiHeader>
        <EuiHeaderSection grow={false}>
          <EuiHeaderSectionItem border="right">
            <EuiHeaderLogo
              href={undefined}
              iconType="logoKibana"
              onClick={() => setPage('releaseNotes')}
            >
              Release Notes
            </EuiHeaderLogo>
          </EuiHeaderSectionItem>
        </EuiHeaderSection>
        <EuiHeaderSection side="left" grow={true}>
          <EuiHeaderSectionItemButton onClick={() => setPage('releaseNotes')}>
            Release Notes
          </EuiHeaderSectionItemButton>
          <EuiHeaderSectionItemButton onClick={() => setPage('devdocs')}>
            API changes
          </EuiHeaderSectionItemButton>
        </EuiHeaderSection>
        <EuiHeaderSection side="right">
          <EuiHeaderSectionItemButton iconType="gear" onClick={() => setPage('github')}>
            GitHub Settings
          </EuiHeaderSectionItemButton>
        </EuiHeaderSection>
      </EuiHeader>
      {(!isGitHubTokenSet || page === 'github') && <GitHubSettings />}
      {isGitHubTokenSet && (
        <>
          {page === 'releaseNotes' && <ReleaseNotesPage />}
          {page === 'devdocs' && <ApiChangesPage />}
        </>
      )}
    </>
  );
};
