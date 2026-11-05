import React, { useCallback, useRef, useMemo } from "react";
import { Box, Text } from "ink";
import { getSystemMetrics } from "../../lib/system.js";
import useRefresh from "../../hooks/useRefresh.js";
import { useWidgetContext } from "../FoundationWidget.js";

const BAR_WIDTH = 10;

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 GB";
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
};

const renderBar = (percent: number, width: number): string => {
  const filled = Math.round((percent / 100) * width);
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
};

// Static labels rendered once, never change
const CPU_LABEL = "CPU:";
const MEM_LABEL = "Memory:";
const GPU_LABEL = "GPU:";

const SystemMetrics = () => {
  const { theme } = useWidgetContext();

  // Stable data function via useCallback to prevent infinite re-renders
  const dataFn = useCallback(async () => getSystemMetrics(), []);

  // Refresh every 5 seconds
  const { data: metrics, isLoading, error } = useRefresh(5, dataFn);

  // Compute dynamic values (useMemo must be called every render, before any
  // conditionals)
  const cpuPercent = metrics ? Math.round(metrics.cpu.load) : 0;
  const memPercent = metrics ? Math.round(metrics.memory.percent) : 0;
  const memUsed = metrics ? formatBytes(metrics.memory.used) : "0 GB";
  const memTotal = metrics ? formatBytes(metrics.memory.total) : "0 GB";
  const gpuPercent = metrics ? Math.round(metrics.gpu.usage) : 0;

  // Memoize each row so it only re-renders when its value changes
  const cpuRow = useMemo(
    () => (
      <Box>
        <Text bold color="white">{CPU_LABEL}</Text>
        <Text bold color="cyan"> {cpuPercent}%</Text>
        <Text color="blue"> [{renderBar(cpuPercent, BAR_WIDTH)}]</Text>
      </Box>
    ),
    [cpuPercent]
  );

  const memRow = useMemo(
    () => (
      <Box>
        <Text bold color="white">{MEM_LABEL}</Text>
        <Text bold color="cyan"> {memUsed} / {memTotal}</Text>
        <Text color="blue"> [{renderBar(memPercent, BAR_WIDTH)}]</Text>
      </Box>
    ),
    [memPercent, memUsed, memTotal]
  );

  const gpuRow = useMemo(
    () => (
      <Box>
        <Text bold color="white">{GPU_LABEL}</Text>
        <Text bold color="green"> {gpuPercent}%</Text>
        <Text color="blue"> [{renderBar(gpuPercent, BAR_WIDTH)}]</Text>
      </Box>
    ),
    [gpuPercent]
  );

  if (error) {
    return (
      <Box>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {cpuRow}
      {memRow}
      {gpuRow}
    </Box>
  );
};

export default SystemMetrics;
