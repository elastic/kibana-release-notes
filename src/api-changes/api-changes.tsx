import React, { FC, useEffect, useState } from 'react';

import {
  EuiButton,
  EuiCopy,
  EuiCallOut,
  EuiCode,
  EuiCodeBlock,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiSwitch,
  EuiProgress,
  EuiText,
  EuiPageTemplate,
} from '@elastic/eui';

import {
  extractContent,
  convertMarkdownToAsciidoc,
  cleanupIssueTitle,
  cleanupMarkdown,
} from './utils';
import { useGitHubService } from '../common';
import { AsiidocRenderer } from './asciidoc';

const DEV_DOC_LABEL = 'release_note:plugin_api_changes';

interface Issue {
  pr: number;
  state: string;
  title: string;
  text: string | null;
}

interface Label {
  text: string;
  value: string;
}

const ApiChanges: FC = () => {
  const [github, githubErrorHandler] = useGitHubService();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [labels, setLabels] = useState<Label[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [showOnlyClosed, setShowOnlyClosed] = useState(true);
  const [renderPreview, setRenderPreview] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>();

  const selectVersion = async (ev: React.ChangeEvent<HTMLSelectElement>) => {
    const version = ev.target.value;
    setIsLoading(true);
    setSelectedVersion(version);
    const rawIssues = await github.getApiChanesPrsForVersion(version);
    const issues = rawIssues.map((issue) => {
      const text = extractContent(issue.body || '');
      return {
        pr: issue.number,
        state: issue.state,
        title: cleanupIssueTitle(issue.title),
        text: convertMarkdownToAsciidoc(cleanupMarkdown(text)),
      };
    });
    setIsLoading(false);
    setIssues(issues);
  };

  const renderIssue = (issue: Issue) => {
    return [
      `[[breaking_plugin_${selectedVersion}_${issue.pr}]]`,
      `.${issue.title}`,
      `[%collapsible]`,
      `====`,
      ``,
      `${issue.text}`,
      ``,
      `*via https://github.com/elastic/kibana/pull/${issue.pr}[#${issue.pr}]*`,
      ``,
      `====`,
    ].join('\n');
  };

  const renderBrokenIssues = (brokenIssues: Issue[]) => {
    return (
      <EuiFlexItem grow={false}>
        <EuiCallOut color="danger" title="Missing Dev Doc description">
          <p>The following PRs where labeled, but haven't had a Dev Doc section:</p>
          <ul>
            {brokenIssues.map((issue) => (
              <li key={issue.pr}>
                <a href={`https://github.com/elastic/kibana/pull/${issue.pr}`}>#{issue.pr}</a>
                <span> {issue.title}</span>
              </li>
            ))}
          </ul>
        </EuiCallOut>
      </EuiFlexItem>
    );
  };

  const renderNoIssues = () => {
    return (
      <EuiEmptyPrompt
        iconType="faceHappy"
        title={<h2>No API changes</h2>}
        body={
          <React.Fragment>
            <p>No issue have yet been labeled as API breaking for the selected version.</p>
            <p>
              To add content to the breaking plugin changes, attach the{' '}
              <EuiCode>{DEV_DOC_LABEL}</EuiCode>
              label to a PR or issue and add the content, that should be added to the dev docs
              behind a <EuiCode># Plugin API changes</EuiCode> header in the issue description.
            </p>
          </React.Fragment>
        }
      />
    );
  };

  useEffect(() => {
    github
      .getUpcomingReleaseVersions()
      .then((labels) => {
        setLabels(labels.map((l) => ({ text: l, value: l })));
      })
      .catch((reason) => githubErrorHandler(reason));
  }, [github, githubErrorHandler]);

  const versionOptions = [{ value: '', text: 'Select version', disabled: true }, ...(labels || [])];

  const closedIssues = issues.filter((issue) => issue.state === 'closed');
  const filteredIssues = showOnlyClosed ? closedIssues : issues;
  const brokenIssues = issues.filter((issue) => !issue.text);
  const asciidoc = filteredIssues
    .filter((issue) => issue.text)
    .map(renderIssue)
    .join('\n\n');

  let switchLabel = 'Only show closed issues/PRs';
  if (issues.length) {
    switchLabel += ` (${closedIssues.length} of ${issues.length})`;
  }

  return (
    <>
      {isLoading && <EuiProgress position="fixed" color="accent" size="xs" />}
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={false}>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiSelect
                options={versionOptions}
                onChange={selectVersion}
                isLoading={labels === null}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSwitch
                label={switchLabel}
                checked={showOnlyClosed}
                onChange={(ev) => setShowOnlyClosed(ev.target.checked)}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSwitch
                label="Render preview"
                checked={renderPreview}
                onChange={(ev) => setRenderPreview(ev.target.checked)}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={true} />
            <EuiFlexItem grow={false}>
              <EuiCopy textToCopy={asciidoc}>
                {(copy) => (
                  <EuiButton disabled={!asciidoc.length} onClick={copy} iconType="copy" size="s">
                    Copy Asciidoc
                  </EuiButton>
                )}
              </EuiCopy>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        {brokenIssues.length > 0 && renderBrokenIssues(brokenIssues)}
        {issues.length === 0 && renderNoIssues()}
        {issues.length > 0 && (
          <EuiFlexItem>
            {renderPreview && (
              <EuiText>
                <AsiidocRenderer source={asciidoc} />
              </EuiText>
            )}
            {!renderPreview && (
              <EuiCodeBlock
                className="App__asciidoc"
                fontSize="m"
                color="dark"
                paddingSize="s"
                isCopyable={true}
              >
                {asciidoc}
              </EuiCodeBlock>
            )}
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </>
  );
};

export const ApiChangesPage: FC = () => {
  return (
    <EuiPageTemplate
      pageHeader={{ pageTitle: 'Kibana API Changes' }}
      pageContentBodyProps={{ style: { height: '100%' } }}
    >
      <ApiChanges />
    </EuiPageTemplate>
  );
};
