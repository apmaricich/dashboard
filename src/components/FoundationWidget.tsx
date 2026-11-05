import React, { type PropsWithChildren } from "react";
import { Box } from "ink";

export interface FoundationWidgetProps {
  config: Record<string, unknown>;
  layout: Record<string, unknown>;
  theme: Record<string, unknown>;
}

const FoundationWidget = ({ config, layout, theme, children }: PropsWithChildren<FoundationWidgetProps>) => {
  return (
    <Box borderStyle="round" paddingX={1} paddingY={0}>
      {children}
    </Box>
  );
};

export default FoundationWidget;
