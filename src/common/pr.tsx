import { EuiLink, EuiIconTip } from '@elastic/eui';
import { FC, memo } from 'react';
import { PrItem } from './github-service';
import { extractReleaseNotes, NormalizeOptions, ReleaseNoteDetails } from './pr-utils';

interface PrProps {
  pr: PrItem;
  showAuthor?: boolean;
  showTransformedTitle?: boolean;
  normalizeOptions?: NormalizeOptions;
}

export const Pr: FC<PrProps> = memo(
  ({ pr, showAuthor, showTransformedTitle, normalizeOptions }) => {
    const title: ReleaseNoteDetails = showTransformedTitle
      ? extractReleaseNotes(pr, normalizeOptions)
      : { type: 'title', title: pr.title };
    return (
      <>
        {title.title} (
        <EuiLink target="_blank" href={pr.html_url}>
          #{pr.number}
        </EuiLink>{' '}
        {showAuthor && (
          <>
            by <em>{pr.user.login}</em>
          </>
        )}
        ){' '}
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
