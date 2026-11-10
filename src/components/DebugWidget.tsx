import React, { useState, useRef } from "react";
import { Box, Text } from "ink";
import { appendFileSync } from "fs";

const debugLogs: string[] = [];
const LOG_FILE = "callup-debug.log";

export function addDebugLog(message: string) {
  debugLogs.push(message);
  if (debugLogs.length > 50) {
    debugLogs.shift();
  }
  try {
    appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`);
  } catch (e) {
    // Ignore file write errors
  }
}

export function clearDebugLogs() {
  debugLogs.length = 0;
}

export function getDebugLogs() {
  return debugLogs;
}

const DebugWidget = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<string[]>([]);
  logRef.current = logs;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...getDebugLogs()]);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column">
      {logs.length === 0 ? (
        <Text color="gray">No debug logs</Text>
      ) : (
        logs.map((log, i) => (
          <Text key={i} color={i >= logs.length - 5 ? "yellow" : "gray"}>
            {log}
          </Text>
        ))
      )}
    </Box>
  );
};

export default DebugWidget;