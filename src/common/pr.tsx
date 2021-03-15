import { EuiLink } from '@elastic/eui';
import { FC, memo } from 'react';
import { PrItem } from './github-service';
import { NormalizeOptions, normalizeTitle } from './pr-utils';

interface PrProps {
  pr: PrItem;
  showAuthor?: boolean;
  showTransformedTitle?: boolean;
  normalizeOptions?: NormalizeOptions;
}

export const Pr: FC<PrProps> = memo(
  ({ pr, showAuthor, showTransformedTitle, normalizeOptions }) => {
    return (
      <>
        {showTransformedTitle ? normalizeTitle(pr.title, normalizeOptions) : pr.title} (
        <EuiLink target="_blank" href={pr.html_url}>
          #{pr.number}
        </EuiLink>{' '}
        {showAuthor && (
          <>
            by <em>{pr.user.login}</em>
          </>
        )}
        )
      </>
    );
  }
);
