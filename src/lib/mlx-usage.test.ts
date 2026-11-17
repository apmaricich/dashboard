import { describe, test, expect, vi, Mock } from "vitest";
import { formatUsageTime, computeUsageDelta } from "./mlx-usage.js";
import type { MlxMetrics } from "./mlx-status.js";

// Mock fs module
vi.mock("fs", () => {
  let fileContent = "";

  return {
    readFileSync: vi.fn((path: string) => {
      if (path.endsWith("mlx-snapshot.json")) {
        if (!fileContent) {
          throw new Error("ENOENT");
        }
        return fileContent;
      }
      throw new Error(`ENOENT: ${path}`);
    }),
    writeFileSync: vi.fn((path: string, content: string) => {
      if (path.endsWith("mlx-snapshot.json")) {
        fileContent = content;
      }
    }),
    mkdirSync: vi.fn(() => {}),
  };
});

describe("formatUsageTime", () => {
  test("formats seconds < 60 as Ns", () => {
    expect(formatUsageTime(45)).toBe("45s");
  });

  test("formats seconds < 60 at zero", () => {
    expect(formatUsageTime(0)).toBe("0s");
  });

  test("formats minutes and seconds < 60m", () => {
    expect(formatUsageTime(90)).toBe("1m 30s");
  });

  test("formats minutes and seconds just under 1h", () => {
    expect(formatUsageTime(3599)).toBe("59m 59s");
  });

  test("formats exactly 1h 0m", () => {
    expect(formatUsageTime(3600)).toBe("1h 0m");
  });

  test("formats 2h 0m", () => {
    expect(formatUsageTime(7200)).toBe("2h 0m");
  });

  test("formats 1h 2m", () => {
    expect(formatUsageTime(3725)).toBe("1h 2m");
  });
});

