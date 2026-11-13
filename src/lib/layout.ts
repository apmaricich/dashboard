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
  /** Maximum number of rows in grid layout */
  maxRows?: number;
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
      const maxRows = layoutOptions?.maxRows ?? 2;

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

      // Compute number of rows based on widget count and maxCols
      const computedRows = Math.ceil(results.length / maxCols);
      // Use the minimum of computedRows and maxRows
      const numRows = Math.min(computedRows, maxRows);
      const cellHeight = Math.floor(containerHeight / numRows);

      // Group widgets into rows
      const rows: Array<Array<{ widget: WidgetConfig; index: number }>> = [];
      for (let row = 0; row < numRows; row++) {
        rows.push(results.slice(row * maxCols, (row + 1) * maxCols));
      }

      // Calculate layout with dynamic width per row
      const layoutResults: LayoutResult[] = [];
      for (let row = 0; row < rows.length; row++) {
        const rowWidgets = rows[row];
        const cellWidth = Math.floor(containerWidth / rowWidgets.length);
        const remainder = containerWidth - (cellWidth * rowWidgets.length);

        for (let col = 0; col < rowWidgets.length; col++) {
          const { index } = rowWidgets[col];
          // Add remainder to last widget in row to fill full width
          const width = col === rowWidgets.length - 1 ? cellWidth + remainder : cellWidth;
          layoutResults[index] = {
            x: col * cellWidth + (col === rowWidgets.length - 1 ? 0 : 0),
            y: row * cellHeight,
            width: width,
            height: cellHeight
          };
        }
      }

      return layoutResults;
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

/**
 * Create a focus layout that places one central widget with edge slots.
 * Center takes 50% of screen. Remaining widgets fill edge slots in order:
 * left, top, right, bottom, then split edges.
 */
export function focusLayoutStrategy(): LayoutStrategy {
  return {
    compute(
      widgets: WidgetConfig[],
      containerWidth: number,
      containerHeight: number,
      layoutOptions?: LayoutOptions
    ): LayoutResult[] {
      const results = widgets.map((widget, index) => ({
        widget,
        index
      }));

      results.sort((a, b) => a.widget.order - b.widget.order);

      if (results.length === 0) {
        return [];
      }

      const w = containerWidth;
      const h = containerHeight;

      // Define slots: [x, y, width, height] as fractions of container
      // Slot 0 = center, then edge slots in fill order
      const slotWidth = w / 4;
      const slotHeight = h / 4;

      // Build slot list dynamically based on widget count
      const slots = [
        // Center (50% x 50%)
        [slotWidth, slotHeight, slotWidth * 2, slotHeight * 2],
      ];

      if (results.length <= 5) {
        // Phase 1: 4 edge slots
        slots.push(
          [0, 0, slotWidth, h - 1],                      // left
          [slotWidth, 0, slotWidth * 2, slotHeight],      // top
          [slotWidth * 3, 0, slotWidth, h - 1],           // right
          [slotWidth, slotHeight * 3, slotWidth * 2, slotHeight]  // bottom
        );
      } else {
        // Phase 2: Split edges in half
        slots.push(
          [0, 0, slotWidth, slotHeight],                  // left-top
          [slotWidth, 0, slotWidth, slotHeight],          // top-left
          [slotWidth * 2, 0, slotWidth, slotHeight],      // top-right
          [slotWidth * 3, 0, slotWidth, slotHeight],      // right-top
          [0, slotHeight, slotWidth, slotHeight],         // left-bottom
          [slotWidth * 3, slotHeight, slotWidth, slotHeight],  // right-bottom
          [slotWidth, slotHeight * 3, slotWidth, slotHeight],   // bottom-left
          [slotWidth * 2, slotHeight * 3, slotWidth, slotHeight]  // bottom-right
        );
      }

      const layoutResults: LayoutResult[] = [];
      for (let i = 0; i < results.length; i++) {
        const { index } = results[i];
        const slot = slots[i];
        layoutResults[index] = {
          x: Math.floor(slot[0]),
          y: Math.floor(slot[1]),
          width: Math.floor(slot[2]),
          height: Math.floor(slot[3])
        };
      }

      return layoutResults;
    }
  };
}

// Register layout strategies
/**
 * Create a banner layout strategy where the first widget spans the full width
 * at the top, and remaining widgets fill a grid below it.
 */
export function bannerLayoutStrategy(): LayoutStrategy {
  return {
    compute(
      widgets: WidgetConfig[],
      containerWidth: number,
      containerHeight: number,
      layoutOptions?: LayoutOptions
    ): LayoutResult[] {
      const maxCols = layoutOptions?.maxCols ?? 3;

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

      // Banner widget takes top row with full width
      const bannerHeight = Math.floor(containerHeight * 0.25);
      const gridHeight = containerHeight - bannerHeight;
      const layoutResults: LayoutResult[] = [];

      // Layout banner widget
      layoutResults[results[0].index] = {
        x: 0,
        y: 0,
        width: containerWidth,
        height: bannerHeight
      };

      // Layout remaining widgets in grid below
      const remainingWidgets = results.slice(1);
      const numRows = Math.ceil(remainingWidgets.length / maxCols);
      const cellHeight = Math.floor(gridHeight / numRows);

      for (let row = 0; row < numRows; row++) {
        const rowWidgets = remainingWidgets.slice(row * maxCols, (row + 1) * maxCols);
        if (rowWidgets.length === 0) continue;

        const cellWidth = Math.floor(containerWidth / rowWidgets.length);
        const remainder = containerWidth - (cellWidth * rowWidgets.length);

        for (let col = 0; col < rowWidgets.length; col++) {
          const { index } = rowWidgets[col];
          const width = col === rowWidgets.length - 1 ? cellWidth + remainder : cellWidth;
          layoutResults[index] = {
            x: col * cellWidth,
            y: bannerHeight + row * cellHeight,
            width,
            height: cellHeight
          };
        }
      }

      return layoutResults;
    }
  };
}

// Register layout strategies
registerLayoutStrategy('grid', gridLayoutStrategy());
registerLayoutStrategy('focus', focusLayoutStrategy());
registerLayoutStrategy('banner', bannerLayoutStrategy());
