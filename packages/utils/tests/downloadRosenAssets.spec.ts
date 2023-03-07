import download from 'download';

import downloadRosenAssets from '../lib/downloadRosenAssets';

import {
  mainNetPrereleaseRelease,
  mainNetStableRelease,
} from './data/octokit.data';

import { mockOctokit } from './mocks/octokit.mock';

jest.mock('download');

/**
 * Target:
 * It should download Rosen assets correctly
 *
 * Dependencies:
 * - mocked Octokit
 *
 * Scenario:
 * N/A
 *
 * Expected output:
 * N/A
 */
it('should download Rosen assets correctly', async () => {
  mockOctokit();

  await downloadRosenAssets('mainnet', 'rosen');

  expect(download).toHaveBeenCalledWith(
    mainNetStableRelease.assets[0].browser_download_url,
    'rosen',
    {
      filename: 'contracts-awesomechain.json',
    }
  );
  expect(download).toHaveBeenCalledWith(
    mainNetStableRelease.assets[1].browser_download_url,
    'rosen',
    {
      filename: 'tokensMap.json',
    }
  );

  expect(true).toBe(true);
});

/**
 * Target:
 * It should download Rosen assets correctly when including prereleases
 *
 * Dependencies:
 * - mocked Octokit
 *
 * Scenario:
 * N/A
 *
 * Expected output:
 * N/A
 */
it('should download Rosen assets correctly when including prereleases', async () => {
  mockOctokit();

  await downloadRosenAssets('mainnet', 'rosen', true);

  expect(download).toHaveBeenCalledWith(
    mainNetPrereleaseRelease.assets[0].browser_download_url,
    'rosen',
    {
      filename: 'contracts-awesomechain.json',
    }
  );
  expect(download).toHaveBeenCalledWith(
    mainNetPrereleaseRelease.assets[1].browser_download_url,
    'rosen',
    {
      filename: 'tokensMap.json',
    }
  );

  expect(true).toBe(true);
});

/**
 * Target:
 * It should download Rosen assets correctly, adding a suffix when provided
 *
 * Dependencies:
 * - mocked Octokit
 *
 * Scenario:
 * N/A
 *
 * Expected output:
 * N/A
 */
it('should download Rosen assets correctly, adding a suffix when provided', async () => {
  mockOctokit();

  await downloadRosenAssets('mainnet', 'rosen', false, 'suffix');

  expect(download).toHaveBeenCalledWith(
    mainNetStableRelease.assets[0].browser_download_url,
    'rosen',
    {
      filename: 'contracts-awesomechain-suffix.json',
    }
  );
  expect(download).toHaveBeenCalledWith(
    mainNetStableRelease.assets[1].browser_download_url,
    'rosen',
    {
      filename: 'tokensMap-suffix.json',
    }
  );

  expect(true).toBe(true);
});

/**
 * Target:
 * It should throw an error if an error happens
 *
 * Dependencies:
 * - mocked Octokit
 * - mocked download package (throwing an error)
 *
 * Scenario:
 * N/A
 *
 * Expected output:
 * N/A
 */
it('should throw an error if an error happens', async () => {
  mockOctokit();
  jest.mocked(download).mockRejectedValue(new Error('Bad!'));

  const downloadPromise = downloadRosenAssets(
    'mainnet',
    'rosen',
    false,
    'suffix'
  );

  await expect(downloadPromise).rejects.toThrow('');
});
