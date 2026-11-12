import classnames from 'classnames';
import SettingStore from '@client/stores/SettingStore';
import {FC, ReactNode} from 'react';
import {observer} from 'mobx-react-lite';

interface SidebarActionsProps {
  children: ReactNode;
}

const SidebarActions: FC<SidebarActionsProps> = observer(({children}: SidebarActionsProps) => {
  const {torrentListViewSize} = SettingStore.floodSettings;

  const classes = classnames('sidebar__actions', {
    'sidebar__actions--is-condensed': torrentListViewSize === 'condensed',
  });

  return <div className={classes}>{children}</div>;
});

export default SidebarActions;
