import { Octokit } from 'octokit';

export type ArrayElement<T extends any[]> = T extends (infer Element)[]
  ? Element
  : never;

type GithubReleases = Awaited<
  ReturnType<InstanceType<typeof Octokit>['rest']['repos']['listReleases']>
>['data'];

export type GithubRelease = ArrayElement<GithubReleases>;
