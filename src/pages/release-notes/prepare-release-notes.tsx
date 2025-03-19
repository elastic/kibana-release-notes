import { EuiText, EuiCode, EuiCallOut, EuiSpacer } from '@elastic/eui';
import React, { FC, useMemo } from 'react';
import { groupPrs, Pr, PrItem } from '../../common';
import { groupByArea } from '../../common/pr-utils';
import { useActiveConfig } from '../../config';
import { GroupedPrList, UncategorizedPr } from './components';

interface Props {
  prs: PrItem[];
}

export const PrepareReleaseNotes: FC<Props> = ({ prs }) => {
  const config = useActiveConfig();
  const groupedPrs = useMemo(() => groupPrs(prs), [prs]);

  const [featurePrs, unknownFeature] = useMemo(
    () => groupByArea(groupedPrs.features, config),
    [config, groupedPrs.features]
  );

  const [enhancementPrs, unknownEnhancements] = useMemo(
    () => groupByArea(groupedPrs.enhancements, config),
    [config, groupedPrs.enhancements]
  );

  const [fixesPr, unknownFixes] = useMemo(
    () => groupByArea(groupedPrs.fixes, config),
    [config, groupedPrs.fixes]
  );

  const unknownPrs = [...unknownFeature, ...unknownEnhancements, ...unknownFixes].filter(
    // Deduplicate list, since a PR could have had multiple release_note labels
    (pr, index, arr) =>
      !arr.some((otherPr, otherIndex) => otherIndex !== index && otherPr.id === pr.id)
  );

  return (
    <EuiText>
      {groupedPrs.missingLabel.length > 0 && (
        <>
          <h2>Missing release_note label</h2>
          <EuiCallOut color="warning">
            This should usually not happen since the CI validates a release_note label is present on
            every PR. Most likely this means the release_note label got removed after the PR was
            merged. Please make sure all of those PRs get a proper <EuiCode>release_note:</EuiCode>{' '}
            label and then <em>Reload PRs</em>.
          </EuiCallOut>
          <EuiSpacer size="m" />
          <ul>
            {groupedPrs.missingLabel.map((pr) => (
              <li key={pr.id}>
                <Pr pr={pr} showAuthor={true} />
              </li>
            ))}
          </ul>
        </>
      )}
      {unknownPrs.length > 0 && (
        <>
          <h2>Uncategorized PRs</h2>
          <EuiCallOut color="primary">
            <p>
              Found {unknownPrs.length} PRs that have no labels on them that categorize them. You
              can either click on a label to assign that label to a specific category henceforth (on
              your computer) or just manually sort them later in the release notes into a specific
              category.
            </p>
            <p>
              This list does not include <em>deprecation</em> and <em>breaking</em> PRs since they
              are not rendered grouped in the release notes.
            </p>
          </EuiCallOut>
          <EuiSpacer size="m" />
          {unknownPrs.map((pr) => (
            <React.Fragment key={pr.id}>
              <UncategorizedPr pr={pr} />
              <EuiSpacer size="s" />
            </React.Fragment>
          ))}
        </>
      )}
      {groupedPrs.breaking.length > 0 && (
        <>
          <h2>
            Breaking (<EuiCode>release_note:breaking</EuiCode>)
          </h2>
          <ul>
            {groupedPrs.breaking.map((pr) => (
              <li key={`breaking-${pr.id}`}>
                <Pr pr={pr} showTransformedTitle={true} />
              </li>
            ))}
          </ul>
        </>
      )}
      {groupedPrs.deprecation.length > 0 && (
        <>
          <h2>
            Deprecations (<EuiCode>release_note:deprecation</EuiCode>)
          </h2>
          <ul>
            {groupedPrs.deprecation.map((pr) => (
              <li key={`deprecation-${pr.id}`}>
                <Pr pr={pr} showTransformedTitle={true} />
              </li>
            ))}
          </ul>
        </>
      )}
      {Object.keys(featurePrs).length > 0 && (
        <>
          <h2>
            Features (<EuiCode>release_note:feature</EuiCode>)
          </h2>
          <GroupedPrList groupedPrs={featurePrs} groups={config.areas} keyPrefix="features" />
        </>
      )}
      {Object.keys(enhancementPrs).length > 0 && (
        <>
          <h2>
            Enhancements (<EuiCode>release_note:enhancements</EuiCode>)
          </h2>
          <GroupedPrList
            groupedPrs={enhancementPrs}
            groups={config.areas}
            keyPrefix="enhancements"
          />
        </>
      )}
      {Object.keys(fixesPr).length > 0 && (
        <>
          <h2>
            Fixes (<EuiCode>release_note:fix</EuiCode>)
          </h2>
          <GroupedPrList groupedPrs={fixesPr} groups={config.areas} keyPrefix="fixes" />
        </>
      )}
    </EuiText>
  );
};
