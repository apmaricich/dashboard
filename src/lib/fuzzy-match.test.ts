import { describe, test, expect } from "vitest";
import { fuzzyMatchScore, fuzzyFilter } from "./fuzzy-match.js";

describe("fuzzyMatchScore", () => {
  test("empty query returns 0", () => {
    expect(fuzzyMatchScore("", "test")).toBe(0);
    expect(fuzzyMatchScore("   ", "test")).toBe(0);
  });

  test("exact match returns 100", () => {
    expect(fuzzyMatchScore("test", "test")).toBe(100);
    expect(fuzzyMatchScore("TEST", "test")).toBe(100);
    expect(fuzzyMatchScore("Test", "test")).toBe(100);
  });

  test("prefix match returns 90", () => {
    expect(fuzzyMatchScore("tes", "testing")).toBe(90);
    expect(fuzzyMatchScore("test", "testing")).toBe(90);
    expect(fuzzyMatchScore("abc", "abcdef")).toBe(90);
  });

  test("contains match returns 70", () => {
    expect(fuzzyMatchScore("test", "pretestpost")).toBe(70);
    expect(fuzzyMatchScore("abc", "xyabcyz")).toBe(70);
  });

  test("fuzzy match (all chars in order) returns 50", () => {
    expect(fuzzyMatchScore("tm", "test match")).toBe(50);
    expect(fuzzyMatchScore("abc", "axbycz")).toBe(50);
    expect(fuzzyMatchScore("abc", "a b c")).toBe(50);
  });

  test("no match returns 0", () => {
    expect(fuzzyMatchScore("xyz", "abc")).toBe(0);
    expect(fuzzyMatchScore("test", "hello")).toBe(0);
  });

  test("case insensitive matching", () => {
    expect(fuzzyMatchScore("TeSt", "TESTING")).toBe(90);
    expect(fuzzyMatchScore("TEST", "testing")).toBe(90);
    expect(fuzzyMatchScore("test", "TESTING")).toBe(90);
  });

  test("whitespace trimmed", () => {
    expect(fuzzyMatchScore("  test  ", "testing")).toBe(90);
    expect(fuzzyMatchScore("test", "  testing  ")).toBe(90);
  });

  test("fuzzy match fails if chars not in order", () => {
    expect(fuzzyMatchScore("bc", "abc")).toBe(70); // contains match
    expect(fuzzyMatchScore("cb", "abc")).toBe(0); // chars not in order
    expect(fuzzyMatchScore("ca", "abc")).toBe(0);
  });

  test("single character matches", () => {
    expect(fuzzyMatchScore("a", "abc")).toBe(90);
    expect(fuzzyMatchScore("b", "abc")).toBe(70);
    expect(fuzzyMatchScore("c", "abc")).toBe(70);
    expect(fuzzyMatchScore("d", "abc")).toBe(0);
  });

  test("empty target returns 0", () => {
    expect(fuzzyMatchScore("test", "")).toBe(0);
  });
});

describe("fuzzyFilter", () => {
  const items = [
    { id: 1, name: "Clock Widget" },
    { id: 2, name: "Calendar Widget" },
    { id: 3, name: "System Monitor" },
    { id: 4, name: "Time Office" },
  ];

  test("empty query returns all items with score 100", () => {
    const results = fuzzyFilter("", items, (item) => item.name);
    expect(results).toHaveLength(4);
    expect(results.every((r) => r.score === 100)).toBe(true);
  });

  test("exact match ranks first", () => {
    const results = fuzzyFilter("Clock Widget", items, (item) => item.name);
    expect(results[0].item.name).toBe("Clock Widget");
    expect(results[0].score).toBe(100);
  });

  test("prefix match ranked higher than contains", () => {
    const results = fuzzyFilter("time", items, (item) => item.name);
    // "Time Office" starts with "time" (prefix), should rank higher
    const timeOffice = results.find((r) => r.item.name === "Time Office");
    expect(timeOffice).not.toBeUndefined();
    expect(timeOffice!.score).toBe(90);
  });

  test("fuzzy matching finds items with all query chars in order", () => {
    const results = fuzzyFilter("cw", items, (item) => item.name);
    // "Clock Widget" contains c-w in order
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.name).toBe("Clock Widget");
    expect(results[0].score).toBe(50);
  });

  test("maxResults limits output", () => {
    const results = fuzzyFilter("w", items, (item) => item.name, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  test("only items with score > 0 are included", () => {
    const results = fuzzyFilter("xyz", items, (item) => item.name);
    expect(results).toEqual([]);
  });

  test("results sorted by score descending", () => {
    const results = fuzzyFilter("ti", items, (item) => item.name);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });

  test("returns index matching original array position", () => {
    const results = fuzzyFilter("clock", items, (item) => item.name);
    expect(results[0].index).toBe(0);
  });

  test("filter by item property other than name", () => {
    const numericItems = [
      { code: 100, name: "Item A" },
      { code: 101, name: "Item B" },
    ];
    const results = fuzzyFilter("101", numericItems, (item) => String(item.code));
    expect(results.length).toBe(1);
    expect(results[0].item.name).toBe("Item B");
  });

  test("whitespace in query is trimmed", () => {
    const results = fuzzyFilter("  clock  ", items, (item) => item.name);
    expect(results.length).toBe(1);
    expect(results[0].item.name).toBe("Clock Widget");
  });
});