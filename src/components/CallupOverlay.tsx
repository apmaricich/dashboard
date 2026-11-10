import React from 'react';
import { Box, Text } from 'ink';

export interface WidgetTypeResult {
  id: string;
  name: string;
  description: string;
}

interface CallupOverlayProps {
  query: string;
  results: WidgetTypeResult[];
  selected: number;
  activeWidgetType?: string | null;
  activeWidgetComponent?: React.ReactNode;
  onQueryChange: (text: string) => void;
  onSelect: (typeId: string) => void;
}

export default function CallupOverlay({
  query,
  results,
  selected,
  activeWidgetType,
  activeWidgetComponent,
}: CallupOverlayProps) {
  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
      flexGrow={1}
      backgroundColor="#111111"
    >
      <Box
        flexDirection="column"
        width={50}
        borderColor="#444444"
        borderStyle="single"
        padding={1}
        backgroundColor="#1a1a1a"
      >
        <Box marginBottom={1}>
          <Text bold color="#ffffff">Widget Callup</Text>
        </Box>

        <Box marginBottom={1} paddingX={1} backgroundColor="#2a2a2a">
          <Text color="#aaaaaa">{query}</Text>
        </Box>

        {activeWidgetType ? (
          <Box flexDirection="column" paddingX={1}>
            <Text bold color="#ffffff">{activeWidgetType}</Text>
            <Box marginTop={1}>
              {activeWidgetComponent}
            </Box>
          </Box>
        ) : results.length === 0 ? (
          <Text color="#777777">No matching widgets</Text>
        ) : (
          <Box flexDirection="column">
            {results.map((result, index) => (
              <Box
                key={result.id}
                flexDirection="column"
                paddingX={1}
                backgroundColor={index === selected ? '#3366aa' : undefined}
              >
                <Text bold={index === selected} color={index === selected ? '#ffffff' : '#cccccc'}>
                  {result.name}
                </Text>
                <Text color={index === selected ? '#bbbbbb' : '#666666'}>
                  {result.description}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        <Box marginTop={1} paddingX={1}>
          <Text color="#555555">
            {activeWidgetType ? 'Press esc to return to list' : '↑↓ navigate, enter select, esc dismiss'}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
