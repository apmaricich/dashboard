import React, { createContext, useContext, PropsWithChildren } from "react";
import { Box, Text } from "ink";
import { WidgetConfig } from "../config/loader.js";
import { LayoutResult } from "../lib/layout.js";
import { Theme } from "../themes/index.js";

/**
 * Context provided to all widget children.
 */
export interface WidgetContextType {
  /** The widget's configuration */
  config: WidgetConfig;
  /** The widget's computed layout position and dimensions */
  layout: LayoutResult;
  /** The active dashboard theme */
  theme: Theme;
}

export const WidgetContext = createContext<WidgetContextType | null>(null);

/**
 * Hook to access the widget context from any child component.
 * @returns The widget context containing config, layout, and theme
 * @throws Error if called outside a FoundationWidget
 */
export function useWidgetContext(): WidgetContextType {
  const ctx = useContext(WidgetContext);
  if (!ctx) {
    throw new Error("useWidgetContext must be called within a FoundationWidget");
  }
  return ctx;
}

export interface FoundationWidgetProps {
  /** Widget configuration from the dashboard definition */
  config: WidgetConfig;
  /** Computed layout position and dimensions for this widget */
  layout: LayoutResult;
  /** Active dashboard theme */
  theme: Theme;
}

const FoundationWidget = ({
  config,
  layout,
  theme,
  children,
}: PropsWithChildren<FoundationWidgetProps>) => {
  const contextValue: WidgetContextType = { config, layout, theme };

  return (
    <WidgetContext.Provider value={contextValue}>
      <Box
        borderStyle={theme.borderStyle as never}
        borderColor={theme.colors.border}
        height={layout.height}
        width={layout.width}
        paddingX={1}
        paddingY={1}
        flexDirection="column"
      >
        <Box>
          <Text bold color={theme.colors.primary}>{config.name}{'\n'}</Text>
        </Box>
        <Box>{children}</Box>
      </Box>
    </WidgetContext.Provider>
  );
};

export default FoundationWidget;
