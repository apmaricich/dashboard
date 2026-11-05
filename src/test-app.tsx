import React from "react";
import { render, Box } from "ink";
import FoundationWidget from "./components/FoundationWidget.js";
import LiturgicalCalendar from "./components/widgets/LiturgicalCalendar.js";
import { getTheme } from "./themes/index.js";
import { WidgetConfig } from "./config/loader.js";
import { LayoutResult } from "./lib/layout.js";

// Test app with multiple widgets side by side
function TestApp() {
  const theme = getTheme("liturgical", { date: new Date() });

  const config1: WidgetConfig = {
    name: "Liturgical Calendar",
    type: "liturgical-calendar",
    order: 1,
    refresh: 0
  };

  const config2: WidgetConfig = {
    name: "Liturgical Calendar 2",
    type: "liturgical-calendar",
    order: 2,
    refresh: 0
  };

  const layout: LayoutResult = {
    x: 0,
    y: 0,
    width: 60,
    height: 15
  };

  return (
    <Box flexDirection="row">
      <FoundationWidget config={config1} layout={layout} theme={theme}>
        <LiturgicalCalendar />
      </FoundationWidget>
      <FoundationWidget config={config2} layout={layout} theme={theme}>
        <LiturgicalCalendar />
      </FoundationWidget>
    </Box>
  );
}

const { unmount } = render(<TestApp />);

if (process.argv.includes("--once")) {
  setTimeout(() => unmount(), 100);
}