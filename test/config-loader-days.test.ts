import { describe, it, expect } from "vitest";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { loadConfig } from "../src/config/loader.js";

// Helper to create a temp config file
function createTempConfig(content: string): string {
  const tempPath = join(tmpdir(), `dashboard-config-${Date.now()}.yaml`);
  writeFileSync(tempPath, content, "utf-8");
  return tempPath;
}

// Helper to clean up temp files
function cleanupTemp(path: string) {
  try {
    unlinkSync(path);
  } catch {
    // Ignore if already deleted
  }
}

describe("config loader day validation", () => {
  it("loads valid config with daysShown as weekdays placeholder", () => {
    const content = `
layout:
  strategy: grid
  maxCols: 3
  theme: liturgical

widgets:
  - name: "Weekday Widget"
    type: system
    order: 1
    refresh: 5
    daysShown: [weekdays]
`;
    const path = createTempConfig(content);
    try {
      const config = loadConfig(path);
      expect(config.widgets).toHaveLength(1);
      expect(config.widgets[0].name).toBe("Weekday Widget");
      expect(config.widgets[0].daysShown).toEqual(["weekdays"]);
    } finally {
      cleanupTemp(path);
    }
  });

  it("loads valid config with mixed numbers and placeholders", () => {
    const content = `
layout:
  strategy: grid
  maxCols: 3
  theme: liturgical

widgets:
  - name: "Mixed Days"
    type: time
    order: 1
    refresh: 60
    daysShown: [weekdays, 7]
    daysHidden: [weekends]
`;
    const path = createTempConfig(content);
    try {
      const config = loadConfig(path);
      expect(config.widgets).toHaveLength(1);
      expect(config.widgets[0].daysShown).toEqual(["weekdays", 7]);
      expect(config.widgets[0].daysHidden).toEqual(["weekends"]);
    } finally {
      cleanupTemp(path);
    }
  });

  it("throws error for invalid day number", () => {
    const content = `
layout:
  strategy: grid
  maxCols: 3
  theme: liturgical

widgets:
  - name: "Bad Day Number"
    type: system
    order: 1
    refresh: 5
    daysShown: [15]
`;
    const path = createTempConfig(content);
    try {
      expect(() => loadConfig(path)).toThrow(/15.*Bad Day Number|Bad Day Number.*15/);
    } finally {
      cleanupTemp(path);
    }
  });

  it("throws error for invalid day name", () => {
    const content = `
layout:
  strategy: grid
  maxCols: 3
  theme: liturgical

widgets:
  - name: "Bad Day Name"
    type: time
    order: 1
    refresh: 60
    daysShown: [tuesday]
`;
    const path = createTempConfig(content);
    try {
      expect(() => loadConfig(path)).toThrow(/tuesday.*Bad Day Name|Bad Day Name.*tuesday/);
    } finally {
      cleanupTemp(path);
    }
  });
});