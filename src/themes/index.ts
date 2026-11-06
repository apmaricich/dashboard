/**
 * Theme system interfaces and types.
 *
 * Provides the core theme model, theme context, and theme function types
 * used throughout the application for styling and dynamic theming.
 */

/**
 * Theme color palette definition.
 */
export interface ThemeColors {
  /** Primary brand color */
  primary: string;
  /** Border color for UI elements */
  border: string;
  /** Default text color */
  text: string;
  /** Background color */
  background: string;
  /** Accent color for highlights and interactive elements */
  accent: string;
}

/**
 * Complete theme definition including colors and styling properties.
 */
export interface Theme {
  /** Unique theme identifier */
  id: string;
  /** Color palette for the theme */
  colors: ThemeColors;
  /** CSS border style (e.g., 'solid', 'dashed', 'none') */
  borderStyle: string;
}

/**
 * Context provided to theme functions for dynamic theming.
 */
export interface ThemeContext {
  /** Current date for time-based theme selection */
  date: Date;
}

/**
 * A theme function that generates a theme from a context.
 *
 * @param context - Theme context containing dynamic information
 * @returns A complete Theme definition
 */
export type ThemeFunction = (context: ThemeContext) => Theme;

/**
 * Theme registry that maps theme names to their functions.
 */
const registry = new Map<string, ThemeFunction>();

/**
 * Register a theme function under the given name.
 *
 * @param name - Unique identifier for the theme
 * @param fn - Theme function to register
 */
export function registerTheme(name: string, fn: ThemeFunction): void {
    registry.set(name, fn);
}

/**
 * Retrieve and execute a theme function by name.
 *
 * @param name - Name of the registered theme
 * @param context - Theme context for dynamic theming
 * @returns The generated Theme object
 * @throws Error if the theme name is not registered
 */
export function getTheme(name: string, context: ThemeContext): Theme {
    const fn = registry.get(name);
    if (!fn) {
        throw new Error(`Theme '${name}' is not registered`);
    }
    return fn(context);
}

import { default as liturgicalTheme } from './liturgical.js';
registerTheme('liturgical', liturgicalTheme);

import { default as seasonalTheme } from './seasonal.js';
registerTheme('seasonal', seasonalTheme);
