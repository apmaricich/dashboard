import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../src/themes/index.js", () => ({
  getTheme: vi.fn(),
  registerTheme: vi.fn(),
}));

import { getTheme } from "../src/themes/index.js";
import useThemeRefresh from "../src/hooks/useThemeRefresh.js";

const mockTheme = {
  id: "liturgical",
  colors: {
    primary: "#e05555",
    border: "#e05555",
    text: "#ffffff",
    background: "#1a0000",
    accent: "#ff6666",
  },
  borderStyle: "double",
};

describe("useThemeRefresh", () => {
  it("loads theme immediately on mount with no refresh config", () => {
    (getTheme as ReturnType<typeof vi.fn>).mockImplementation(
      (_name: string, _context: any) => mockTheme
    );

    const { result } = renderHook(() =>
      useThemeRefresh({ themeName: "liturgical", refreshConfig: undefined })
    );

    expect(getTheme).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual(mockTheme);
  });

  it("uses fallback theme when theme function throws on mount", () => {
    (getTheme as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("Theme not found");
    });

    const { result } = renderHook(() =>
      useThemeRefresh({ themeName: "nonexistent", refreshConfig: undefined })
    );

    expect(result.current.id).toBe("fallback");
  });

  describe("interval mode", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      (getTheme as ReturnType<typeof vi.fn>).mockReset();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("refreshes theme at interval", () => {
      let callCount = 0;
      (getTheme as ReturnType<typeof vi.fn>).mockImplementation(
        (_name: string, _context: any) => {
          callCount++;
          if (callCount > 1) {
            return { ...mockTheme, id: "liturgical-morning" };
          }
          return mockTheme;
        }
      );

      // Stable refresh config reference
      const refreshConfig = { intervalHours: 1 };
      const { result } = renderHook(() =>
        useThemeRefresh({ themeName: "liturgical", refreshConfig })
      );

      expect(getTheme).toHaveBeenCalledTimes(1);
      expect(result.current).toEqual(mockTheme);

      // Advance 1 hour
      act(() => {
        vi.advanceTimersByTime(60 * 60 * 1000);
      });

      expect(getTheme).toHaveBeenCalledTimes(2);
      expect(result.current).toEqual({ ...mockTheme, id: "liturgical-morning" });
    });

    it("does not refresh until interval elapses", () => {
      (getTheme as ReturnType<typeof vi.fn>).mockImplementation(
        (_name: string, _context: any) => mockTheme
      );

      // Stable refresh config reference
      const refreshConfig = { intervalHours: 3 };
      const { result } = renderHook(() =>
        useThemeRefresh({ themeName: "liturgical", refreshConfig })
      );

      expect(getTheme).toHaveBeenCalledTimes(1);

      // Advance 2 hours - should not have refreshed yet
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 60 * 1000);
      });
      expect(getTheme).toHaveBeenCalledTimes(1);

      // Advance to 3 hours - should refresh
      act(() => {
        vi.advanceTimersByTime(60 * 60 * 1000);
      });
      expect(getTheme).toHaveBeenCalledTimes(2);
    });
  });

  describe("atHour mode", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      (getTheme as ReturnType<typeof vi.fn>).mockReset();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("refreshes at specific hour", () => {
      // Set system time to 14:00 (not the target hour)
      vi.setSystemTime(new Date(2026, 10, 13, 14, 0, 0));

      let callCount = 0;
      (getTheme as ReturnType<typeof vi.fn>).mockImplementation(
        (_name: string, _context: any) => {
          callCount++;
          if (callCount > 1) {
            return { ...mockTheme, id: "liturgical-evening" };
          }
          return mockTheme;
        }
      );

      // Stable refresh config reference
      const refreshConfig = { atHour: 16 };
      const { result } = renderHook(() =>
        useThemeRefresh({ themeName: "liturgical", refreshConfig })
      );

      expect(getTheme).toHaveBeenCalledTimes(1);
      expect(result.current).toEqual(mockTheme);

      // Advance to 16:00 - should refresh (10 minute polling interval triggers)
      act(() => {
        vi.setSystemTime(new Date(2026, 10, 13, 16, 0, 0));
        vi.advanceTimersByTime(10 * 60 * 1000);
      });
      expect(getTheme).toHaveBeenCalledTimes(2);
      expect(result.current).toEqual({ ...mockTheme, id: "liturgical-evening" });
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      (getTheme as ReturnType<typeof vi.fn>).mockReset();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("keeps last theme when refresh throws error", () => {
      const firstTheme = { ...mockTheme, id: "first" };
      const secondTheme = { ...mockTheme, id: "second" };

      let callIndex = 0;
      (getTheme as ReturnType<typeof vi.fn>).mockImplementation(() => {
        callIndex++;
        if (callIndex === 1) return firstTheme;
        if (callIndex === 2) throw new Error("Temporary failure");
        return secondTheme;
      });

      // Stable refresh config reference
      const refreshConfig = { intervalHours: 1 };
      const { result } = renderHook(() =>
        useThemeRefresh({ themeName: "liturgical", refreshConfig })
      );

      expect(result.current).toEqual(firstTheme);

      // Trigger refresh that throws
      act(() => {
        vi.advanceTimersByTime(60 * 60 * 1000);
      });

      // Should keep the last good theme (firstTheme)
      expect(result.current).toEqual(firstTheme);

      // Next refresh succeeds
      act(() => {
        vi.advanceTimersByTime(60 * 60 * 1000);
      });
      expect(result.current).toEqual(secondTheme);
    });
  });

  it("re-evaluates when refreshConfig changes", () => {
    (getTheme as ReturnType<typeof vi.fn>).mockImplementation(
      (_name: string, _context: any) => mockTheme
    );

    const { result, rerender } = renderHook(
      ({ themeName, refreshConfig }) => useThemeRefresh({ themeName, refreshConfig }),
      { initialProps: { themeName: "liturgical", refreshConfig: undefined } }
    );

    expect(getTheme).toHaveBeenCalledTimes(1);

    // Rerender with new config - should trigger initial load again (theme name unchanged)
    rerender({ themeName: "liturgical", refreshConfig: { intervalHours: 2 } });

    expect(result.current).toEqual(mockTheme);
  });
});