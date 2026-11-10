import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCallup } from "../src/hooks/useCallup.js";

describe("useCallup - keyboard navigation", () => {
  it("opens on 'c' and closes on 'escape'", () => {
    const { result } = renderHook(() => useCallup());
    expect(result.current.open).toBe(false);

    act(() => result.current.handleInput("c", {}));
    expect(result.current.open).toBe(true);
    expect(result.current.query).toBe("");
    expect(result.current.selected).toBe(0);

    act(() => result.current.handleInput("", { escape: true }));
    expect(result.current.open).toBe(false);
  });

  it("navigates with up and down arrow keys", () => {
    const { result } = renderHook(() => useCallup());
    act(() => result.current.handleInput("c", {}));

    // Move down
    act(() => result.current.handleInput("", { downArrow: true }));
    expect(result.current.selected).toBe(1);

    // Move down again
    act(() => result.current.handleInput("", { downArrow: true }));
    expect(result.current.selected).toBe(2);

    // Move up
    act(() => result.current.handleInput("", { upArrow: true }));
    expect(result.current.selected).toBe(1);
  });

  it("respects filtered list boundaries when navigating", () => {
    const { result } = renderHook(() => useCallup());
    act(() => result.current.handleInput("c", {}));

    // Type a query to filter
    act(() => result.current.handleInput("cli", {}));

    // Try to navigate up past the top
    act(() => result.current.handleInput("", { upArrow: true }));
    expect(result.current.selected).toBe(0);

    // Navigate down to bottom
    const numResults = result.current.displayResults.length;
    for (let i = 0; i < numResults; i++) {
      act(() => result.current.handleInput("", { downArrow: true }));
    }
    expect(result.current.selected).toBe(numResults - 1);

    // Try to go past bottom
    act(() => result.current.handleInput("", { downArrow: true }));
    expect(result.current.selected).toBe(numResults - 1);
  });

  it("selects widget on return keypress", () => {
    const { result } = renderHook(() => useCallup());
    act(() => result.current.handleInput("c", {}));

    expect(result.current.activeWidget).toBeNull();

    // Select first widget (Clock - alphabetically first)
    act(() => result.current.handleInput("", { return: true }));
    expect(result.current.activeWidget).not.toBeNull();
    expect(result.current.activeWidget).toBe("time");
  });

  it("returns to list from widget view on escape", () => {
    const { result } = renderHook(() => useCallup());
    act(() => result.current.handleInput("c", {}));
    act(() => result.current.handleInput("", { return: true }));

    expect(result.current.activeWidget).not.toBeNull();

    // Escape should close widget but keep callup open
    act(() => result.current.handleInput("", { escape: true }));
    expect(result.current.open).toBe(true);
    expect(result.current.activeWidget).toBeNull();

    // Escape again should close callup
    act(() => result.current.handleInput("", { escape: true }));
    expect(result.current.open).toBe(false);
  });

  it("builds search query with typed characters", () => {
    const { result } = renderHook(() => useCallup());
    act(() => result.current.handleInput("c", {}));

    expect(result.current.query).toBe("");

    // Type "cli"
    act(() => result.current.handleInput("c", {}));
    act(() => result.current.handleInput("l", {}));
    act(() => result.current.handleInput("i", {}));

    expect(result.current.query).toBe("cli");

    // Results should be filtered to clock widget
    const names = result.current.displayResults.map((r) => r.name);
    expect(names).toContain("Clock");
  });

  it("removes characters with backspace", () => {
    const { result } = renderHook(() => useCallup());
    act(() => result.current.handleInput("c", {}));

    // Type "cli"
    act(() => result.current.handleInput("c", {}));
    act(() => result.current.handleInput("l", {}));
    act(() => result.current.handleInput("i", {}));
    expect(result.current.query).toBe("cli");

    // Backspace
    act(() => result.current.handleInput("", { backspace: true }));
    expect(result.current.query).toBe("cl");

    act(() => result.current.handleInput("", { backspace: true }));
    expect(result.current.query).toBe("c");

    act(() => result.current.handleInput("", { backspace: true }));
    expect(result.current.query).toBe("");
  });

  it("resets selection to 0 on query change", () => {
    const { result } = renderHook(() => useCallup());
    act(() => result.current.handleInput("c", {}));

    // Navigate down
    act(() => result.current.handleInput("", { downArrow: true }));
    expect(result.current.selected).toBe(1);

    // Type a new query - selection should reset
    act(() => result.current.handleInput("c", {}));
    expect(result.current.selected).toBe(0);
  });

  it("selects by navigating to item and pressing return", () => {
    const { result } = renderHook(() => useCallup());
    act(() => result.current.handleInput("c", {}));

    // Navigate to second item (Debug)
    act(() => result.current.handleInput("", { downArrow: true }));
    expect(result.current.selected).toBe(1);

    // Press return
    act(() => result.current.handleInput("", { return: true }));
    expect(result.current.activeWidget).toBe("debug");
  });

  it("displays widgets in alphabetical order", () => {
    const { result } = renderHook(() => useCallup());
    act(() => result.current.handleInput("c", {}));

    // Extract names from display results
    const names = result.current.displayResults.map((r) => r.name);

    // Verify all widgets are present
    expect(names.length).toBe(9);

    // Verify alphabetical order
    for (let i = 1; i < names.length; i++) {
      expect(names[i - 1].localeCompare(names[i])).toBeLessThanOrEqual(0);
    }

    // Spot-check first and last
    expect(names[0]).toBe("Clock");
    expect(names[names.length - 1]).toBe("Work Day");
  });
});