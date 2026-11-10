import { describe, test, expect } from "vitest";
import {
  gridLayoutStrategy,
  focusLayoutStrategy,
  registerLayoutStrategy,
  getLayoutStrategy,
  type LayoutResult,
} from "./layout.js";
import type { WidgetConfig } from "../config/loader.js";

function makeWidgets(count: number): WidgetConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `Widget ${i}`,
    type: `type${i}`,
    order: i,
    refresh: 60,
  }));
}

describe("gridLayoutStrategy", () => {
  test("returns empty array for zero widgets", () => {
    const strategy = gridLayoutStrategy();
    const result = strategy.compute([], 100, 100);
    expect(result).toEqual([]);
  });

  test("single widget fills entire container", () => {
    const strategy = gridLayoutStrategy();
    const widgets = makeWidgets(1);
    const result = strategy.compute(widgets, 80, 40);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 0, y: 0, width: 80, height: 40 });
  });

  test("two widgets split evenly in one row", () => {
    const strategy = gridLayoutStrategy({ maxCols: 2 });
    const widgets = makeWidgets(2);
    const result = strategy.compute(widgets, 100, 50);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ x: 0, y: 0, width: 50, height: 50 });
    expect(result[1]).toEqual({ x: 50, y: 0, width: 50, height: 50 });
  });

  test("widgets wrap to next row when exceeding maxCols", () => {
    const strategy = gridLayoutStrategy({ maxCols: 2 });
    const widgets = makeWidgets(4);
    const result = strategy.compute(widgets, 100, 100);

    expect(result).toHaveLength(4);
    // Row 0
    expect(result[0].y).toBe(0);
    expect(result[1].y).toBe(0);
    // Row 1
    expect(result[2].y).toBe(50);
    expect(result[3].y).toBe(50);
  });

  test("default maxCols is 4", () => {
    const strategy = gridLayoutStrategy();
    const widgets = makeWidgets(5);
    const result = strategy.compute(widgets, 100, 100);

    // 5 widgets / 4 cols = 2 rows, row 0 has 4, row 1 has 1
    expect(result[0].y).toBe(0);
    expect(result[3].y).toBe(0);
    expect(result[4].y).toBe(50);
  });

  test("remainder width added to last widget in row", () => {
    const strategy = gridLayoutStrategy({ maxCols: 3 });
    const widgets = makeWidgets(2);
    const result = strategy.compute(widgets, 100, 50);

    expect(result).toHaveLength(2);
    // First widget gets floor(100/2)=50
    expect(result[0].width).toBe(50);
    // Second widget gets 50 + remainder(0)
    expect(result[1].width).toBe(50);
  });

  test("odd row fills completely", () => {
    const strategy = gridLayoutStrategy({ maxCols: 2 });
    const widgets = makeWidgets(3);
    const result = strategy.compute(widgets, 100, 100);

    expect(result).toHaveLength(3);
    // Row 0: 2 widgets, row 1: 1 widget
    expect(result[0].y).toBe(0);
    expect(result[1].y).toBe(0);
    expect(result[2].y).toBe(50);
  });

  test("layout respects widget order sorting", () => {
    const strategy = gridLayoutStrategy({ maxCols: 2 });
    const widgets = makeWidgets(4);
    // Shuffle order values
    widgets[0].order = 3;
    widgets[1].order = 0;
    widgets[2].order = 2;
    widgets[3].order = 1;

    const result = strategy.compute(widgets, 100, 100);

    // Layout results are indexed by original widget index
    // Widget at original index 1 (order 0) is first in sorted order,
    // so it gets placed at position 0 in the grid (top-left)
    expect(result[1].y).toBe(0);
    expect(result[1].x).toBe(0);
  });

  test("large container dimensions", () => {
    const strategy = gridLayoutStrategy({ maxCols: 4 });
    const widgets = makeWidgets(8);
    const result = strategy.compute(widgets, 400, 200);

    expect(result).toHaveLength(8);
    // 8 / 4 = 2 rows, each row has 4 widgets
    expect(result[0].width).toBe(100);
    expect(result[0].height).toBe(100);
  });
});

describe("focusLayoutStrategy", () => {
  test("returns empty array for zero widgets", () => {
    const strategy = focusLayoutStrategy();
    const result = strategy.compute([], 100, 100);
    expect(result).toEqual([]);
  });

  test("center widget takes 50% of screen", () => {
    const strategy = focusLayoutStrategy();
    const widgets = makeWidgets(1);
    const result = strategy.compute(widgets, 800, 480);

    expect(result).toHaveLength(1);
    // Center: [slotWidth, slotHeight, 2*slotWidth, 2*slotHeight]
    // slotWidth = 200, slotHeight = 120
    expect(result[0]).toEqual({ x: 200, y: 120, width: 400, height: 240 });
  });

  test("single center widget positioned correctly", () => {
    const strategy = focusLayoutStrategy();
    const widgets = makeWidgets(1);
    const result = strategy.compute(widgets, 100, 100);

    expect(result[0].x).toBe(25);
    expect(result[0].y).toBe(25);
    expect(result[0].width).toBe(50);
    expect(result[0].height).toBe(50);
  });

  test("up to 5 widgets use edge slot layout", () => {
    const strategy = focusLayoutStrategy();
    const widgets = makeWidgets(5);
    const result = strategy.compute(widgets, 100, 100);

    expect(result).toHaveLength(5);
    // First is center
    expect(result[0].x).toBe(25);
    expect(result[0].y).toBe(25);
  });

  test("more than 5 widgets use split-edge layout", () => {
    const strategy = focusLayoutStrategy();
    const widgets = makeWidgets(6);
    const result = strategy.compute(widgets, 100, 100);

    expect(result).toHaveLength(6);
  });

  test("layout respects widget order", () => {
    const strategy = focusLayoutStrategy();
    const widgets = makeWidgets(3);
    widgets[0].order = 2;
    widgets[1].order = 0;
    widgets[2].order = 1;

    const result = strategy.compute(widgets, 100, 100);

    // Widget with order 0 (index 1) should be at center (slot 0)
    expect(result[1].x).toBe(25);
    expect(result[1].y).toBe(25);
  });
});

describe("layout strategy registry", () => {
  test("grid and focus strategies are registered", () => {
    expect(() => getLayoutStrategy("grid")).not.toThrow();
    expect(() => getLayoutStrategy("focus")).not.toThrow();
  });

  test("throws for unregistered strategy", () => {
    expect(() => getLayoutStrategy("unknown")).toThrow(
      'Layout strategy "unknown" is not registered'
    );
  });

  test("custom strategy can be registered and retrieved", () => {
    const customStrategy = {
      compute: () => [],
    };

    registerLayoutStrategy("custom-test", customStrategy);
    const retrieved = getLayoutStrategy("custom-test");
    expect(retrieved).toBe(customStrategy);
  });

  test("registered strategy compute method works", () => {
    const strategy = getLayoutStrategy("grid");
    const widgets = makeWidgets(2);
    const result = strategy.compute(widgets, 100, 100);
    expect(result).toHaveLength(2);
  });
});