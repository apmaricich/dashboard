import React, { useCallback, useState, useEffect } from "react";
import { Box, Text } from "ink";
import BigText from "ink-big-text";
import { useWidgetContext } from "../FoundationWidget.js";

/**
 * Digital clock widget using ink-big-text for large ASCII art digits.
 * Displays current time in a large, easily readable format: HH:MM:SS
 */
const ClockWidget = () => {
  const { layout } = useWidgetContext();
  const [timeString, setTimeString] = useState("");

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setTimeString(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeString) {
    return (
      <Box>
        <Text>Loading clock...</Text>
      </Box>
    );
  }

  // Dynamic font selection based on available width
  // "block" font is 7 chars wide per digit, 10 digits = 70 chars
  let font: "block" | "tiny" = "tiny";
  if (layout.width >= 70) {
    font = "block";
  }

  // Render large ASCII art text with ink-big-text, centered
  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height={layout.height}
      width={layout.width}
    >
      <Box alignItems="center">
        <BigText text={timeString} font={font} />
      </Box>
    </Box>
  );
};

export default ClockWidget;
