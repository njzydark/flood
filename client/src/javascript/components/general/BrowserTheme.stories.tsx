import {useState} from 'react';
import {expect, userEvent, within} from 'storybook/test';

import BrowserTheme from './BrowserTheme';

import type {Meta, StoryObj} from '@storybook/react-vite';

const meta = {
  title: 'General/BrowserTheme',
  component: BrowserTheme,
  args: {isDark: false},
  tags: ['theme-regression'],
  beforeEach: () => {
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    document.head.append(themeColor);
    return () => {
      themeColor.remove();
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    };
  },
} satisfies Meta<typeof BrowserTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SwitchingThemes: Story = {
  render: () => {
    const Example = () => {
      const [isDark, setIsDark] = useState(false);
      const [isLoading, setIsLoading] = useState(true);
      return (
        <>
          {isLoading && (
            <div
              data-testid="loading-background"
              style={{backgroundColor: '#1d2938', position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none'}}
            />
          )}
          <BrowserTheme isDark={isDark} />
          <div style={{position: 'relative', zIndex: 1002, marginTop: 30}}>
            <button type="button" onClick={() => setIsDark((value) => !value)}>
              Switch theme
            </button>
            <button type="button" onClick={() => setIsLoading(false)}>
              Finish loading
            </button>
          </div>
        </>
      );
    };
    return <Example />;
  },
  play: async ({canvasElement}) => {
    const button = within(canvasElement).getByRole('button', {name: 'Switch theme'});
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const edge = canvasElement.querySelector('.application__theme-color') as HTMLElement;

    for (const isDark of [true, false, true]) {
      await userEvent.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(isDark);
      expect(document.body.classList.contains('dark')).toBe(isDark);
      expect(themeColor).toHaveAttribute('content', isDark ? 'rgb(45, 45, 45)' : 'rgb(233, 238, 242)');
      expect(getComputedStyle(edge).pointerEvents).toBe('none');
      // Use the toolbar palette even before the navy loading page disappears.
      expect(getComputedStyle(edge).backgroundColor).toBe(isDark ? 'rgb(45, 45, 45)' : 'rgb(233, 238, 242)');
      const bounds = edge.getBoundingClientRect();
      expect(bounds.width).toBe(window.innerWidth);
      expect(bounds.height).toBeGreaterThan(10);
      expect(bounds.top).toBe(-6);
      expect(bounds.bottom).toBe(6);
      if (within(canvasElement).queryByTestId('loading-background')) {
        await userEvent.click(within(canvasElement).getByRole('button', {name: 'Finish loading'}));
        expect(within(canvasElement).queryByTestId('loading-background')).not.toBeInTheDocument();
        expect(getComputedStyle(edge).backgroundColor).toBe('rgb(45, 45, 45)');
      }
    }
  },
};
