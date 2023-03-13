import download from 'download';

import downloadRosenAssets from '../lib/downloadRosenAssets';

import { RosenAssetsDownloadError } from '../lib';

import {
  mainNetPrereleaseRelease,
  mainNetStableRelease,
} from './data/octokit.data';

import { mockOctokit } from './mocks/octokit.mock';

jest.mock('download');

describe('downloadRosenAssets', () => {
  /**
   * @target `downloadRosenAssets` should download Rosen assets correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - call `downloadRosenAssets` to download mainnet assets in `rosen`
   *   directory
   * @expected
   * - The download function should have been called two times with the download
   *   urls of assets of mainnet stable release, 'rosen' directory name and
   *   truncated file names
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
   * @target `downloadRosenAssets` should download Rosen assets correctly when
   * including prereleases
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - call `downloadRosenAssets` to download mainnet assets in `rosen`
   *   directory while taking prereleases into account when finding a matching
   *   release
   * @expected
   * - The download function should have been called two times with the download
   *   urls of assets of mainnet prerelease release, 'rosen' directory name and
   *   truncated file names
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
   * @target `downloadRosenAssets` should download Rosen assets and add a suffix
   * correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - call `downloadRosenAssets` to download mainnet assets in `rosen`
   *   directory and add a suffix to the asset names
   * @expected
   * - The download function should have been called two times with the download
   *   urls of assets of mainnet stable release, 'rosen' directory name and
   *   truncated file names including the suffix
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
   * @target `downloadRosenAssets` should not call `download` function when no
   * matching release is found
   * @dependencies
   * - mocked Octokit
   * - emptied mocked download package
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - clear download package mock data (so that we can check calls count)
   * - call `downloadRosenAssets` to download releases for a network whose
   *   release doesn't exist
   * @expected
   * - The download function not get called
   */
  it('should not call `download` function when no matching release is found', async () => {
    mockOctokit();
    jest.mocked(download).mockClear();

    await downloadRosenAssets('no-release-net', 'rosen');

    expect(download).toHaveBeenCalledTimes(0);
  });

  /**
   * @target `downloadRosenAssets` should throw an error when an error happens
   * @dependencies
   * - mocked Octokit
   * - mocked download package
   * @scenario
   * - mock Octokit `listReleases` to return 9 releases
   * - mock download package to throw an error
   * - call `downloadRosenAssets` to download mainnet assets in `rosen`
   *   directory
   * @expected
   */
  it('should throw an error when an error happens', async () => {
    mockOctokit();
    jest.mocked(download).mockRejectedValue(new Error('Bad!'));

    const downloadPromise = downloadRosenAssets('mainnet', 'rosen');

    await expect(downloadPromise).rejects.toThrow(RosenAssetsDownloadError);
  });
});
