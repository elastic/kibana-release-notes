import { EuiCallOut } from '@elastic/eui';
import { FC, memo } from 'react';
import { Pr, PrItem } from '../../common';
import { Config } from '../../config';

interface Props {
  groupedPrs: { [group: string]: PrItem[] };
  groups: Config['areas'];
}

export const GroupedPrList: FC<Props> = memo(({ groupedPrs, groups }) => {
  return (
    <>
      {groups.map((group) => {
        const prs = groupedPrs[group.title];
        if (!prs) {
          return null;
        }

        return (
          <>
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
                  <Pr pr={pr} showTransformedTitle={true} normalizeOptions={group.options} />
                </li>
              ))}
            </ul>
          </>
        );
      })}
    </>
  );
});
