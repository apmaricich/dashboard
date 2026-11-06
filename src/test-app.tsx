import React from "react";
import { render, Box, useWindowSize, Text } from "ink";
import FoundationWidget from "./components/FoundationWidget.js";
import Office from "./components/widgets/Office.js";
import { getTheme } from "./themes/index.js";
import { WidgetConfig } from "./config/loader.js";
import { getLayoutStrategy } from "./lib/layout.js";

// Test app showing the Office of the Hours widget
function TestApp() {
  const theme = getTheme("liturgical", { date: new Date() });
  const { columns, rows } = useWindowSize();

  const config: WidgetConfig = {
    name: "Office of the Hours",
    type: "office",
    order: 1,
    refresh: 60,
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
        <Text bold color={theme.colors.primary}> Office of the Hours</Text>
      </Box>
      <Box width={columns} height={widgetAreaHeight} position="relative">
        <FoundationWidget
          key="office"
          config={config}
          layout={layouts[0]}
          theme={theme}
          position="absolute"
          left={layouts[0].x}
          top={layouts[0].y}
        >
          <Office />
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