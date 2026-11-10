import { describe, test, expect } from "vitest";
import seasonalTheme from "./seasonal.js";

describe("seasonal theme", () => {
  test("returns winter theme for January", () => {
    const theme = seasonalTheme({ date: new Date(2024, 0, 15) });
    expect(theme.id).toBe("seasonal-winter");
    expect(theme.colors.primary).toBe("white");
    expect(theme.colors.border).toBe("brightBlue");
  });

  test("returns winter theme for February", () => {
    const theme = seasonalTheme({ date: new Date(2024, 1, 15) });
    expect(theme.id).toBe("seasonal-winter");
  });

  test("returns winter theme for December", () => {
    const theme = seasonalTheme({ date: new Date(2024, 11, 15) });
    expect(theme.id).toBe("seasonal-winter");
  });

  test("returns spring theme for March", () => {
    const theme = seasonalTheme({ date: new Date(2024, 2, 15) });
    expect(theme.id).toBe("seasonal-spring");
    expect(theme.colors.primary).toBe("brightGreen");
    expect(theme.colors.border).toBe("green");
  });

  test("returns spring theme for April", () => {
    const theme = seasonalTheme({ date: new Date(2024, 3, 15) });
    expect(theme.id).toBe("seasonal-spring");
  });

  test("returns spring theme for May", () => {
    const theme = seasonalTheme({ date: new Date(2024, 4, 15) });
    expect(theme.id).toBe("seasonal-spring");
  });

  test("returns summer theme for June", () => {
    const theme = seasonalTheme({ date: new Date(2024, 5, 15) });
    expect(theme.id).toBe("seasonal-summer");
    expect(theme.colors.primary).toBe("yellow");
    expect(theme.colors.border).toBe("brightYellow");
  });

  test("returns summer theme for July", () => {
    const theme = seasonalTheme({ date: new Date(2024, 6, 15) });
    expect(theme.id).toBe("seasonal-summer");
  });

  test("returns summer theme for August", () => {
    const theme = seasonalTheme({ date: new Date(2024, 7, 15) });
    expect(theme.id).toBe("seasonal-summer");
  });

  test("returns autumn theme for September", () => {
    const theme = seasonalTheme({ date: new Date(2024, 8, 15) });
    expect(theme.id).toBe("seasonal-autumn");
    expect(theme.colors.primary).toBe("brightYellow");
    expect(theme.colors.border).toBe("yellow");
  });

  test("returns autumn theme for October", () => {
    const theme = seasonalTheme({ date: new Date(2024, 9, 15) });
    expect(theme.id).toBe("seasonal-autumn");
  });

  test("returns autumn theme for November", () => {
    const theme = seasonalTheme({ date: new Date(2024, 10, 15) });
    expect(theme.id).toBe("seasonal-autumn");
  });

  test("all themes have complete color definitions", () => {
    const dates = [
      new Date(2024, 0, 15),   // winter
      new Date(2024, 3, 15),   // spring
      new Date(2024, 6, 15),   // summer
      new Date(2024, 9, 15),   // autumn
    ];

    for (const date of dates) {
      const theme = seasonalTheme({ date });
      expect(theme.colors.primary).toBeDefined();
      expect(theme.colors.border).toBeDefined();
      expect(theme.colors.text).toBeDefined();
      expect(theme.colors.background).toBeDefined();
      expect(theme.colors.accent).toBeDefined();
      expect(theme.borderStyle).toBe("single");
    }
  });
});