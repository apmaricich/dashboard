import React, { useCallback } from "react";
import { Box, Text } from "ink";
import useRefresh from "../../hooks/useRefresh.js";
import { useWidgetContext } from "../FoundationWidget.js";
import { runTaskCommand } from "../../lib/task.js";

interface TaskListParams {
  file: string;
  task?: string;
}

/**
 * TaskList widget: runs `task --file {path}` (or `task {task} --file {path}`)
 * and displays the output. Useful for showing task definitions or running
 * specific tasks from a Taskfile.
 */
const TaskList = () => {
  const { config, theme } = useWidgetContext();

  const params = (config.params as unknown as TaskListParams) || {};
  const taskFile = params.file;
  const specificTask = params.task;

  const dataFn = useCallback(async () => {
    if (!taskFile) {
      return null;
    }
    return runTaskCommand(taskFile, specificTask);
  }, [taskFile, specificTask]);

  const { data: output, isLoading, error } = useRefresh(config.refresh, dataFn);

  if (isLoading) {
    return (
      <Box>
        <Text color="cyan">Loading tasks...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Task error</Text>
        <Text color="gray">{error}</Text>
      </Box>
    );
  }

  if (!taskFile) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">No task file configured</Text>
        <Text color="gray">Set params.file to a Taskfile path</Text>
      </Box>
    );
  }

  if (!output) {
    return (
      <Box>
        <Text>No task output available</Text>
      </Box>
    );
  }

  // Split output into lines and render
  const lines = output.trim().split("\n");
  const displayLines: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    displayLines.push(
      <Box key={i}>
        <Text color={theme.colors.text}>{line}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {displayLines}
    </Box>
  );
};

export default TaskList;
