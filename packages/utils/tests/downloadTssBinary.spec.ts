import download from 'download';

import { downloadTssBinary } from '../lib';
import { RosenAssetsDownloadError } from '../lib';

import {
  tssReleases,
  tssTag1,
  tssTag2,
  tssTag3PreRelease,
} from './data/octokit.data';

import { mockOctokit, mockOctokitGetReleaseByTag } from './mocks/octokit.mock';

jest.mock('download');

describe('downloadTssBinary', () => {
  beforeEach(() => {
    mockOctokit(tssReleases);
  });

  /**
   * @target `downloadTssBinary` should download Tss binary correctly by specific tag
   * @dependencies
   * - mocked Octokit
   * - mocked Octokit GetReleaseByTag
   * @scenario
   * - mock Octokit `listReleases` to return tssReleases
   * - mock Octokit GetReleaseByTag to return desire release
   * - call `downloadTssBinary` with Windows OS name, `tss-api-1.0.0` and `rosen` download
   *   directory
   * @expected
   * - `download` function should be called with third asset of tss-api stable
   *    release (windows) download url and `bin` download directory
   */
  it('should download Tss binary correctly with specific tag', async () => {
    mockOctokitGetReleaseByTag(tssReleases);
    await downloadTssBinary('bin', {
      osName: 'windows',
      tag: 'tss-api-1.0.0',
      regex: false,
    });

    expect(download).toHaveBeenCalledWith(
      tssTag1.assets[2].browser_download_url,
      'bin'
    );
  });

  /**
   * @target `downloadTssBinary` should download Tss binary correctly by
   *  prefix of a tag
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return tssReleases
   * - call `downloadTssBinary` with linux OS name, prefix tag `tss-api` and
   * regex should be true
   * @expected
   * - `download` function should be called with first asset of tss-api stable
   *    release (linux) download url and `bin` download directory
   */
  it('should download Tss binary correctly with prefix of tag', async () => {
    await downloadTssBinary('bin', {
      osName: 'linux',
      tag: 'tss-api',
      regex: true,
    });

    expect(download).toHaveBeenCalledWith(
      tssTag2.assets[0].browser_download_url,
      'bin'
    );
  });

  /**
   * @target `downloadTssBinary` should download Tss binary correctly by
   *  prefix of a tag for an included prereleases release
   * @dependencies
   * - mocked Octokit
   * @scenario
   * - mock Octokit `listReleases` to return tssReleases
   * - call `downloadTssBinary` with linux OS name, prefix tag `tss-api`,
   *  enable includePrereleases and regex should be true
   * @expected
   * - `download` function should be called with first asset of tss-api prerelease
   *    release (linux) download url and `bin` download directory
   */
  it('should download prerelease Tss binary correctly with prefix of tag', async () => {
    await downloadTssBinary('bin', {
      osName: 'linux',
      tag: 'tss-api',
      regex: true,
      includePrereleases: true,
    });

    expect(download).toHaveBeenCalledWith(
      tssTag3PreRelease.assets[0].browser_download_url,
      'bin'
    );
  });

  /**
   * @target `downloadTssBinary` should not call `download` function when no
   * matching release is found
   * @dependencies
   * - mocked Octokit
   * - emptied mocked download package
   * @scenario
   * - mock Octokit `listReleases` to return tssReleases
   * - clear download package mock data (so that we can check calls count)
   * - call `downloadTssBinary` with "no-release-tag", osName linux and `bin`
   *   download directory
   * @expected
   * - `download` function should not get called
   */
  it('should not call `download` function when no matching release is found', async () => {
    jest.mocked(download).mockClear();

    await downloadTssBinary('bin', {
      osName: 'linux',
      tag: 'no-release-tag',
      regex: true,
    });

    expect(download).toHaveBeenCalledTimes(0);
  });

  /**
   * @target `downloadTssBinary` should throw an error when an error happens
   * @dependencies
   * - mocked Octokit
   * - mocked download package
   * @scenario
   * - mock Octokit `listReleases` to return tssReleases
   * - mock download package to throw an error
   * - call `downloadTssBinary` with linux OS name, prefix tag `tss-api` and
   *    regex should be true
   * @expected
   * - `download` function should throw `RosenAssetsDownloadError`
   */
  it('should throw an error when an error happens', async () => {
    jest.mocked(download).mockRejectedValue(new Error('Bad!'));

    const downloadPromise = downloadTssBinary('bin', {
      osName: 'linux',
      tag: 'tss-api',
      regex: true,
    });

    await expect(downloadPromise).rejects.toThrow(RosenAssetsDownloadError);
  });
});
