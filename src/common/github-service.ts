import { useMemo } from 'react';
import { Octokit } from '@octokit/rest';
import uniq from 'lodash.uniq';
import { Endpoints, RequestError } from '@octokit/types';
import { GITHUB_OWNER, GITHUB_REPO, KIBANA_REPO_ID } from './constants';
import { getOctokit } from './github';
import semver, { SemVer } from 'semver';
import parseLinkHeader from 'parse-link-header';
import { Observable, Subject } from 'rxjs';
import { useNavigate } from 'react-router-dom';

type Progress<T> =
  | { type: 'progress'; items: T[]; percentage: number }
  | { type: 'complete'; items: T[] };

export type PrItem = Endpoints['GET /search/issues']['response']['data']['items'][number];
export type Label = PrItem['labels'][number];

const SEMVER_REGEX = /^v(\d+)\.(\d+)\.(\d+)$/;

function filterPrsForVersion(
  prs: PrItem[],
  version: string,
  ignoredVersionLabels: readonly string[] = []
): PrItem[] {
  return prs.filter((pr) => {
    const prVersions = pr.labels
      .filter((label) => label.name?.match(SEMVER_REGEX))
      .filter((label) => label.name && !ignoredVersionLabels.includes(label.name))
      .map((label) => semver.clean(label.name ?? '') ?? '');
    // Check if there is any version label below the one we are looking for
    // which would mean this PR has already been released (and blogged about)
    // in an earlier dev documentation blog post.
    return !prVersions.some((verLabel) => semver.lt(verLabel, version));
  });
}

class GitHubService {
  constructor(private octokit: Octokit) {}

  public async getUpcomingReleaseVersions(): Promise<string[]> {
    const response = await this.octokit.repos.listReleases({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      per_page: 10,
    });

    const tags = response.data
      .filter((release) => !release.prerelease)
      .map((release) => semver.parse(release.tag_name))
      .filter((tag): tag is SemVer => !!tag);

    if (!tags.length) {
      return [];
    }

    const latestVersion = tags.sort((v1, v2) => v2.compare(v1))[0];
    const previousPatch = tags.find(
      (version) =>
        version.major === latestVersion.major && version.minor === latestVersion.minor - 1
    );

    return [
      ...[previousPatch ? [previousPatch.inc('patch')] : []],
      latestVersion.inc('patch').format(),
      latestVersion.inc('minor').format(),
      latestVersion.inc('major').format(),
    ].map((v) => `v${v}`);
  }

  /**
   * Retrieves the highest version labels existing for a specific major version.
   * @param major The major version to retrieve labels for
   * @param minorCount The amount of highest minors to retrieve all labels for
   */
  private async getHighestVersionsForMajor(major: number, minorCount: number): Promise<string[]> {
    const allLabelsResponse = await this.octokit.search.labels({
      repository_id: KIBANA_REPO_ID,
      q: `v${major}.`,
      per_page: 100,
      sort: 'created',
      order: 'desc',
    });

    const labels = allLabelsResponse.data.items
      .map(({ name }) => semver.parse(name))
      .filter((v): v is semver.SemVer => v !== null);

    if (!labels.length) {
      return [];
    }

    const highestMinor = labels.reduce((highest, current) => Math.max(current.minor, highest), 0);
    // Create an array listing the highest x minors (x === minorCount), like [15, 14, 13].
    // It will make sure this never goes below 0.
    const highestMinors = uniq(
      [...Array(minorCount)].map((_, idx) => Math.max(0, highestMinor - idx))
    );

    return labels
      .filter((label) => label.major === major && highestMinors.includes(label.minor))
      .map((label) => `v${label.version}`);
  }

  private async getVersionsForMinor(major: number, minors: number[]): Promise<string[]> {
    const labelsResponse = await this.octokit.search.labels({
      repository_id: KIBANA_REPO_ID,
      q: minors.map((minor) => `v${major}.${minor}.`).join(' '),
      per_page: 100,
      sort: 'created',
      order: 'desc',
    });

    return labelsResponse.data.items
      .filter((label) => semver.parse(label.name) !== null)
      .map((l) => l.name);
  }

