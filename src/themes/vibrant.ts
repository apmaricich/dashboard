import { ThemeFunction } from './index.js';

/**
 * Vibrant test theme with high-contrast, bright colors for testing.
 */
const vibrantTheme: ThemeFunction = () => ({
  id: 'vibrant',
  colors: {
    primary: 'brightYellow',
    border: 'brightMagenta',
    text: 'brightCyan',
    background: 'blue',
    accent: 'brightGreen',
  },
  borderStyle: 'double',
});

export default vibrantTheme;