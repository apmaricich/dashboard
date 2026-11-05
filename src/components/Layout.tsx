import React from "react";
import { Box } from "ink";
import { WidgetConfig } from "../config/loader.js";

export interface LayoutProps {
  widgets: WidgetConfig[];
  maxCols: number;
}

const Layout = ({ widgets, maxCols }: LayoutProps) => {
  const rows = [];
  for (let i = 0; i < widgets.length; i += maxCols) {
    const row = widgets.slice(i, i + maxCols);
    rows.push(
      <Box flexDirection="row" key={i}>
        {row.map((w) => (
          <Box key={w.name}>{w.name}</Box>
        ))}
      </Box>
    );
  }
  return <Box flexDirection="column">{rows}</Box>;
};

export default Layout;
