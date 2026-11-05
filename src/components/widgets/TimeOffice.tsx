import React, { useCallback } from "react";
import { Box, Text } from "ink";
import { getTimeData } from "../../lib/time.js";
import useRefresh from "../../hooks/useRefresh.js";
import { useWidgetContext } from "../FoundationWidget.js";

/**
 * Time & Office widget that displays the current time and the
 * currently suggested Office of the Liturgy of the Hours.
 *
 * Updates every 60 seconds via the useRefresh hook.
 */
const TimeOffice = () => {
  const { theme } = useWidgetContext();

  // Stable data function via useCallback to prevent infinite re-renders
  const dataFn = useCallback(async () => getTimeData(), []);

  // Refresh every 60 seconds
  const { data: time, isLoading, error } = useRefresh(60, dataFn);

  if (isLoading) {
    return (
      <Box>
        <Text color="cyan">Loading time...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (!time) {
    return (
      <Box>
        <Text>No time information available</Text>
      </Box>
    );
  }

  const localTime = time.local.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const utcHour = String(time.utc.getHours()).padStart(2, "0");
  const utcMinute = String(time.utc.getMinutes()).padStart(2, "0");
  const utcTime = `${utcHour}:${utcMinute}`;

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color="white">Local:</Text>
        <Text bold color="cyan"> {localTime}</Text>
      </Box>
      <Box>
        <Text bold color="white">UTC:</Text>
        <Text bold color="green"> {utcTime}</Text>
      </Box>
      <Box>
        <Text bold color="white">Office:</Text>
        <Text bold color="yellow"> {time.liturgy} ({time.liturgyTimeRange})</Text>
      </Box>
    </Box>
  );
};

export default TimeOffice;
