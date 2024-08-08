import { EuiCallOut } from '@elastic/eui';
import { FC, Fragment, memo, useMemo } from 'react';
import { Pr, PrItem } from '../../../common';
import { Config } from '../../../config';

interface Props {
  groupedPrs: { [group: string]: PrItem[] };
  groups: Config['areas'];
  keyPrefix: string;
  repoIsPrivate: boolean | undefined;
}

export const GroupedPrList: FC<Props> = memo(({ groupedPrs, groups, keyPrefix, repoIsPrivate }) => {
  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.title.localeCompare(b.title)),
    [groups]
  );
  return (
    <div>
      {sortedGroups.map((group) => {
        const prs = groupedPrs[group.title];
        if (!prs) {
          return null;
        }

        return (
          <Fragment key={`${keyPrefix}-${group.title}`}>
            <h3>{group.title}</h3>
            {group.options?.textOverwriteTemplate && (
              <EuiCallOut
                color="primary"
                iconType="iInCircle"
                title="Those PRs won't appear in the release notes, but instead the following text will be rendered:"
              >
                {group.options.textOverwriteTemplate}
              </EuiCallOut>
            )}
            <ul>
              {prs.map((pr) => (
                <li key={pr.id}>
                  <Pr
                    pr={pr}
                    showTransformedTitle={true}
                    normalizeOptions={group.options}
                    repoIsPrivate={repoIsPrivate}
                  />
                </li>
              ))}
            </ul>
          </Fragment>
        );
      })}
    </div>
  );
});
