import React from "react";
import { render, Box, useWindowSize, Text } from "ink";
import FoundationWidget from "./components/FoundationWidget.js";
import LiturgicalCalendar from "./components/widgets/LiturgicalCalendar.js";
import TimeOffice from "./components/widgets/TimeOffice.js";
import { getTheme } from "./themes/index.js";
import { WidgetConfig } from "./config/loader.js";
import { getLayoutStrategy, LayoutResult } from "./lib/layout.js";

// Test app with multiple widgets side by side
function TestApp() {
  const theme = getTheme("liturgical", { date: new Date() });
  const { columns, rows } = useWindowSize();

  const config1: WidgetConfig = {
    name: "Liturgical Calendar",
    type: "liturgical-calendar",
    order: 1,
    refresh: 0
  };

  const config2: WidgetConfig = {
    name: "Time & Office",
    type: "time-office",
    order: 2,
    refresh: 0
  };

  // Header height = 3 (border top, content, border bottom)
  // Footer height = 3 (border top, content, border bottom)
  // No spacing rows
  const HEADER_HEIGHT = 3;
  const FOOTER_HEIGHT = 3;
  const widgetAreaHeight = rows - HEADER_HEIGHT - FOOTER_HEIGHT;

  const layouts = getLayoutStrategy("grid").compute(
    [config1, config2],
    columns,
    widgetAreaHeight
  );

  return (
    <Box flexDirection="column">
      <Box width="100%" borderStyle="single" borderColor={theme.colors.border}>
        <Text bold color={theme.colors.primary}> Dashboard</Text>
      </Box>
      <Box flexDirection="row">
        <FoundationWidget config={config1} layout={layouts[0]} theme={theme}>
          <LiturgicalCalendar />
        </FoundationWidget>
        <FoundationWidget config={config2} layout={layouts[1]} theme={theme}>
          <TimeOffice />
        </FoundationWidget>
      </Box>
      <Box width="100%" borderStyle="single" borderColor={theme.colors.border}>
        <Text bold color={theme.colors.primary}> APM</Text>
      </Box>
    </Box>
  );
}

const { unmount } = render(<TestApp />);

if (process.argv.includes("--once")) {
  setTimeout(() => unmount(), 100);
}
