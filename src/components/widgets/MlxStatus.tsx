import React, { useCallback } from "react";
import { Box, Text } from "ink";
import { getMlxStatus, MlxStatus as MlxStatusData } from "../../lib/mlx-status.js";
import useRefresh from "../../hooks/useRefresh.js";
import { useWidgetContext } from "../FoundationWidget.js";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(1)} ${units[i]}`;
};

const formatContextLength = (length: number): string => {
  if (length >= 1048576) {
    return `${(length / 1048576).toFixed(0)}M`;
  }
  if (length >= 1024) {
    return `${(length / 1024).toFixed(0)}K`;
  }
  return `${length}`;
};

const MlxStatus = () => {
  const { theme } = useWidgetContext();

  const dataFn = useCallback(async () => getMlxStatus(), []);
  const { data: status, isLoading, error } = useRefresh(30, dataFn);

  if (isLoading) {
    return (
      <Box>
        <Text color="cyan">Loading MLX status...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Connection error</Text>
        <Text color="gray">MLX-serve is not reachable</Text>
      </Box>
    );
  }

  if (!status) {
    return (
      <Box>
        <Text>No MLX status available</Text>
      </Box>
    );
  }

  const stateColor = status.state === "ready" ? "green" : "yellow";

  if (!status.running || !status.model) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">No active model</Text>
      </Box>
    );
  }

  const displayLines = [
    <Box key="model">
      <Text bold color={theme.colors.primary}>Model:</Text>
      <Text color={theme.colors.text}> {status.model}</Text>
    </Box>,
    <Box key="state">
      <Text bold color={theme.colors.primary}>State:</Text>
      <Text color={stateColor}> {status.state}</Text>
    </Box>,
    <Box key="memory">
      <Text bold color={theme.colors.primary}>Memory:</Text>
      <Text color={theme.colors.text}> {formatBytes(status.bytesResident)}</Text>
      {status.bytesOnDisk > 0 && (
        <Text dimColor> ({formatBytes(status.bytesOnDisk)} disk)</Text>
      )}
    </Box>,
  ];

  if (status.contextLength !== null) {
    displayLines.push(
      <Box key="context">
        <Text bold color={theme.colors.primary}>Context:</Text>
        <Text color={theme.colors.text}> {formatContextLength(status.contextLength)} tokens</Text>
      </Box>
    );
  }

  if (status.quantization) {
    displayLines.push(
      <Box key="quant">
        <Text bold color={theme.colors.primary}>Quantization:</Text>
        <Text color={theme.colors.text}> {status.quantization}</Text>
      </Box>
    );
  }

  if (status.architecture) {
    let archText = status.architecture;
    if (status.numLayers !== null) {
      archText = `${status.architecture} (${status.numLayers} layers)`;
    }
    displayLines.push(
      <Box key="arch">
        <Text bold color={theme.colors.primary}>Architecture:</Text>
        <Text color={theme.colors.text}> {archText}</Text>
      </Box>
    );
  }

  if (status.capabilities.length > 0) {
    displayLines.push(
      <Box key="caps">
        <Text bold color={theme.colors.primary}>Capabilities:</Text>
        <Text color={theme.colors.text}> {status.capabilities.join(", ")}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {displayLines}
    </Box>
  );
};

export default MlxStatus;
