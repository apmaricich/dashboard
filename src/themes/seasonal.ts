import { ThemeFunction, ThemeContext, Theme } from './index.js';

/**
 * Seasonal theme that changes colors based on the current season.
 *
 * Uses Northern Hemisphere seasons by default:
 * - Winter: Dec, Jan, Feb — cold blue tones
 * - Spring: Mar, Apr, May — fresh green tones
 * - Summer: Jun, Jul, Aug — warm yellow tones
 * - Autumn: Sep, Oct, Nov — golden tones
 */

function getSeason(month: number): 'winter' | 'spring' | 'summer' | 'autumn' {
  if (month >= 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'autumn';
}

const SEASONAL_THEMES: Record<string, Theme> = {
  winter: {
    id: 'seasonal-winter',
    colors: {
      primary: '#ffffff',
      border: '#50e5ff',
      text: '#aaaaaa',
      background: '#000000',
      accent: '#50e5ff',
    },
    borderStyle: 'dashed',
  },
  spring: {
    id: 'seasonal-spring',
    colors: {
      primary: '#50ff50',
      border: '#50ff50',
      text: '#aaaaaa',
      background: '#000000',
      accent: '#ffff50',
    },
    borderStyle: 'single',
  },
  summer: {
    id: 'seasonal-summer',
    colors: {
      primary: '#ffff50',
      border: '#ffff50',
      text: '#aaaaaa',
      background: '#000000',
      accent: '#ff4444',
    },
    borderStyle: 'single',
  },
  autumn: {
    id: 'seasonal-autumn',
    colors: {
      primary: '#ffff50',
      border: '#ffa500',
      text: '#aaaaaa',
      background: '#000000',
      accent: '#ff4444',
    },
    borderStyle: 'single',
  },
};

const seasonalTheme: ThemeFunction = (context: ThemeContext): Theme => {
  const season = getSeason(context.date.getMonth());
  return SEASONAL_THEMES[season];
};

export default seasonalTheme;