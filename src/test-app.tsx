import React from "react";
import { render, Box, useWindowSize, Text } from "ink";
import FoundationWidget from "./components/FoundationWidget.js";
import LiturgicalCalendar from "./components/widgets/LiturgicalCalendar.js";
import TimeOffice from "./components/widgets/TimeOffice.js";
import MlxStatus from "./components/widgets/MlxStatus.js";
import SystemMetrics from "./components/widgets/SystemMetrics.js";
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

  const config3: WidgetConfig = {
    name: "MLX Status",
    type: "mlx-status",
    order: 3,
    refresh: 0
  };

  const config4: WidgetConfig = {
    name: "System Metrics",
    type: "system-metrics",
    order: 4,
    refresh: 0
  };

  // Header height = 3 (border top, content, border bottom)
  // Footer height = 3 (border top, content, border bottom)
  // No spacing rows
  const HEADER_HEIGHT = 3;
  const FOOTER_HEIGHT = 3;
  const widgetAreaHeight = rows - HEADER_HEIGHT - FOOTER_HEIGHT;

  const layouts = getLayoutStrategy("grid").compute(
    [config1, config2, config3, config4],
    columns,
    widgetAreaHeight,
    { maxCols: 3 }
  );

  // Debug: show layout positions
  console.error("Layout positions:");
  layouts.forEach((l, i) => {
    console.error(`  Widget ${i}: x=${l.x}, y=${l.y}, w=${l.width}, h=${l.height}`);
  });

  return (
    <Box flexDirection="column">
      <Box width="100%" borderStyle="single" borderColor={theme.colors.border}>
        <Text bold color={theme.colors.primary}> Dashboard</Text>
      </Box>
      <Box width={columns} height={widgetAreaHeight} position="relative">
        {layouts.map((layout, i) => (
          <FoundationWidget
            key={i}
            config={[config1, config2, config3, config4][i]}
            layout={layout}
            theme={theme}
            position="absolute"
            left={layout.x}
            top={layout.y}
          >
            {i === 0 && <LiturgicalCalendar />}
            {i === 1 && <TimeOffice />}
            {i === 2 && <MlxStatus />}
            {i === 3 && <SystemMetrics />}
          </FoundationWidget>
        ))}
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
