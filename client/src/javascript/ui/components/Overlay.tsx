import classnames from 'classnames';
import {FC, MouseEvent, ReactNode, TouchEvent} from 'react';

export interface OverlayProps {
  children?: ReactNode;
  additionalClassNames?: string;
  isInteractive?: boolean;
  isTransparent?: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onTouchStart?: (event: TouchEvent) => void;
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void;
}

const Overlay: FC<OverlayProps> = ({
  children,
  additionalClassNames,
  onClick,
  onTouchStart,
  onContextMenu,
  isInteractive = true,
  isTransparent = false,
}: OverlayProps) => {
  const classes = classnames('overlay', additionalClassNames, {
    'overlay--no-interaction': !isInteractive,
    'overlay--transparent': isTransparent,
  });

  return (
    <div
      className={classes}
      onClickCapture={onClick}
      onTouchStartCapture={onTouchStart}
      onContextMenuCapture={onContextMenu}
    >
      {children}
    </div>
  );
};

export default Overlay;
