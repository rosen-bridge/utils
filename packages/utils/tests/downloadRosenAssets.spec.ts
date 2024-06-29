import download from 'download';

import downloadRosenAssets from '../lib/downloadRosenAssets';

import { RosenAssetsDownloadError } from '../lib';

import {
  mainNetPrereleaseRelease,
  mainNetStableRelease,
  contractReleases,
} from './data/octokit.data';

import { mockOctokit, mockOctokitGetReleaseByTag } from './mocks/octokit.mock';

jest.mock('download');

describe('downloadRosenAssets', () => {
  beforeEach(() => {
    mockOctokit(contractReleases);
  });

  /**
   * @target `downloadRosenAssets` should download Rosen assets correctly
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return 9 contractReleases
   * - call `downloadRosenAssets` with mainnet chain type and `rosen` download
   *   directory
   * @expected
   * - `download` function should be called with first asset of mainnet stable
   *    release download url, `rosen` download directory and corresponding
   *    truncated asset name
   * - `download` function should be called with second asset of mainnet stable
   *    release download url, `rosen` download directory and corresponding
   *    truncated asset name
   */
  it('should download Rosen assets correctly', async () => {
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
   * - mock Octokit `listReleases` to return 9 contractReleases
   * - call `downloadRosenAssets` with mainnet chain type, `rosen` download
   *   directory and including prereleases
   * @expected
   * - `download` function should be called with first asset of mainnet
   *    prerelease release download url, `rosen` download directory and
   *    corresponding truncated asset name
   * - `download` function should be called with second asset of mainnet
   *    prerelease release download url, `rosen` download directory and
   *    corresponding truncated asset name
   */
  it('should download Rosen assets correctly when including prereleases', async () => {
    jest.mocked(download).mockClear();
    await downloadRosenAssets('mainnet', 'rosen', {
      includePrereleases: true,
    });

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
   * - mock Octokit `listReleases` to return 9 contractReleases
   * - call `downloadRosenAssets` with mainnet chain type, `rosen` download
   *   directory, including prereleases and a providing a suffix
   * @expected
   * - `download` function should be called with first asset of mainnet stable
   *    release download url, `rosen` download directory and corresponding
   *    truncated asset name
   * - `download` function should be called with second asset of mainnet stable
   *    release download url, `rosen` download directory and corresponding
   *    truncated asset name
   */
  it('should download Rosen assets and add a suffix correctly', async () => {
    await downloadRosenAssets('mainnet', 'rosen', {
      nameSuffix: 'suffix',
    });

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
   * @target `downloadRosenAssets` should download a Rosen asset by tag
   * @dependencies
   * - mocked `getReleaseByTag` of Octokit
   * @scenario
   * - call `downloadRosenAssets` with a specific tag
   * @expected
   * - `download` should be called with the assets of "3" tag release
   */
  it('should download a Rosen asset by tag', async () => {
    mockOctokitGetReleaseByTag(contractReleases);
    await downloadRosenAssets('mainnet', 'rosen', {
      tag: '3',
    });

    expect(download).toHaveBeenCalledWith(
      contractReleases[2].assets[0].browser_download_url,
      'rosen',
      {
        filename: 'contracts-awesomechain.json',
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
   * - mock Octokit `listReleases` to return 9 contractReleases
   * - clear download package mock data (so that we can check calls count)
   * - call `downloadRosenAssets` with "no-release-net" chain type and `rosen`
   *   download directory
   * @expected
   * - `download` function should not get called
   */
  it('should not call `download` function when no matching release is found', async () => {
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
   * - mock Octokit `listReleases` to return 9 contractReleases
   * - mock download package to throw an error
   * - call `downloadRosenAssets` with mainnet chain type and `rosen` download
   *   directory
   * @expected
   * - `download` function should throw `RosenAssetsDownloadError`
   */
  it('should throw an error when an error happens', async () => {
    jest.mocked(download).mockRejectedValue(new Error('Bad!'));

    const downloadPromise = downloadRosenAssets('mainnet', 'rosen');

    await expect(downloadPromise).rejects.toThrow(RosenAssetsDownloadError);
  });
});
