import { Octokit } from '@octokit/rest';
import { Endpoints } from '@octokit/types';
import { GITHUB_OWNER, GITHUB_REPO, KIBANA_REPO_ID } from './constants';
import { getOctokit } from './github';
import semver, { SemVer } from 'semver';
import parseLinkHeader from 'parse-link-header';
import { Observable, Subject } from 'rxjs';

type Progress<T> =
  | { type: 'progress'; items: T[]; percentage: number }
  | { type: 'complete'; items: T[] };

export type PrItem = Endpoints['GET /search/issues']['response']['data']['items'][number];
export type Label = PrItem['labels'][number];

const SEMVER_REGEX = /^v(\d+)\.(\d+)\.(\d+)$/;

function filterPrsForVersion(prs: PrItem[], version: string): PrItem[] {
  return prs.filter((pr) => {
    const prVersions = pr.labels
      .filter((label) => label.name.match(SEMVER_REGEX))
      .map((label) => semver.clean(label.name) ?? '');
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

  public async getPrsForVersion(
    version: string,
    excludedLabels: readonly string[] = []
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
        (label) => label.name
      );
    }

    const labelExclusions = [...excludedLabels, ...excludedVersions]
      .map((label) => `-label:"${label}"`)
      .join(' ');
    const options = this.octokit.search.issuesAndPullRequests.endpoint.merge({
      q: `repo:${GITHUB_OWNER}/${GITHUB_REPO} label:${version} is:pr is:merged base:master base:${semVer.major}.x base:${semVer.major}.${semVer.minor} ${labelExclusions}`,
      per_page: 100,
    });

    const progressSubject$ = new Subject<Progress<PrItem>>();

    (async () => {
      const items: PrItem[] = [];
      for await (const response of this.octokit.paginate.iterator<PrItem>(options)) {
        items.push(...filterPrsForVersion(response.data, version));
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

let service: GitHubService;

export function getGitHubService(): GitHubService {
  if (!service) {
    service = new GitHubService(getOctokit());
  }
  return service;
}
