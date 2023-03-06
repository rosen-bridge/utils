import { GithubRelease } from '../../lib/types';

export type PartialReleases = Partial<GithubRelease>[];

export const releases = [
  {
    id: 1,
    prerelease: true,
    assets: [
      {
        name: 'contracts-awesomechain-mainnet-7.json',
      } as any,
    ],
  },
  {
    id: 2,
    prerelease: false,
    assets: [
      {
        name: 'contracts-awesomechain-mainnet-6.json',
      } as any,
    ],
  },
  {
    id: 3,
    prerelease: false,
    assets: [
      {
        name: 'contracts-awesomechain-mainnet-5.json',
      } as any,
    ],
  },
  {
    id: 4,
    prerelease: true,
    assets: [
      {
        name: 'contracts-awesomechain-testnet-1.json',
      } as any,
    ],
  },
  {
    id: 5,
    prerelease: false,
    assets: [
      {
        name: 'contracts-awesomechain-testnet-1.json',
      } as any,
    ],
  },
  {
    id: 6,
    prerelease: false,
    assets: [
      {
        name: 'contracts-awesomechain-mainnet-4.json',
      } as any,
    ],
  },
  {
    id: 7,
    prerelease: false,
    assets: [
      {
        name: 'contracts-awesomechain-mainnet-3.json',
      } as any,
    ],
  },
  {
    id: 8,
    prerelease: false,
    assets: [
      {
        name: 'contracts-awesomechain-mainnet-2.json',
      } as any,
    ],
  },
  {
    id: 9,
    prerelease: false,
    assets: [
      {
        name: 'contracts-awesomechain-mainnet-1.json',
      } as any,
    ],
  },
] satisfies PartialReleases;
