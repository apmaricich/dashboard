import { ThemeFunction } from './index.js';

/**
 * Vibrant test theme with high-contrast, bright colors for testing.
 */
const vibrantTheme: ThemeFunction = () => ({
  id: 'vibrant',
  colors: {
    primary: 'yellowBright',
    border: 'magentaBright',
    text: 'cyanBright',
    background: 'blue',
    accent: 'greenBright',
  },
  borderStyle: 'double',
});

export default vibrantTheme;