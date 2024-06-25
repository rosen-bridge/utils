import { GithubRelease } from '../../lib/types';

export type PartialReleases = Partial<GithubRelease>[];

export const mainNetPrereleaseRelease = {
  id: 1,
  tag: '1',
  prerelease: true,
  assets: [
    {
      browser_download_url:
        'https://example.com/contracts-awesomechain-mainnet-7.json',
      name: 'contracts-awesomechain-mainnet-7.json',
    } as any,
    {
      browser_download_url: 'https://example.com/tokensMap-mainnet-7.json',
      name: 'tokensMap-mainnet-6.json',
    } as any,
  ],
};

export const mainNetStableRelease = {
  id: 2,
  tag: '2',
  prerelease: false,
  assets: [
    {
      browser_download_url:
        'https://example.com/contracts-awesomechain-mainnet-6.json',
      name: 'contracts-awesomechain-mainnet-6.json',
    } as any,
    {
      browser_download_url: 'https://example.com/tokensMap-mainnet-6.json',
      name: 'tokensMap-mainnet-6.json',
    } as any,
  ],
};

export const testNetPrereleaseRelease = {
  id: 4,
  tag: '4',
  prerelease: true,
  assets: [
    {
      browser_download_url:
        'https://example.com/contracts-awesomechain-testnet-1.json',
      name: 'contracts-awesomechain-testnet-1.json',
    } as any,
  ],
};

export const testNetStableRelease = {
  id: 5,
  tag: '5',
  prerelease: false,
  assets: [
    {
      browser_download_url:
        'https://example.com/contracts-awesomechain-testnet-1.json',
      name: 'contracts-awesomechain-testnet-1.json',
    } as any,
  ],
};

export const releases = [
  mainNetPrereleaseRelease,
  mainNetStableRelease,
  {
    id: 3,
    tag: '3',
    prerelease: false,
    assets: [
      {
        browser_download_url:
          'https://example.com/contracts-awesomechain-mainnet-5.json',
        name: 'contracts-awesomechain-mainnet-5.json',
      } as any,
    ],
  },
  testNetPrereleaseRelease,
  testNetStableRelease,
  {
    id: 6,
    tag: '6',
    prerelease: false,
    assets: [
      {
        browser_download_url:
          'https://example.com/contracts-awesomechain-mainnet-4.json',
        name: 'contracts-awesomechain-mainnet-4.json',
      } as any,
    ],
  },
  {
    id: 7,
    tag: '7',
    prerelease: false,
    assets: [
      {
        browser_download_url:
          'https://example.com/contracts-awesomechain-mainnet-3.json',
        name: 'contracts-awesomechain-mainnet-3.json',
      } as any,
    ],
  },
  {
    id: 8,
    tag: '8',
    prerelease: false,
    assets: [
      {
        browser_download_url:
          'https://example.com/contracts-awesomechain-mainnet-2.json',
        name: 'contracts-awesomechain-mainnet-2.json',
      } as any,
    ],
  },
  {
    id: 9,
    tag: '9',
    prerelease: false,
    assets: [
      {
        browser_download_url:
          'https://example.com/contracts-awesomechain-mainnet-1.json',
        name: 'contracts-awesomechain-mainnet-1.json',
      } as any,
    ],
  },
] satisfies PartialReleases;
