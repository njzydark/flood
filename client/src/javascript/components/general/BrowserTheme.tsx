import {FC, useLayoutEffect} from 'react';

const BrowserTheme: FC<{isDark: boolean}> = ({isDark}) => {
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', getComputedStyle(document.documentElement).backgroundColor);
  }, [isDark]);

  // WebKit keeps the first edge color of a full-viewport fixed box. A new,
  // transparent edge container makes it sample the current pixels on theme changes.
  return <div key={String(isDark)} className="application__theme-color" aria-hidden="true" />;
};

export default BrowserTheme;
