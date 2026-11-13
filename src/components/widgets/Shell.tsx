import React, { useCallback } from "react";
import { Box, Text } from "ink";
import useRefresh from "../../hooks/useRefresh.js";
import { useWidgetContext } from "../FoundationWidget.js";
import { runShellCommand } from "../../lib/shell.js";

interface ShellParams {
  command: string;
  env?: Record<string, string>;
}

const Shell = () => {
  const { config, theme } = useWidgetContext();

  const params = (config.params as unknown as ShellParams) || {};
  const command = params.command;
  const env = params.env;

  const dataFn = useCallback(async () => {
    if (!command) {
      return null;
    }
    return runShellCommand(command, env);
  }, [command, env]);

  const { data: output, isLoading, error } = useRefresh(config.refresh, dataFn);

  if (isLoading) {
    return (
      <Box>
        <Text color="cyan">Loading...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Command error</Text>
        <Text color="gray">{error}</Text>
      </Box>
    );
  }

  if (!command) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">No command configured</Text>
        <Text color="gray">Set params.command to a shell command</Text>
      </Box>
    );
  }

  if (!output) {
    return (
      <Box>
        <Text>No output</Text>
      </Box>
    );
  }

  const lines = output.split("\n");
  const displayLines: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    displayLines.push(
      <Box key={i}>
        <Text color={theme.colors.text}>{lines[i]}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {displayLines}
    </Box>
  );
};

export default Shell;
