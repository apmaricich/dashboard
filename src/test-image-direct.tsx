import React from "react";
import { render, Box, Text } from "ink";
import ImageWidget from "./components/widgets/ImageWidget.js";
import { WidgetContext } from "./components/FoundationWidget.js";
import { getTheme } from "./themes/index.js";

function ImageTestApp() {
  const theme = getTheme("liturgical", { date: new Date() });

  const config = {
    name: "Test Image",
    type: "image",
    order: 1,
    refresh: 0,
    params: {
      path: "./assets/test.png",
      width: 20,
    },
  };

  const layout = { x: 0, y: 0, width: 40, height: 15 };

  return (
    <WidgetContext.Provider value={{ config, layout, theme }}>
      <Box>
        <ImageWidget />
      </Box>
    </WidgetContext.Provider>
  );
}

const { unmount } = render(<ImageTestApp />);

if (process.argv.includes("--once")) {
  setTimeout(() => unmount(), 5000);
}