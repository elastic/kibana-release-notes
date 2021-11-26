import React from 'react';
import { GitHubSettings } from './github';
import {
  EuiHeader,
  EuiHeaderLink,
  EuiHeaderLinks,
  EuiHeaderLogo,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiIcon,
} from '@elastic/eui';
import { GITHUB_TOKEN } from './common';
import { ReleaseNotesPage } from './release-notes';
import { ApiChangesPage } from './api-changes';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';

export const App: React.FC = () => {
  const isGitHubTokenSet = !!localStorage.getItem(GITHUB_TOKEN);
  const navigate = useNavigate();

  return (
    <>
      <EuiHeader>
        <EuiHeaderSection grow={false}>
          <EuiHeaderSectionItem border="right">
            <EuiHeaderLogo
              href={undefined}
              iconType="logoKibana"
              onClick={() => navigate('/release-notes')}
            >
              Release Notes
            </EuiHeaderLogo>
          </EuiHeaderSectionItem>
        </EuiHeaderSection>
        <EuiHeaderSection grow={true}>
          <EuiHeaderLinks>
            <EuiHeaderLink onClick={() => navigate('/release-notes')}>Release Notes</EuiHeaderLink>
            <EuiHeaderLink onClick={() => navigate('/devdocs')}>Kibana API changes</EuiHeaderLink>
          </EuiHeaderLinks>
        </EuiHeaderSection>
        <EuiHeaderSection side="right">
          <EuiHeaderSectionItem border="left">
            <EuiHeaderSectionItemButton
              aria-label="GitHub Settings"
              onClick={() => navigate('/github')}
            >
              <EuiIcon type="gear" />
            </EuiHeaderSectionItemButton>
          </EuiHeaderSectionItem>
        </EuiHeaderSection>
      </EuiHeader>
      <Routes>
        <Route
          path="/release-notes"
          element={isGitHubTokenSet ? <ReleaseNotesPage /> : <Navigate to="/github" />}
        />
        <Route
          path="/devdocs"
          element={isGitHubTokenSet ? <ApiChangesPage /> : <Navigate to="/github" />}
        />
        <Route path="/github" element={<GitHubSettings />} />
        <Route path="*" element={<Navigate to="/release-notes" />} />
      </Routes>
    </>
  );
};
