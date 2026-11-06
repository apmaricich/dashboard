import React, { createContext, useContext, PropsWithChildren } from "react";
import { Box, Text } from "ink";
import { TitledBox } from "@mishieck/ink-titled-box";
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
  /** Optional absolute positioning (for grid layout) */
  position?: "relative" | "absolute";
  left?: number;
  top?: number;
}

/**
 * Error boundary that catches rendering errors in widgets
 * and displays a friendly error message.
 */
class WidgetErrorBoundary extends React.Component<
  { config: WidgetConfig; children: React.ReactNode },
  { hasError: boolean; error: string | null }
> {
  constructor(props: { config: WidgetConfig; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error, prevProps: { config: { name: string } }) {
    console.error(`Widget "${prevProps.config.name}" error:`, error);
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box flexDirection="column">
          <Text color="red">Widget error</Text>
          <Text color="gray">{this.state.error}</Text>
        </Box>
      );
    }
    return this.props.children;
  }
}

/**
 * Foundation widget wrapper that provides borders, theme, and error handling.
 */
const FoundationWidget = ({
  config,
  layout,
  theme,
  position,
  left,
  top,
  children,
}: PropsWithChildren<FoundationWidgetProps>) => {
  const contextValue: WidgetContextType = { config, layout, theme };

  return (
    <WidgetContext.Provider value={contextValue}>
      <TitledBox
        borderStyle={theme.borderStyle as never}
        borderColor={theme.colors.primary}
        titles={[config.name]}
        height={layout.height}
        width={layout.width}
        paddingX={1}
        paddingY={0}
        flexDirection="column"
        {...(position ? { position } : {})}
        {...(left !== undefined ? { left } : {})}
        {...(top !== undefined ? { top } : {})}
      >
        <WidgetErrorBoundary config={config}>
          <Box flexGrow={1}>{children}</Box>
        </WidgetErrorBoundary>
      </TitledBox>
    </WidgetContext.Provider>
  );
};

export default FoundationWidget;
