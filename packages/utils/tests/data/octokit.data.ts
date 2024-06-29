import { GithubRelease } from '../../lib/types';

export type PartialReleases = Partial<GithubRelease>[];

export const mainNetPrereleaseRelease = {
  id: 1,
  tag_name: '1',
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
  tag_name: '2',
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

export const tssTag1 = {
  id: 1,
  tag_name: 'tss-api-1.0.0',
  name: 'tss-api-1.0.0',
  prerelease: false,
  assets: [
    {
      name: 'rosenTss-linux-tss-api-1.0.0.zip',
      browser_download_url:
        'https://example.com/sign-protocols/releases/download/tss-api-1.0.0/rosenTss-linux-tss-api-1.0.0.zip',
    } as any,
    {
      name: 'rosenTss-macOS-tss-api-1.0.0.zip',
      browser_download_url:
        'https://example.com/sign-protocols/releases/download/tss-api-1.0.0/rosenTss-macOS-tss-api-1.0.0.zip',
    } as any,
    {
      name: 'rosenTss-windows-tss-api-1.0.0.zip',
      browser_download_url:
        'https://example.com/sign-protocols/releases/download/tss-api-1.0.0/rosenTss-windows-tss-api-1.0.0.zip',
    } as any,
  ],
};
export const tssTag2 = {
  id: 2,
  tag_name: 'tss-api-2.0.0',
  name: 'tss-api-2.0.0',
  prerelease: false,
  assets: [
    {
      name: 'rosenTss-linux-tss-api-2.0.0.zip',
      browser_download_url:
        'https://example.com/sign-protocols/releases/download/tss-api-2.0.0/rosenTss-linux-tss-api-2.0.0.zip',
    } as any,
    {
      name: 'rosenTss-macOS-tss-api-2.0.0.zip',
      browser_download_url:
        'https://example.com/sign-protocols/releases/download/tss-api-2.0.0/rosenTss-macOS-tss-api-2.0.0.zip',
    } as any,
    {
      name: 'rosenTss-windows-tss-api-2.0.0.zip',
      browser_download_url:
        'https://example.com/sign-protocols/releases/download/tss-api-2.0.0/rosenTss-windows-tss-api-2.0.0.zip',
    } as any,
  ],
};

export const tssTag3PreRelease = {
  id: 3,
  tag_name: 'tss-api-3.0.0',
  name: 'tss-api-3.0.0',
  prerelease: true,
  assets: [
    {
      name: 'rosenTss-linux-tss-api-3.0.0.zip',
      browser_download_url:
        'https://example.com/sign-protocols/releases/download/tss-api-3.0.0/rosenTss-linux-tss-api-3.0.0.zip',
    } as any,
    {
      name: 'rosenTss-macOS-tss-api-3.0.0.zip',
      browser_download_url:
        'https://example.com/sign-protocols/releases/download/tss-api-3.0.0/rosenTss-macOS-tss-api-3.0.0.zip',
    } as any,
    {
      name: 'rosenTss-windows-tss-api-3.0.0.zip',
      browser_download_url:
        'https://example.com/sign-protocols/releases/download/tss-api-3.0.0/rosenTss-windows-tss-api-3.0.0.zip',
    } as any,
  ],
};

export const testNetPrereleaseRelease = {
  id: 4,
  tag_name: '4',
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
  tag_name: '5',
  prerelease: false,
  assets: [
    {
      browser_download_url:
        'https://example.com/contracts-awesomechain-testnet-1.json',
      name: 'contracts-awesomechain-testnet-1.json',
    } as any,
  ],
};

export const contractReleases = [
  mainNetPrereleaseRelease,
  mainNetStableRelease,
  {
    id: 3,
    tag_name: '3',
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
    tag_name: '6',
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
    tag_name: '7',
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
    tag_name: '8',
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
    tag_name: '9',
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

export const tssReleases = [
  mainNetStableRelease, // in case of sign-protocols mono repo we have other tags
  tssTag3PreRelease,
  tssTag2,
  tssTag1,
] satisfies PartialReleases;
