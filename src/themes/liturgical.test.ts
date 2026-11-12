import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock romcal before importing the module under test
vi.mock("romcal", () => ({
  calendarFor: () => {
    return {
      find: () => null,
    };
  },
}));

import liturgicalTheme from "./liturgical.js";

describe("liturgical theme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns liturgical theme id", () => {
    const theme = liturgicalTheme({ date: new Date(2024, 6, 15) });
    expect(theme.id).toBe("liturgical");
  });

  test("defaults to green sub-theme when no day object is found", () => {
    const theme = liturgicalTheme({ date: new Date(2024, 6, 15) });
    expect(theme.colors.primary).toBe("#80c080");
    expect(theme.colors.border).toBe("#80c080");
    expect(theme.colors.background).toBe("#0a150a");
    expect(theme.colors.accent).toBe("#90d090");
  });

  test("green sub-theme has single border style", () => {
    const theme = liturgicalTheme({ date: new Date(2024, 6, 15) });
    expect(theme.borderStyle).toBe("single");
  });

  test("theme is consistent across different dates", () => {
    const theme1 = liturgicalTheme({ date: new Date(2024, 0, 15) });
    const theme2 = liturgicalTheme({ date: new Date(2024, 6, 15) });
    expect(theme1.id).toBe(theme2.id);
    expect(theme1.borderStyle).toBe(theme2.borderStyle);
  });
});