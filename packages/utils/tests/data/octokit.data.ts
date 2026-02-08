import { GithubRelease } from '../../lib/types';

export type PartialReleases = Partial<GithubRelease>[];

export const mainNetPrereleaseRelease = {
  id: 1,
  tag_name: '2.0.1-0b08047',
  prerelease: true,
  assets: [
    {
      browser_download_url:
        'https://example.com/contracts-mainnet-2.0.1-0b08047.json',
      name: 'contracts-mainnet-2.0.1-0b08047.json',
    } as any,
    {
      browser_download_url:
        'https://example.com/tokensMap-mainnet-2.0.1-0b08047.json',
      name: 'tokensMap-mainnet-2.0.1-0b08047.json',
    } as any,
  ],
};

export const mainNetStableRelease = {
  id: 2,
  tag_name: '2.0.1-0b08046',
  prerelease: false,
  assets: [
    {
      browser_download_url:
        'https://example.com/contracts-mainnet-2.0.1-0b08046.json',
      name: 'contracts-mainnet-2.0.1-0b08046.json',
    } as any,
    {
      browser_download_url:
        'https://example.com/tokensMap-mainnet-2.0.1-0b08046.json',
      name: 'tokensMap-mainnet-2.0.1-0b08046.json',
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
  tag_name: '2.0.1-0b08041',
  prerelease: true,
  assets: [
    {
      browser_download_url:
        'https://example.com/contracts-testnet-2.0.1-0b08041.json',
      name: 'contracts-testnet-2.0.1-0b08041.json',
    } as any,
  ],
};

export const testNetStableRelease = {
  id: 5,
  tag_name: '2.0.1-0b08042',
  prerelease: false,
  assets: [
    {
      browser_download_url:
        'https://example.com/contracts-testnet-2.0.1-0b08042.json',
      name: 'contracts-testnet-2.0.1-0b08042.json',
    } as any,
  ],
};

export const contractReleases = [
  mainNetPrereleaseRelease,
  mainNetStableRelease,
  {
    id: 3,
    tag_name: '2.0.1-0b08045',
    prerelease: false,
    assets: [
      {
        browser_download_url:
          'https://example.com/contracts-mainnet-2.0.1-0b08045.json',
        name: 'contracts-mainnet-2.0.1-0b08045.json',
      } as any,
    ],
  },
  testNetPrereleaseRelease,
  testNetStableRelease,
  {
    id: 6,
    tag_name: '2.0.1-0b08044',
    prerelease: false,
    assets: [
      {
        browser_download_url:
          'https://example.com/contracts-mainnet-2.0.1-0b08044.json',
        name: 'contracts-mainnet-2.0.1-0b08044.json',
      } as any,
    ],
  },
  {
    id: 7,
    tag_name: '2.0.1-0b08043',
    prerelease: false,
    assets: [
      {
        browser_download_url:
          'https://example.com/contracts-mainnet-2.0.1-0b08043.json',
        name: 'contracts-mainnet-2.0.1-0b08043.json',
      } as any,
    ],
  },
  {
    id: 8,
    tag_name: '2.0.1-0b08042',
    prerelease: false,
    assets: [
      {
        browser_download_url:
          'https://example.com/contracts-mainnet-2.0.1-0b08042.json',
        name: 'contracts-mainnet-2.0.1-0b08042.json',
      } as any,
    ],
  },
  {
    id: 9,
    tag_name: '2.0.1-0b08041',
    prerelease: false,
    assets: [
      {
        browser_download_url:
          'https://example.com/contracts-mainnet-2.0.1-0b08041.json',
        name: 'contracts-mainnet-2.0.1-0b08041.json',
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
