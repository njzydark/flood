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
      return (
        <>
          <BrowserTheme isDark={isDark} />
          <button type="button" onClick={() => setIsDark((value) => !value)}>
            Switch theme
          </button>
        </>
      );
    };
    return <Example />;
  },
  play: async ({canvasElement}) => {
    const button = within(canvasElement).getByRole('button', {name: 'Switch theme'});
    const themeColor = document.querySelector('meta[name="theme-color"]');
    let previousEdge = canvasElement.querySelector('.application__theme-color');

    for (const isDark of [true, false, true]) {
      await userEvent.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(isDark);
      expect(document.body.classList.contains('dark')).toBe(isDark);
      expect(themeColor).toHaveAttribute('content', isDark ? 'rgb(45, 45, 45)' : 'rgb(233, 238, 242)');
      const edge = canvasElement.querySelector('.application__theme-color') as HTMLElement;
      // Reusing this node lets WebKit retain its previously sampled color.
      expect(previousEdge?.isConnected).toBe(false);
      expect(edge).not.toBe(previousEdge);
      expect(getComputedStyle(edge).pointerEvents).toBe('none');
      expect(getComputedStyle(edge).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      previousEdge = edge;
    }
  },
};
