import classnames from 'classnames';
import {computed} from 'mobx';
import {CSSProperties, FC, KeyboardEvent, MouseEvent, TouchEvent, useEffect, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import {useLongPress} from 'react-use';

import {defaultFloodSettings} from '@shared/schema/FloodSettings';

import SettingStore from '@client/stores/SettingStore';
import {torrentStatusClasses} from '@client/util/torrentStatus';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import {getContextMenuItems} from './TorrentListContextMenu';
import TorrentListRowCondensed from './TorrentListRowCondensed';
import TorrentListRowExpanded from './TorrentListRowExpanded';

const displayContextMenu = (hash: string, event: KeyboardEvent | MouseEvent | TouchEvent) => {
  if (event.cancelable === true) {
    event.preventDefault();
  }

  const mouseClientX = (event as unknown as MouseEvent).clientX;
  const mouseClientY = (event as unknown as MouseEvent).clientY;
  const touchClientX = (event as unknown as TouchEvent).touches?.[0].clientX;
  const touchClientY = (event as unknown as TouchEvent).touches?.[0].clientY;

  if (!TorrentStore.selectedTorrents.includes(hash)) {
    TorrentStore.setSelectedTorrents({hash, event});
  }

  const {torrentContextMenuActions = defaultFloodSettings.torrentContextMenuActions} = SettingStore.floodSettings;
  const torrent = TorrentStore.torrents[hash];

  UIStore.setActiveContextMenu({
    id: 'torrent-list-item',
    clickPosition: {
      x: mouseClientX || touchClientX || 0,
      y: mouseClientY || touchClientY || 0,
    },
    items: getContextMenuItems(torrent).filter((item) => {
      if (item.type === 'separator') {
        return true;
      }

      return torrentContextMenuActions.some((action) => action.id === item.action && action.visible === true);
    }),
  });
};

const displayTorrentDetails = (hash: string) => UIStore.setActiveModal({id: 'torrent-details', hash});

const selectTorrent = (hash: string, event: KeyboardEvent | MouseEvent | TouchEvent) =>
  TorrentStore.setSelectedTorrents({hash, event});

const onKeyDown = (hash: string, e: KeyboardEvent) => {
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'ContextMenu') {
    e.preventDefault();
    if (TorrentStore.selectedTorrents.includes(hash)) {
      if (e.key === 'Enter') {
        displayTorrentDetails(hash);
      } else if (e.key === 'ContextMenu') {
        displayContextMenu(hash, e);
      }
    } else {
      selectTorrent(hash, e);
    }
  }
};

interface TorrentListRowProps {
  hash: string;
  style: CSSProperties;
}

const TorrentListRow: FC<TorrentListRowProps> = observer(({hash, style}: TorrentListRowProps) => {
  const touchStart = useRef<{x: number; y: number; hash: string; longPressed: boolean} | null>(null);
  const lastTap = useRef<{x: number; y: number; time: number; hash: string} | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const isCondensed = SettingStore.floodSettings.torrentListViewSize === 'condensed';
  const isSelected = computed(() => TorrentStore.selectedTorrents.includes(hash)).get();

  const {status, upRate, downRate} = TorrentStore.torrents?.[hash] || {};
  const torrentClasses = torrentStatusClasses(
    {status, upRate, downRate},
    {trackerWarningEnabled: SettingStore.floodSettings.UITrackerWarningEnabled},
    classnames({
      'torrent--is-selected': isSelected,
      'torrent--is-condensed': isCondensed,
      'torrent--is-expanded': !isCondensed,
    }),
    'torrent',
  );

  const {onTouchStart, onTouchEnd} = useLongPress(
    (e) => {
      if (e != null && touchStart.current?.hash === hash) {
        touchStart.current.longPressed = true;
        lastTap.current = null;
        displayContextMenu(hash, e as unknown as TouchEvent);
      }
    },
    {delay: 500, isPreventDefault: false},
  );

  const cancelTouch = () => {
    onTouchEnd();
    touchStart.current = null;
    lastTap.current = null;
  };

  useEffect(() => {
    touchStart.current = null;
    lastTap.current = null;
    return onTouchEnd;
  }, [hash, onTouchEnd]);

  const onTouchStartHooked = (e: TouchEvent) => {
    if (e.touches.length !== 1) {
      cancelTouch();
      return;
    }

    const {clientX: x, clientY: y} = e.touches[0];
    touchStart.current = {x, y, hash, longPressed: false};
    onTouchStart(e);
  };

  const onTouchMove = (e: TouchEvent) => {
    const start = touchStart.current;
    const touch = e.touches[0];
    if (start && (e.touches.length !== 1 || Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 10)) {
      cancelTouch();
    }
  };

  const onTouchEndHooked = (e: TouchEvent) => {
    onTouchEnd();
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || start.hash !== hash) {
      return;
    }
    // Handle taps ourselves instead of relying on Safari's synthesized mouse events.
    if (e.cancelable) {
      e.preventDefault();
    }
    if (start.longPressed) {
      return;
    }
    selectTorrent(hash, e);
    const previous = lastTap.current;
    const time = e.timeStamp;
    if (
      previous?.hash === hash &&
      time - previous.time <= 400 &&
      Math.hypot(start.x - previous.x, start.y - previous.y) <= 25
    ) {
      lastTap.current = null;
      displayTorrentDetails(hash);
    } else {
      lastTap.current = {x: start.x, y: start.y, time, hash};
    }
  };

  const torrent = TorrentStore.torrents?.[hash];
  const torrentTestId = `torrent-${hash}`;
  const torrentStatus = status?.join('-') || 'unknown';

  if (isCondensed) {
    return (
      <TorrentListRowCondensed
        className={torrentClasses}
        ref={rowRef}
        style={style}
        hash={hash}
        handleClick={selectTorrent}
        handleDoubleClick={displayTorrentDetails}
        handleRightClick={displayContextMenu}
        handleTouchStart={onTouchStartHooked}
        handleTouchEnd={onTouchEndHooked}
        handleTouchMove={onTouchMove}
        handleTouchCancel={cancelTouch}
        handleKeyDown={(e) => onKeyDown(hash, e)}
        data-testid={torrentTestId}
        data-torrent-status={torrentStatus}
        data-torrent-name={torrent?.name}
        data-is-selected={isSelected}
        data-view-size="condensed"
      />
    );
  }

  return (
    <TorrentListRowExpanded
      className={torrentClasses}
      ref={rowRef}
      style={style}
      hash={hash}
      handleClick={selectTorrent}
      handleDoubleClick={displayTorrentDetails}
      handleRightClick={displayContextMenu}
      handleTouchStart={onTouchStartHooked}
      handleTouchEnd={onTouchEndHooked}
      handleTouchMove={onTouchMove}
      handleTouchCancel={cancelTouch}
      handleKeyDown={(e) => onKeyDown(hash, e)}
      data-testid={torrentTestId}
      data-torrent-status={torrentStatus}
      data-torrent-name={torrent?.name}
      data-is-selected={isSelected}
      data-view-size="expanded"
    />
  );
});

export default TorrentListRow;
