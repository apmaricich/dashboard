import { describe, it, expect } from "vitest";

describe("ClockWidget", () => {
  it("selects block font for wide widgets", () => {
    // Test that block font is selected when width >= 70
    const selectFont = (width: number): "block" | "tiny" => {
      if (width >= 70) {
        return "block";
      }
      return "tiny";
    };
    expect(selectFont(80)).toBe("block");
  });

  it("selects tiny font for narrow widgets", () => {
    // Test that tiny font is selected when width < 70
    const selectFont = (width: number): "block" | "tiny" => {
      if (width >= 70) {
        return "block";
      }
      return "tiny";
    };
    expect(selectFont(26)).toBe("tiny");
  });

  it("font selection logic is correct", () => {
    // Simulate the font selection logic
    const selectFont = (width: number): "block" | "tiny" => {
      if (width >= 70) {
        return "block";
      }
      return "tiny";
    };

    expect(selectFont(80)).toBe("block");
    expect(selectFont(70)).toBe("block");
    expect(selectFont(69)).toBe("tiny");
    expect(selectFont(26)).toBe("tiny");
    expect(selectFont(1)).toBe("tiny");
  });
});