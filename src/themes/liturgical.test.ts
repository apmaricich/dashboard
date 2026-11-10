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

  test("defaults to green when no day object is found", () => {
    const theme = liturgicalTheme({ date: new Date(2024, 6, 15) });
    expect(theme.colors.primary).toBe("green");
    expect(theme.colors.border).toBe("green");
    expect(theme.colors.accent).toBe("green");
  });

  test("has correct background and text colors", () => {
    const theme = liturgicalTheme({ date: new Date(2024, 6, 15) });
    expect(theme.colors.text).toBe("#ffffff");
    expect(theme.colors.background).toBe("#111111");
  });

  test("has single border style", () => {
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