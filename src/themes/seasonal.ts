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
  if (month >= 12 || month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'autumn';
}

const seasonalTheme: ThemeFunction = (context: ThemeContext): Theme => {
  const season = getSeason(context.date.getMonth());

  switch (season) {
    case 'winter':
      return {
        id: 'seasonal-winter',
        colors: {
          primary: 'white',
          border: 'brightBlue',
          text: 'gray',
          background: 'black',
          accent: 'cyan',
        },
        borderStyle: 'single',
      };
    case 'spring':
      return {
        id: 'seasonal-spring',
        colors: {
          primary: 'brightGreen',
          border: 'green',
          text: 'gray',
          background: 'black',
          accent: 'yellow',
        },
        borderStyle: 'single',
      };
    case 'summer':
      return {
        id: 'seasonal-summer',
        colors: {
          primary: 'yellow',
          border: 'brightYellow',
          text: 'gray',
          background: 'black',
          accent: 'brightRed',
        },
        borderStyle: 'single',
      };
    case 'autumn':
      return {
        id: 'seasonal-autumn',
        colors: {
          primary: 'brightYellow',
          border: 'yellow',
          text: 'gray',
          background: 'black',
          accent: 'red',
        },
        borderStyle: 'single',
      };
  }
};

export default seasonalTheme;