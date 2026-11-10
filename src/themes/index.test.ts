import { describe, test, expect, vi } from "vitest";
import {
  registerTheme,
  getTheme,
  type Theme,
  type ThemeContext,
} from "./index.js";

describe("theme registry", () => {
  test("throws for unregistered theme", () => {
    expect(() =>
      getTheme("nonexistent", { date: new Date() })
    ).toThrow("Theme 'nonexistent' is not registered");
  });

  test("returns theme object when registered", () => {
    const mockTheme: Theme = {
      id: "test",
      colors: {
        primary: "red",
        border: "red",
        text: "white",
        background: "black",
        accent: "red",
      },
      borderStyle: "single",
    };

    registerTheme("test", () => mockTheme);
    const result = getTheme("test", { date: new Date() });
    expect(result.id).toBe("test");
    expect(result.colors.primary).toBe("red");
  });

  test("passes context to theme function", () => {
    let receivedContext: ThemeContext | null = null;
    registerTheme("context-test", (ctx: any) => {
      receivedContext = ctx;
      return {
        id: "context-test",
        colors: {
          primary: "red",
          border: "red",
          text: "white",
          background: "black",
          accent: "red",
        },
        borderStyle: "single",
      };
    });

    const testDate = new Date(2024, 6, 15);
    getTheme("context-test", { date: testDate });
    expect(receivedContext).not.toBeNull();
    expect(receivedContext!.date).toEqual(testDate);
  });

  test("built-in themes are registered", () => {
    expect(() => getTheme("liturgical", { date: new Date() })).not.toThrow();
    expect(() => getTheme("seasonal", { date: new Date() })).not.toThrow();
    expect(() => getTheme("vibrant", { date: new Date() })).not.toThrow();
  });

  test("built-in theme returns correct id", () => {
    expect(getTheme("vibrant", { date: new Date() }).id).toBe("vibrant");
  });
});