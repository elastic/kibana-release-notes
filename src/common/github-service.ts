import { Octokit } from '@octokit/rest';
import { Endpoints } from '@octokit/types';
// import { GITHUB_OWNER, GITHUB_REPO } from './constants';
import { getOctokit } from './github';
import semver from 'semver';
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
    // const response = await this.octokit.repos.listReleases({
    //   owner: GITHUB_OWNER,
    //   repo: GITHUB_REPO,
    // });

    // const tags = response.data
    //   .map((release) => semver.clean(release.tag_name))
    //   .filter((tag): tag is string => !!tag);

    // return tags;

    return ['v7.11.2', 'v7.12.0', 'v7.12.1', 'v7.13.0'];
  }

  public getPrsForVersion(
    version: string,
    excludedLabels: readonly string[] = []
  ): Observable<Progress<PrItem>> {
    // TODO: this won't work out for major versions, since they have too many PRs using their label, need
    //       to somehow filter out previously released PRs (with older version labels) already in the query
    const labelExclusions = excludedLabels.map((label) => `-label:"${label}"`).join(' ');
    const options = this.octokit.search.issuesAndPullRequests.endpoint.merge({
      q: `repo:elastic/kibana label:${version} is:pr is:merged ${labelExclusions}`,
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
