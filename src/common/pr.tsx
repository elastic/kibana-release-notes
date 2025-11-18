import { EuiLink, EuiIconTip } from '@elastic/eui';
import { FC, memo } from 'react';
import { PrItem, hasDuplicatePatchLabels } from './github-service';
import { extractReleaseNotes, NormalizeOptions, ReleaseNoteDetails } from './pr-utils';

interface PrProps {
  pr: PrItem;
  showAuthor?: boolean;
  showTransformedTitle?: boolean;
  normalizeOptions?: NormalizeOptions;
  version?: string;
}

export const Pr: FC<PrProps> = memo(
  ({ pr, showAuthor, showTransformedTitle, normalizeOptions, version }) => {
    const title: ReleaseNoteDetails = showTransformedTitle
      ? extractReleaseNotes(pr, normalizeOptions)
      : { type: 'title', title: pr.title };
    const hasDuplicates = hasDuplicatePatchLabels(pr, version);
    const majorMinorVersion =
      version?.substring(0, version?.lastIndexOf('.')) ?? 'this major and minor version';

    return (
      <>
        {title.title} (
        <EuiLink target="_blank" href={pr.html_url}>
          #{pr.number}
        </EuiLink>{' '}
        {showAuthor && (
          <>
            by <em>{pr.user?.login}</em>
          </>
        )}
        ){' '}
        {hasDuplicates && (
          <EuiIconTip
            color="warning"
            type="alert"
            size="m"
            content={`This PR has multiple patch version labels for ${majorMinorVersion} and may have already been documented in a previous patch release.`}
          />
        )}
        {title.type === 'releaseNoteTitle' && (
          <EuiIconTip
            color="secondary"
            type="iInCircle"
            size="m"
            content={
              <>
                This title was extracted from the PR description. Original PR title was:{' '}
                <em>{title.originalTitle}</em>
              </>
            }
          />
        )}
        {title.type === 'releaseNoteDetails' && (
          <EuiIconTip
            color="secondary"
            type="visText"
            size="m"
            content={
              <>
                This PR had a lengthy release note description, that will be put into the release
                notes and might need to be shortened.
              </>
            }
          />
        )}
      </>
    );
  }
);
