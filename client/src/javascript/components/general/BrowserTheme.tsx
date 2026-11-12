import {FC, useLayoutEffect} from 'react';

const BrowserTheme: FC<{isDark: boolean}> = ({isDark}) => {
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', getComputedStyle(document.documentElement).backgroundColor);
  }, [isDark]);

  return <div className="application__theme-color" aria-hidden="true" />;
};

export default BrowserTheme;