  /**
   * This method checks for a given version if there exist past release labels
   * that have no actual release linked with them, i.e. labels have been created
   * but not been released. This will only check back the prior two minor versions
   * and won't work across major version boundaries.
   */
  public async getUnreleasedPastLabels(version: string): Promise<string[]> {
    const v = semver.parse(version);
    if (!v) {
      // If the version was not valid or we're generating for a major version we're
      // not finding anything. We can't do this for major versions, since we don't
      // know what the last minor version of the previous major was and searching for
      // e.g. v7.* will result in too many matches.
      return [];
    }

    let priorVersionLabels: string[];
    if (v.minor === 1) {
      // If we're generating for a x.1.y version, check the x.0 version and the highest
      // minor of the previous major.
      priorVersionLabels = [
        ...(await this.getHighestVersionsForMajor(v.major - 1, 1)),
        ...(await this.getVersionsForMinor(v.major, [v.minor - 1])),
      ];
    } else if (v.minor === 0) {
      // If we're generating for a x.0.y version, check the two highest minors of the previous major
      priorVersionLabels = await this.getHighestVersionsForMajor(v.major - 1, 2);
    } else {
      // In other cases just check the previous two minors
      priorVersionLabels = await this.getVersionsForMinor(v.major, [v.minor - 1, v.minor - 2]);
    }

    // Check for each of the previous highest patch labels if there is a corresponding release for them
    const releases = await Promise.allSettled(
      priorVersionLabels.map((label) => {
        return this.octokit.repos.getReleaseByTag({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          tag: label,
        });
      })
    );

    return (
      releases
        // Map the status of the release check back to the release label
        .map((release, index) => ({ status: release.status, label: priorVersionLabels[index] }))
        // Filter for only releases which had no release (which will return a 404)
        .filter((release) => release.status === 'rejected')
        // Just extract the label of those
        .map(({ label }) => label)
        .sort()
    );
  }

  public async getApiChanesPrsForVersion(version: string) {
    const options = this.octokit.search.issuesAndPullRequests.endpoint.merge({
      q: `repo:${GITHUB_OWNER}/${GITHUB_REPO} label:release_note:plugin_api_changes label:${version}`,
    });
    const items = await this.octokit.paginate<PrItem>(options);
    return filterPrsForVersion(items, version);
  }

  public async getPrsForVersion(
    version: string,
    excludedLabels: readonly string[] = [],
    includedLabels: readonly string[] = [],
    ignoredVersionLabels: readonly string[] = []
  ): Promise<Observable<Progress<PrItem>>> {
    const semVer = semver.parse(version);

    if (!semVer) {
      throw new Error('Invalid version entered');
    }

    let excludedVersions: string[] = [];

    if (semVer && semVer.patch === 0 && semVer.minor === 0) {
      // If we're loading a major version we need some special logic to exclude all PRs that
      // already have been part of the previous major version. Therefore we're getting all previous
      // major label and exclude them in the search.
      const labelsQuery = this.octokit.search.labels.endpoint.merge({
        q: `v${semVer.major - 1}`,
        repository_id: KIBANA_REPO_ID,
      });

      excludedVersions = (await this.octokit.paginate<Label>(labelsQuery)).map(
        (label) => label.name ?? ''
      );
    }

    const labelExclusions = [...excludedLabels, ...excludedVersions]
      .map((label) => `-label:"${label}"`)
      .join(' ');
    const labelInclusion =
      includedLabels.length > 0 ? `label:${includedLabels.map((l) => `"${l}"`).join(',')}` : '';
    const options = this.octokit.search.issuesAndPullRequests.endpoint.merge({
      q:
        `repo:${GITHUB_OWNER}/${GITHUB_REPO} label:${version} is:pr is:merged ` +
        `base:master base:main base:${semVer.major}.x base:${semVer.major}.${semVer.minor} ` +
        `${labelExclusions} ${labelInclusion}`,
      per_page: 100,
    });

    const progressSubject$ = new Subject<Progress<PrItem>>();

    (async () => {
      const items: PrItem[] = [];
      for await (const response of this.octokit.paginate.iterator<PrItem>(options)) {
        items.push(...filterPrsForVersion(response.data, version, ignoredVersionLabels));
        if (response.headers.link) {
          const links = parseLinkHeader(response.headers.link);
          if (links?.last?.page) {
            const currentPage = Number(new URL(response.url).searchParams.get('page')) || 1;
            progressSubject$.next({
              type: 'progress',
              percentage: currentPage / Number(links.last.page),
              items,
            });
          }
        }
      }
      progressSubject$.next({ type: 'complete', items });
      progressSubject$.complete();
    })();

    return progressSubject$.asObservable();
  }
}

let service: GitHubService | undefined;

type GitHubErrorHandler = (error: Error) => void;

export function clearGitHubService(): void {
  service = undefined;
}

export function useGitHubService(): [GitHubService, GitHubErrorHandler] {
  const navigate = useNavigate();
  return useMemo(() => {
    if (!service) {
      service = new GitHubService(getOctokit());
    }

    const errorHandler = (error: Error | RequestError): void => {
      if (
        'status' in error &&
        (error.status === 401 || error.status === 403 || error.status === 422)
      ) {
        navigate('/github', { state: { statusCode: error.status } });
        return;
      }
      throw error;
    };
    return [service, errorHandler];
    // We're depending here on an "outside scope" variable service which will be reset
    // via clearGitHubService. This is fine, since we're never calling clearGitHubService
    // while there's still a page open using this hook, that would need to be rerendered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, service]);
}
