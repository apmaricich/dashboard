import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { MlxMetrics } from "./mlx-status.js";

const SNAPSHOT_DIR = join(homedir(), ".dashboard");
const SNAPSHOT_FILE = join(SNAPSHOT_DIR, "mlx-snapshot.json");

interface MlxSnapshot {
  date: string;
  decodeTimeSeconds: number;
  prefillTimeSeconds: number;
  timeToFirstTokenSeconds: number;
  e2eRequestLatencySeconds: number;
  promptTokensTotal: number;
  generationTokensTotal: number;
  requestsSuccessTotal: number;
  processStartTimeSeconds: number;
}

export interface MlxUsageDelta {
  gpuComputeSeconds: number;
  prefillSeconds: number;
  timeToFirstTokenSeconds: number;
  e2eLatencySeconds: number;
  promptTokens: number;
  generationTokens: number;
  requests: number;
  isFreshDay: boolean;
  processRestarted: boolean;
}

function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadSnapshot(): MlxSnapshot | null {
  try {
    const content = readFileSync(SNAPSHOT_FILE, "utf8");
    const snapshot = JSON.parse(content) as MlxSnapshot;
    if (snapshot.date !== getTodayDate()) {
      return null;
    }
    return snapshot;
  } catch {
    return null;
  }
}

function saveSnapshot(metrics: MlxMetrics): void {
  try {
    mkdirSync(SNAPSHOT_DIR, { recursive: true });
    const snapshot: MlxSnapshot = {
      date: getTodayDate(),
      decodeTimeSeconds: metrics.histogramSums.decodeTimeSeconds,
      prefillTimeSeconds: metrics.histogramSums.prefillTimeSeconds,
      timeToFirstTokenSeconds: metrics.histogramSums.timeToFirstTokenSeconds,
      e2eRequestLatencySeconds: metrics.histogramSums.e2eRequestLatencySeconds,
      promptTokensTotal: metrics.counters.promptTokensTotal,
      generationTokensTotal: metrics.counters.generationTokensTotal,
      requestsSuccessTotal: metrics.counters.requestsSuccessTotal,
      processStartTimeSeconds: metrics.processStartTimeSeconds,
    };
    writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot), "utf8");
  } catch {
    // Best-effort; snapshot failures are not critical
  }
}

export function computeUsageDelta(metrics: MlxMetrics): MlxUsageDelta {
  const snapshot = loadSnapshot();

  if (snapshot) {
    if (snapshot.processStartTimeSeconds !== metrics.processStartTimeSeconds) {
      // Process restarted since snapshot
      saveSnapshot(metrics);
      return {
        gpuComputeSeconds: 0,
        prefillSeconds: 0,
        timeToFirstTokenSeconds: 0,
        e2eLatencySeconds: 0,
        promptTokens: 0,
        generationTokens: 0,
        requests: 0,
        isFreshDay: false,
        processRestarted: true,
      };
    }

    // Compute deltas
    const delta: MlxUsageDelta = {
      gpuComputeSeconds: metrics.histogramSums.decodeTimeSeconds - snapshot.decodeTimeSeconds,
      prefillSeconds: metrics.histogramSums.prefillTimeSeconds - snapshot.prefillTimeSeconds,
      timeToFirstTokenSeconds: metrics.histogramSums.timeToFirstTokenSeconds - snapshot.timeToFirstTokenSeconds,
      e2eLatencySeconds: metrics.histogramSums.e2eRequestLatencySeconds - snapshot.e2eRequestLatencySeconds,
      promptTokens: metrics.counters.promptTokensTotal - snapshot.promptTokensTotal,
      generationTokens: metrics.counters.generationTokensTotal - snapshot.generationTokensTotal,
      requests: metrics.counters.requestsSuccessTotal - snapshot.requestsSuccessTotal,
      isFreshDay: false,
      processRestarted: false,
    };

    // Update snapshot to current values
    saveSnapshot(metrics);
    return delta;
  }

  // No snapshot — save current as baseline
  saveSnapshot(metrics);
  return {
    gpuComputeSeconds: 0,
    prefillSeconds: 0,
    timeToFirstTokenSeconds: 0,
    e2eLatencySeconds: 0,
    promptTokens: 0,
    generationTokens: 0,
    requests: 0,
    isFreshDay: true,
    processRestarted: false,
  };
}

export function formatUsageTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}
