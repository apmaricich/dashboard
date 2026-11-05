import React from "react";
import { Box } from "ink";
import { WidgetConfig } from "../config/loader.js";
import { LayoutResult } from "../lib/layout.js";
import { Theme } from "../themes/index.js";
import FoundationWidget from "./FoundationWidget.js";
import SystemMetrics from "./widgets/SystemMetrics.js";
import LiturgicalCalendar from "./widgets/LiturgicalCalendar.js";
import TimeOffice from "./widgets/TimeOffice.js";
import MlxStatus from "./widgets/MlxStatus.js";

/**
 * Widget type registry mapping widget type names to React components.
 */
const widgetRegistry = new Map<string, React.ComponentType>();

widgetRegistry.set("system", SystemMetrics);
widgetRegistry.set("liturgical", LiturgicalCalendar);
widgetRegistry.set("time", TimeOffice);
widgetRegistry.set("mlx", MlxStatus);

export interface LayoutProps {
  /** Widget configurations to render */
  widgets: WidgetConfig[];
  /** Computed layout positions and dimensions for each widget */
  layout: LayoutResult[];
  /** Active dashboard theme */
  theme: Theme;
  /** Terminal column count */
  columns: number;
  /** Terminal row count */
  rows: number;
}

/**
 * Reusable layout component that renders all dashboard widgets
 * at their computed positions using absolute positioning.
 */
const Layout = ({ widgets, layout, theme, columns, rows }: LayoutProps) => {
  return (
    <Box width={columns} height={rows - 1}>
      {widgets.map((widget, index) => {
        const WidgetComponent = widgetRegistry.get(widget.type);
        if (!WidgetComponent) {
          throw new Error(`Unknown widget type: ${widget.type}`);
        }
        const layoutInfo = layout[index] || {
          x: 0,
          y: 0,
          width: columns,
          height: rows - 1,
        };
        return (
          <FoundationWidget
            key={widget.name}
            config={widget}
            layout={layoutInfo}
            theme={theme}
            position="absolute"
            left={layoutInfo.x}
            top={layoutInfo.y}
          >
            <WidgetComponent />
          </FoundationWidget>
        );
      })}
    </Box>
  );
};

export default Layout;
