import React from 'react';
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
import { ApiChangesPage, GitHubSettings, ReleaseNotesPage } from './pages';
import { Route, Routes, useNavigate, Navigate, useMatch } from 'react-router-dom';
import { ReactComponent as GitHubIcon } from './github-icon.svg';

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
            <EuiHeaderLink
              isActive={!!useMatch('/release-notes')}
              onClick={() => navigate('/release-notes')}
            >
              Release Notes
            </EuiHeaderLink>
            <EuiHeaderLink isActive={!!useMatch('/devdocs')} onClick={() => navigate('/devdocs')}>
              Kibana API changes
            </EuiHeaderLink>
          </EuiHeaderLinks>
        </EuiHeaderSection>
        <EuiHeaderSection side="right">
          <EuiHeaderSectionItem border="left">
            <EuiHeaderSectionItemButton
              aria-label="GitHub Settings"
              onClick={() => navigate('/github')}
            >
              <EuiIcon type={GitHubIcon} size="l" />
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
