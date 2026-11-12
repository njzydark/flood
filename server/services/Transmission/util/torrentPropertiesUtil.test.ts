import {describe, expect, it} from 'vitest';

import {TransmissionTorrentError, TransmissionTorrentStatus} from '../types/TransmissionTorrentsMethods';
import torrentPropertiesUtil from './torrentPropertiesUtil';

describe('Transmission torrent status', () => {
  const properties = {
    status: TransmissionTorrentStatus.TR_STATUS_SEED,
    rateDownload: 0,
    rateUpload: 1024,
    haveValid: 100,
    totalSize: 100,
    error: TransmissionTorrentError.TR_STAT_OK,
    errorString: '',
  };

  it('keeps active and complete statuses', () => {
    expect(torrentPropertiesUtil.getTorrentStatus(properties)).toEqual(['seeding', 'active', 'complete']);
  });

  it('keeps upstream tracker warnings separate from errors', () => {
    expect(
      torrentPropertiesUtil.getTorrentStatus({
        ...properties,
        error: TransmissionTorrentError.TR_STAT_TRACKER_WARNING,
        errorString: 'Tracker temporarily unavailable',
      }),
    ).toContain('warning');
  });

  it('ignores an exact tracker OK response', () => {
    expect(
      torrentPropertiesUtil.getTorrentStatus({
        ...properties,
        error: TransmissionTorrentError.TR_STAT_TRACKER_ERROR,
        errorString: ' OK ',
      }),
    ).toEqual(['seeding', 'active', 'complete']);
  });

  it.each([
    [TransmissionTorrentError.TR_STAT_TRACKER_ERROR, 'Tracker token expired'],
    [TransmissionTorrentError.TR_STAT_LOCAL_ERROR, 'ok'],
  ])('preserves real errors (%s, %s)', (error, errorString) => {
    expect(torrentPropertiesUtil.getTorrentStatus({...properties, error, errorString})).toContain('error');
  });
});
