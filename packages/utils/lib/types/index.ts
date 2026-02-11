import { Octokit } from 'octokit';

type GithubReleases = Awaited<
  ReturnType<InstanceType<typeof Octokit>['rest']['repos']['listReleases']>
>['data'];

export type GithubRelease = GithubReleases[number];

export type SupportedRepo = 'contract' | 'sign-protocols';