describe("computeUsageDelta", () => {
  function makeMetrics(overrides: Partial<MlxMetrics> = {}): MlxMetrics {
    return {
      counters: {
        promptTokensTotal: 0,
        generationTokensTotal: 0,
        prefillTokensTotal: 0,
        requestsSuccessTotal: 0,
        requestsCancelledTotal: 0,
        requestsFailedTotal: 0,
      },
      histogramSums: {
        decodeTimeSeconds: 0,
        prefillTimeSeconds: 0,
        timeToFirstTokenSeconds: 0,
        e2eRequestLatencySeconds: 0,
        promptTokens: 0,
        outputTokens: 0,
      },
      processStartTimeSeconds: 1000,
      ...overrides,
    };
  }

  test("returns zero deltas with isFreshDay=true when no snapshot exists", async () => {
    const { readFileSync } = await import("fs");
    (readFileSync as Mock).mockClear();

    const metrics = makeMetrics();
    const delta = computeUsageDelta(metrics);

    expect(delta).toEqual({
      gpuComputeSeconds: 0,
      prefillSeconds: 0,
      timeToFirstTokenSeconds: 0,
      e2eLatencySeconds: 0,
      promptTokens: 0,
      generationTokens: 0,
      requests: 0,
      isFreshDay: true,
      processRestarted: false,
    });
  });

  test("returns zero deltas with processRestarted=true when process time differs", async () => {
    const { writeFileSync } = await import("fs");
    (writeFileSync as Mock).mockClear();

    // First, establish a snapshot with process time 1000
    const initialMetrics = makeMetrics();
    computeUsageDelta(initialMetrics);

    // Now compute with a different process time
    const restartedMetrics = makeMetrics({ processStartTimeSeconds: 2000 });
    const delta = computeUsageDelta(restartedMetrics);

    expect(delta).toEqual({
      gpuComputeSeconds: 0,
      prefillSeconds: 0,
      timeToFirstTokenSeconds: 0,
      e2eLatencySeconds: 0,
      promptTokens: 0,
      generationTokens: 0,
      requests: 0,
      isFreshDay: false,
      processRestarted: true,
    });
  });

  test("computes correct deltas when neither fresh day nor process restart", async () => {
    const { writeFileSync } = await import("fs");
    (writeFileSync as Mock).mockClear();

    // Establish snapshot
    const snapshotMetrics = makeMetrics({
      counters: {
        promptTokensTotal: 100,
        generationTokensTotal: 50,
        prefillTokensTotal: 0,
        requestsSuccessTotal: 10,
        requestsCancelledTotal: 0,
        requestsFailedTotal: 0,
      },
      histogramSums: {
        decodeTimeSeconds: 10,
        prefillTimeSeconds: 5,
        timeToFirstTokenSeconds: 2,
        e2eRequestLatencySeconds: 15,
        promptTokens: 0,
        outputTokens: 0,
      },
    });
    computeUsageDelta(snapshotMetrics);

    // Compute delta with increased values
    const currentMetrics = makeMetrics({
      counters: {
        promptTokensTotal: 200,
        generationTokensTotal: 150,
        prefillTokensTotal: 0,
        requestsSuccessTotal: 15,
        requestsCancelledTotal: 0,
        requestsFailedTotal: 0,
      },
      histogramSums: {
        decodeTimeSeconds: 30,
        prefillTimeSeconds: 10,
        timeToFirstTokenSeconds: 5,
        e2eRequestLatencySeconds: 50,
        promptTokens: 0,
        outputTokens: 0,
      },
    });
    const delta = computeUsageDelta(currentMetrics);

    expect(delta).toEqual({
      gpuComputeSeconds: 20,
      prefillSeconds: 5,
      timeToFirstTokenSeconds: 3,
      e2eLatencySeconds: 35,
      promptTokens: 100,
      generationTokens: 100,
      requests: 5,
      isFreshDay: false,
      processRestarted: false,
    });
  });

  test("persists snapshot across multiple calls (regression)", async () => {
    const { writeFileSync } = await import("fs");
    (writeFileSync as Mock).mockClear();

    // Establish baseline snapshot
    const baselineMetrics = makeMetrics({
      counters: {
        promptTokensTotal: 100,
        generationTokensTotal: 50,
        prefillTokensTotal: 0,
        requestsSuccessTotal: 10,
        requestsCancelledTotal: 0,
        requestsFailedTotal: 0,
      },
      histogramSums: {
        decodeTimeSeconds: 10,
        prefillTimeSeconds: 5,
        timeToFirstTokenSeconds: 2,
        e2eRequestLatencySeconds: 15,
        promptTokens: 0,
        outputTokens: 0,
      },
    });
    computeUsageDelta(baselineMetrics);

    // First call with increased values
    const firstMetrics = makeMetrics({
      counters: {
        promptTokensTotal: 200,
        generationTokensTotal: 100,
        prefillTokensTotal: 0,
        requestsSuccessTotal: 15,
        requestsCancelledTotal: 0,
        requestsFailedTotal: 0,
      },
      histogramSums: {
        decodeTimeSeconds: 30,
        prefillTimeSeconds: 10,
        timeToFirstTokenSeconds: 5,
        e2eRequestLatencySeconds: 50,
        promptTokens: 0,
        outputTokens: 0,
      },
    });
    const firstDelta = computeUsageDelta(firstMetrics);

    expect(firstDelta).toEqual({
      gpuComputeSeconds: 20,
      prefillSeconds: 5,
      timeToFirstTokenSeconds: 3,
      e2eLatencySeconds: 35,
      promptTokens: 100,
      generationTokens: 50,
      requests: 5,
      isFreshDay: false,
      processRestarted: false,
    });

    // Second call with further increased values
    // Delta should be computed from the baseline snapshot, not from the first call
    const secondMetrics = makeMetrics({
      counters: {
        promptTokensTotal: 300,
        generationTokensTotal: 150,
        prefillTokensTotal: 0,
        requestsSuccessTotal: 20,
        requestsCancelledTotal: 0,
        requestsFailedTotal: 0,
      },
      histogramSums: {
        decodeTimeSeconds: 50,
        prefillTimeSeconds: 15,
        timeToFirstTokenSeconds: 8,
        e2eRequestLatencySeconds: 80,
        promptTokens: 0,
        outputTokens: 0,
      },
    });
    const secondDelta = computeUsageDelta(secondMetrics);

    expect(secondDelta).toEqual({
      gpuComputeSeconds: 40,
      prefillSeconds: 10,
      timeToFirstTokenSeconds: 6,
      e2eLatencySeconds: 65,
      promptTokens: 200,
      generationTokens: 100,
      requests: 10,
      isFreshDay: false,
      processRestarted: false,
    });

    // Verify deltas add up correctly to total usage
    expect(secondDelta.promptTokens).toBe(firstDelta.promptTokens + 100);
    expect(secondDelta.generationTokens).toBe(firstDelta.generationTokens + 50);
    expect(secondDelta.gpuComputeSeconds).toBe(firstDelta.gpuComputeSeconds + 20);
    expect(secondDelta.requests).toBe(firstDelta.requests + 5);
  });
});
