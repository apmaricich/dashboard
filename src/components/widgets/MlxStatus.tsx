import React from "react";
import { Box, Text } from "ink";

interface MlxStatusProps {
  endpoint?: string;
}

const MlxStatus = ({ endpoint }: MlxStatusProps) => {
  return (
    <Box>
      <Box>
        <Text bold>MLX Status</Text>
      </Box>
      <Box>Endpoint: {endpoint ?? "http://localhost:8080"}</Box>
      <Box>Placeholder</Box>
    </Box>
  );
};

export default MlxStatus;
