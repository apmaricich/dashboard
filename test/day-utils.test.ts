import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { expandDaySet, shouldShowWidget } from "../src/lib/day-utils.js";
import type { WidgetConfig } from "../src/config/loader.js";

describe("expandDaySet", () => {
  it("expands weekdays placeholder to 1-5", () => {
    expect(expandDaySet(["weekdays"])).toEqual([1, 2, 3, 4, 5]);
  });

  it("expands weekends placeholder to 6-7", () => {
    expect(expandDaySet(["weekends"])).toEqual([6, 7]);
  });

  it("expands all placeholder to 1-7", () => {
    expect(expandDaySet(["all"])).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("passes through explicit numbers unchanged", () => {
    expect(expandDaySet([1, 3, 5])).toEqual([1, 3, 5]);
  });

  it("handles mixed placeholders and numbers, dedupes and sorts", () => {
    // weekdays (1-5) + 7 (Sunday)
    expect(expandDaySet(["weekdays", 7])).toEqual([1, 2, 3, 4, 5, 7]);
  });

  it("removes duplicate days when overlapping placeholders", () => {
    // weekdays (1-5) + weekends (6-7) = all days, no duplicates
    expect(expandDaySet(["weekends", "weekdays"])).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe("shouldShowWidget", () => {
  // Reset system time after each test to avoid affecting other tests
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows widget when no days config specified (always visible)", () => {
    const widget: WidgetConfig = {
      name: "Test Widget",
      type: "test",
      order: 1,
      refresh: 60,
    };
    expect(shouldShowWidget(widget)).toBe(true);
  });

  it("hides widget with daysShown=[1] on Sunday (ISO day 7)", () => {
    // Sunday = getDay() 0 → ISO 7
    vi.setSystemTime(new Date(2026, 10, 15)); // Sunday, Nov 15, 2026
    const widget: WidgetConfig = {
      name: "Monday Only",
      type: "test",
      order: 1,
      refresh: 60,
      daysShown: [1],
    };
    expect(shouldShowWidget(widget)).toBe(false);
  });

  it("hides widget with daysShown=['weekdays'] on Sunday", () => {
    vi.setSystemTime(new Date(2026, 10, 15)); // Sunday
    const widget: WidgetConfig = {
      name: "Weekdays Only",
      type: "test",
      order: 1,
      refresh: 60,
      daysShown: ["weekdays"],
    };
    expect(shouldShowWidget(widget)).toBe(false);
  });

  it("hides widget with daysHidden=['weekends'] on Sunday", () => {
    vi.setSystemTime(new Date(2026, 10, 15)); // Sunday
    const widget: WidgetConfig = {
      name: "No Weekends",
      type: "test",
      order: 1,
      refresh: 60,
      daysHidden: ["weekends"],
    };
    expect(shouldShowWidget(widget)).toBe(false);
  });

  it("hides widget with daysHidden=[7] on Sunday", () => {
    vi.setSystemTime(new Date(2026, 10, 15)); // Sunday
    const widget: WidgetConfig = {
      name: "No Sundays",
      type: "test",
      order: 1,
      refresh: 60,
      daysHidden: [7],
    };
    expect(shouldShowWidget(widget)).toBe(false);
  });

  it("daysShown takes precedence over daysHidden when both are set", () => {
    // daysShown=[7] (Sunday only), daysHidden=[7] (hidden on Sunday)
    // daysShown wins, so widget should be shown on Sunday
    vi.setSystemTime(new Date(2026, 10, 15)); // Sunday
    const widget: WidgetConfig = {
      name: "Precedence Test",
      type: "test",
      order: 1,
      refresh: 60,
      daysShown: [7],
      daysHidden: [7],
    };
    expect(shouldShowWidget(widget)).toBe(true);
  });

  it("shows widget with daysHidden=[7] on Monday", () => {
    vi.setSystemTime(new Date(2026, 10, 12)); // Monday, Nov 12, 2026
    const widget: WidgetConfig = {
      name: "No Sundays",
      type: "test",
      order: 1,
      refresh: 60,
      daysHidden: [7],
    };
    expect(shouldShowWidget(widget)).toBe(true);
  });

  it("hides widget when daysShown is an empty array", () => {
    // Empty daysShown means never show
    const widget: WidgetConfig = {
      name: "Never Shown",
      type: "test",
      order: 1,
      refresh: 60,
      daysShown: [],
    };
    expect(shouldShowWidget(widget)).toBe(false);
  });
});