import React from "react";
import { render, Box, useWindowSize, Text } from "ink";
import FoundationWidget from "./components/FoundationWidget.js";
import ImageWidget from "./components/widgets/ImageWidget.js";
import { getTheme } from "./themes/index.js";
import { WidgetConfig } from "./config/loader.js";
import { getLayoutStrategy } from "./lib/layout.js";

function ImageTestApp() {
  const theme = getTheme("liturgical", { date: new Date() });
  const { columns, rows } = useWindowSize();

  const config: WidgetConfig = {
    name: "Test Image",
    type: "image",
    order: 1,
    refresh: 0,
    params: {
      path: "./assets/test.png",
      width: 20,
    },
  };

  const widgetAreaHeight = rows - 6;
  const layouts = getLayoutStrategy("grid").compute(
    [config],
    columns,
    widgetAreaHeight,
    { maxCols: 1 }
  );

  return (
    <Box flexDirection="column">
      <Box width="100%" borderStyle="single" borderColor={theme.colors.border}>
        <Text bold color={theme.colors.primary}> Image Widget Test</Text>
      </Box>
      <Box width={columns} height={widgetAreaHeight} position="relative">
        <FoundationWidget
          key="image"
          config={config}
          layout={layouts[0]}
          theme={theme}
          position="absolute"
          left={layouts[0].x}
          top={layouts[0].y}
        >
          <ImageWidget />
        </FoundationWidget>
      </Box>
      <Box width="100%" borderStyle="single" borderColor={theme.colors.border}>
        <Text bold color={theme.colors.primary}> Done</Text>
      </Box>
    </Box>
  );
}

const { unmount } = render(<ImageTestApp />);

if (process.argv.includes("--once")) {
  setTimeout(() => unmount(), 5000);
}