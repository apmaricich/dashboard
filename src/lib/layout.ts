import type { WidgetConfig } from '../config/loader.js';

/**
 * Position and dimensions of a widget after layout computation.
 */
export interface LayoutResult {
  /** X offset from the left edge of the container */
  x: number;
  /** Y offset from the top edge of the container */
  y: number;
  /** Rendered width of the widget */
  width: number;
  /** Rendered height of the widget */
  height: number;
}

/**
 * Pluggable layout algorithm for arranging widgets within a dashboard area.
 */
export interface LayoutStrategy {
  /**
   * Compute layout positions for all widgets.
   * @param widgets - Widget configurations to lay out
   * @param containerWidth - Available width in pixels
   * @param containerHeight - Available height in pixels
   * @returns Layout results in the same order as the input widgets
   */
  compute(
    widgets: WidgetConfig[],
    containerWidth: number,
    containerHeight: number,
    options?: LayoutOptions
  ): LayoutResult[];
}

export interface LayoutOptions {
  /** Maximum number of columns in grid layout */
  maxCols?: number;
}

/**
 * Create a grid layout strategy that arranges widgets in a grid.
 * @param options - Optional configuration for the grid layout
 */
export function gridLayoutStrategy(options?: LayoutOptions): LayoutStrategy {
  return {
    compute(
      widgets: WidgetConfig[],
      containerWidth: number,
      containerHeight: number,
      layoutOptions?: LayoutOptions
    ): LayoutResult[] {
      const maxCols = layoutOptions?.maxCols ?? options?.maxCols ?? 4;

      const results = widgets.map((widget, index) => ({
        widget,
        index
      }));

      results.sort((a, b) => a.widget.order - b.widget.order);

      if (results.length === 0) {
        return [];
      }

      if (results.length === 1) {
        return [{
          x: 0,
          y: 0,
          width: containerWidth,
          height: containerHeight
        }];
      }

      const numRows = Math.ceil(results.length / maxCols);
      const cellHeight = containerHeight / numRows;
      const cellWidth = containerWidth / maxCols;

      return results.map(({ widget, index }) => {
        const row = Math.floor(index / maxCols);
        const col = index % maxCols;

        return {
          x: col * cellWidth,
          y: row * cellHeight,
          width: cellWidth,
          height: cellHeight
        };
      });
    }
  };
}

/**
 * Registry of layout strategies by name.
 */
const layoutStrategies = new Map<string, LayoutStrategy>();

/**
 * Register a layout strategy by name.
 * @param name - Unique identifier for the layout strategy
 * @param strategy - The layout strategy implementation
 */
export function registerLayoutStrategy(name: string, strategy: LayoutStrategy): void {
  layoutStrategies.set(name, strategy);
}

/**
 * Retrieve a registered layout strategy by name.
 * @param name - The name of the layout strategy
 * @returns The layout strategy implementation
 * @throws Error if the strategy is not registered
 */
export function getLayoutStrategy(name: string): LayoutStrategy {
  const strategy = layoutStrategies.get(name);
  if (!strategy) {
    throw new Error(`Layout strategy "${name}" is not registered. Available strategies: ${[...layoutStrategies.keys()].join(', ')}`);
  }
  return strategy;
}

// Register the grid layout strategy at module load time
registerLayoutStrategy('grid', gridLayoutStrategy());
