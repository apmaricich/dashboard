import React from "react";
import { render, Box, Text } from "ink";
import FoundationWidget from "./components/FoundationWidget.js";
import { getTheme } from "./themes/index.js";
import { WidgetConfig } from "./config/loader.js";
import { LayoutResult } from "./lib/layout.js";

// Dummy widget for testing
function TestWidget() {
  return (
    <Box flexDirection="column">
      <Text>This is a test widget</Text>
      <Text>It demonstrates the FoundationWidget layout</Text>
      <Text bold color="green">✓ Working!</Text>
    </Box>
  );
}

// Test app with fixed layout
function TestApp() {
  const theme = getTheme("liturgical", { date: new Date() });

  const config: WidgetConfig = {
    name: "Test Widget",
    type: "test",
    order: 1,
    refresh: 0
  };

  const layout: LayoutResult = {
    x: 0,
    y: 0,
    width: 60,
    height: 10
  };

  return (
    <FoundationWidget config={config} layout={layout} theme={theme}>
      <TestWidget />
    </FoundationWidget>
  );
}

render(<TestApp />);