import { describe, test, expect } from "vitest";
import vibrantTheme from "./vibrant.js";

describe("vibrant theme", () => {
  test("returns correct theme id", () => {
    const theme = vibrantTheme({ date: new Date() });
    expect(theme.id).toBe("vibrant");
  });

  test("returns expected colors", () => {
    const theme = vibrantTheme({ date: new Date() });
    expect(theme.colors.primary).toBe("yellowBright");
    expect(theme.colors.border).toBe("magentaBright");
    expect(theme.colors.text).toBe("cyanBright");
    expect(theme.colors.background).toBe("blue");
    expect(theme.colors.accent).toBe("greenBright");
  });

  test("returns double border style", () => {
    const theme = vibrantTheme({ date: new Date() });
    expect(theme.borderStyle).toBe("double");
  });

  test("theme is consistent across calls", () => {
    const theme1 = vibrantTheme({ date: new Date(2024, 0, 1) });
    const theme2 = vibrantTheme({ date: new Date(2024, 6, 15) });

    expect(theme1.id).toBe(theme2.id);
    expect(theme1.colors.primary).toBe(theme2.colors.primary);
    expect(theme1.borderStyle).toBe(theme2.borderStyle);
  });

  test("has all required color fields", () => {
    const theme = vibrantTheme({ date: new Date() });
    expect(theme.colors).toHaveProperty("primary");
    expect(theme.colors).toHaveProperty("border");
    expect(theme.colors).toHaveProperty("text");
    expect(theme.colors).toHaveProperty("background");
    expect(theme.colors).toHaveProperty("accent");
  });
});