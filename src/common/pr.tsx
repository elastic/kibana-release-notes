import { EuiLink, EuiIconTip } from '@elastic/eui';
import { FC, memo } from 'react';
import { PrItem } from './github-service';
import { extractReleaseNotes, NormalizeOptions, ReleaseNoteDetails } from './pr-utils';

interface PrProps {
  pr: PrItem;
  showAuthor?: boolean;
  showTransformedTitle?: boolean;
  normalizeOptions?: NormalizeOptions;
  repoIsPrivate?: boolean;
}

const getLinkAndAuthor = (prProps: PrProps) => {
  const { pr, showAuthor, repoIsPrivate } = prProps;

  if (repoIsPrivate && !showAuthor) {
    return '';
  }

  return (
    <>
      {' ('}
      {!repoIsPrivate && (
        <EuiLink target="_blank" href={pr.html_url}>
          {`#${pr.number}`}
        </EuiLink>
      )}
      {showAuthor && (
        <>
          {`${repoIsPrivate ? '' : ' '}by `}
          <em>{pr.user?.login}</em>
        </>
      )}
      {')'}
    </>
  );
};

export const Pr: FC<PrProps> = memo((props) => {
  const { pr, showTransformedTitle, normalizeOptions } = props;
  const title: ReleaseNoteDetails = showTransformedTitle
    ? extractReleaseNotes(pr, normalizeOptions)
    : { type: 'title', title: pr.title };
  return (
    <>
      {title.title}
      {getLinkAndAuthor(props)}
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
});
