import download from 'download';

import downloadRosenAssets from '../lib/downloadRosenAssets';

import {
  mainNetPrereleaseRelease,
  mainNetStableRelease,
} from './data/octokit.data';

import { mockOctokit } from './mocks/octokit.mock';

jest.mock('download');

describe('downloadRosenAssets', () => {
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
  });

  /**
   * Target:
   * It should download Rosen assets and add a suffix correctly
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
  it('should download Rosen assets and add a suffix correctly', async () => {
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
  });

  /**
   * Target:
   * It should download Rosen assets correctly
   *
   * Dependencies:
   * - mocked Octokit
   * - empty mocked download package
   *
   * Scenario:
   * N/A
   *
   * Expected output:
   * N/A
   */
  it('should not call `download` function if no matching release is found', async () => {
    mockOctokit();
    jest.mocked(download).mockClear();

    await downloadRosenAssets('no-release-net', 'rosen');

    expect(download).toHaveBeenCalledTimes(0);
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
});
