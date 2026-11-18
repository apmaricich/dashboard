import React, { useCallback } from "react";
import { Box, Text } from "ink";
import useRefresh from "../../hooks/useRefresh.js";
import { useWidgetContext } from "../FoundationWidget.js";

interface WorkDayParams {
  startHour?: number;
  endHour?: number;
}

function getWorkProgress(startHour: number, endHour: number): { progress: number; status: string; timeRemaining: string } {
  const now = new Date();
  const currentHour = now.getHours() + (now.getMinutes() / 60);

  if (currentHour < startHour) {
    const hoursToStart = Math.floor(startHour - currentHour);
    const minsToStart = Math.floor((startHour - currentHour - hoursToStart) * 60);
    return {
      progress: 0,
      status: "Not started",
      timeRemaining: `${hoursToStart}h ${minsToStart}m until start`,
    };
  }

  if (currentHour >= endHour) {
    const hoursAfter = Math.floor(currentHour - endHour);
    const minsAfter = Math.floor((currentHour - endHour - hoursAfter) * 60);
    return {
      progress: 1,
      status: "Complete",
      timeRemaining: `${hoursAfter}h ${minsAfter}m after end`,
    };
  }

  const totalWorkHours = endHour - startHour;
  const elapsed = currentHour - startHour;
  const progress = elapsed / totalWorkHours;

  const remaining = endHour - currentHour;
  const hoursRemaining = Math.floor(remaining);
  const minsRemaining = Math.floor((remaining - hoursRemaining) * 60);

  return {
    progress,
    status: "In progress",
    timeRemaining: `${hoursRemaining}h ${minsRemaining}m remaining`,
  };
}

function renderBar(percent: number, width: number): string {
  const filled = Math.round(percent * width);
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
}

const WorkDay = () => {
  const { config, theme } = useWidgetContext();
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });

  const params = (config.params as WorkDayParams) || {};
  const startHour = params.startHour ?? 8; // Default 8 AM
  const endHour = params.endHour ?? 16; // Default 4 PM

  const dataFn = useCallback(async () => {
    return getWorkProgress(startHour, endHour);
  }, [startHour, endHour]);

  const { data: progress, isLoading, error } = useRefresh(60, dataFn);

  if (isLoading) {
    return (
      <Box>
        <Text color="cyan">Loading work progress...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Failed to calculate work progress</Text>
        <Text color="gray">{error}</Text>
      </Box>
    );
  }

  if (!progress) {
    return (
      <Box>
        <Text>No work progress data available</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" justifyContent="flex-start">
      <Box>
        <Text bold color={theme.colors.primary}>{progress.status}</Text>
      </Box>
      <Box>
        <Text color={
          progress.progress < 0.80
            ? theme.colors.text
            : progress.progress < 0.90
              ? ("208" as any)
              : ("119" as any)
        }>
          |{renderBar(progress.progress, 20)}|
        </Text>
        <Text color={theme.colors.accent}> {Math.round(progress.progress * 100)}%</Text>
      </Box>
      <Box>
        <Text color={theme.colors.accent}>{progress.timeRemaining}</Text>
      </Box>
      <Box>
        <Text color={theme.colors.border}>{weekday}</Text>
      </Box>
    </Box>
  );
};

export default WorkDay;
