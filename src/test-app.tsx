import React from "react";
import { render, Box, useWindowSize, Text } from "ink";
import FoundationWidget from "./components/FoundationWidget.js";
import LiturgicalYearProgress from "./components/widgets/LiturgicalYearProgress.js";
import { getTheme } from "./themes/index.js";
import { WidgetConfig } from "./config/loader.js";
import { getLayoutStrategy } from "./lib/layout.js";

// Test app showing only the LiturgicalYearProgress widget
function TestApp() {
  const theme = getTheme("liturgical", { date: new Date() });
  const { columns, rows } = useWindowSize();

  const config: WidgetConfig = {
    name: "Liturgical Year",
    type: "liturgical_year",
    order: 1,
    refresh: 3600
  };

  const widgetAreaHeight = rows - 6; // header + footer
  const layouts = getLayoutStrategy("grid").compute(
    [config],
    columns,
    widgetAreaHeight,
    { maxCols: 1 }
  );

  return (
    <Box flexDirection="column">
      <Box width="100%" borderStyle="single" borderColor={theme.colors.border}>
        <Text bold color={theme.colors.primary}> Liturgical Year Progress</Text>
      </Box>
      <Box width={columns} height={widgetAreaHeight} position="relative">
        <FoundationWidget
          key="liturgical-year"
          config={config}
          layout={layouts[0]}
          theme={theme}
          position="absolute"
          left={layouts[0].x}
          top={layouts[0].y}
        >
          <LiturgicalYearProgress />
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
  setTimeout(() => unmount(), 5000);
}