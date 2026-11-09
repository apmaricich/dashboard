import React from "react";
import { render, Box, useWindowSize, Text } from "ink";
import FoundationWidget from "./components/FoundationWidget.js";
import LiturgicalCalendar from "./components/widgets/LiturgicalCalendar.js";
import { getTheme } from "./themes/index.js";
import { WidgetConfig } from "./config/loader.js";
import { getLayoutStrategy } from "./lib/layout.js";

// Test app showing the Liturgical Calendar widget
function TestApp() {
  const theme = getTheme("liturgical", { date: new Date() });
  const { columns, rows } = useWindowSize();

  const config: WidgetConfig = {
    name: "Liturgical Calendar",
    type: "liturgical",
    order: 1,
    refresh: 60,
    params: {
      showProgress: true,
    },
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
        <Text bold color={theme.colors.primary}> Liturgical Calendar</Text>
      </Box>
      <Box width={columns} height={widgetAreaHeight} position="relative">
        <FoundationWidget
          key="liturgical"
          config={config}
          layout={layouts[0]}
          theme={theme}
          position="absolute"
          left={layouts[0].x}
          top={layouts[0].y}
        >
          <LiturgicalCalendar config={config} />
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