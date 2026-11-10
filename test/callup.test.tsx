import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCallup } from "../src/hooks/useCallup.js";

describe("useCallup", () => {
  it("opens callup on 'c' key", () => {
    const { result } = renderHook(() => useCallup());

    expect(result.current.open).toBe(false);

    act(() => {
      result.current.handleInput("c", {});
    });

    expect(result.current.open).toBe(true);
  });

  it("closes callup on escape", () => {
    const { result } = renderHook(() => useCallup());

    act(() => {
      result.current.handleInput("c", {});
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.handleInput("", { escape: true });
    });
    expect(result.current.open).toBe(false);
  });

  it("closes callup on escape (when widget is open)", () => {
    const { result } = renderHook(() => useCallup());

    act(() => {
      result.current.handleInput("c", {});
    });

    // Select a widget
    act(() => {
      result.current.select("time");
    });
    expect(result.current.activeWidget).toBe("time");

    // Escape should close the widget, not the callup
    act(() => {
      result.current.handleInput("", { escape: true });
    });

    // Callup should still be open, but widget should be closed
    expect(result.current.open).toBe(true);
    expect(result.current.activeWidget).toBe(null);

    // Escape again to close callup
    act(() => {
      result.current.handleInput("", { escape: true });
    });
    expect(result.current.open).toBe(false);
  });

  it("opens widget on return key", () => {
    const { result } = renderHook(() => useCallup());

    act(() => {
      result.current.handleInput("c", {});
    });
    expect(result.current.open).toBe(true);

    // Check that all widgets are in the list
    expect(result.current.displayResults.length).toBeGreaterThan(0);

    // Simulate selecting a widget by pressing return (first item)
    act(() => {
      result.current.handleInput("", { return: true });
    });

    // First item should be selected
    expect(result.current.activeWidget).toBe(result.current.displayResults[0].id);
    expect(result.current.activeWidget).not.toBeNull();
    expect(result.current.activeWidgetComponent).not.toBeNull();
  });
});