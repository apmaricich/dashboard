import React from "react";
import { render, Box, useWindowSize } from "ink";
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

  const layouts = getLayoutStrategy("grid").compute(
    [config1, config2],
    columns,
    rows
  );

  return (
    <Box flexDirection="row">
      <FoundationWidget config={config1} layout={layouts[0]} theme={theme}>
        <LiturgicalCalendar />
      </FoundationWidget>
      <FoundationWidget config={config2} layout={layouts[1]} theme={theme}>
        <TimeOffice />
      </FoundationWidget>
    </Box>
  );
}

const { unmount } = render(<TestApp />);

if (process.argv.includes("--once")) {
  setTimeout(() => unmount(), 100);
}
