import React, { useCallback } from "react";
import { Box, Text } from "ink";
import BigText from "ink-big-text";
import { getLiturgicalInfo } from "../../lib/liturgical.js";
import useRefresh from "../../hooks/useRefresh.js";
import { useWidgetContext } from "../FoundationWidget.js";

/**
 * Liturgical Calendar widget that displays today's liturgical information.
 *
 * Uses the romcal library via getLiturgicalInfo to determine:
 * - Current liturgical season (Advent, Christmas, Lent, Easter, Ordinary Time, etc.)
 * - Feast/celebration name for today
 * - Rank (Solemnity, Feast, Memorial, etc.)
 * - Liturgical color
 */
const LiturgicalCalendar = () => {
  const { theme, layout } = useWidgetContext();

  // Stable data function via useCallback to prevent infinite re-renders
  const dataFn = useCallback(async () => getLiturgicalInfo(), []);

  // Refresh every hour (3600 seconds) - liturgical calendar only changes daily
  const { data: liturgical, isLoading, error } = useRefresh(3600, dataFn);

  if (isLoading) {
    return (
      <Box>
        <Text color="cyan">Loading liturgical calendar...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (!liturgical) {
    return (
      <Box>
        <Text>No liturgical information available</Text>
      </Box>
    );
  }

  const dateStr = liturgical.date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const colorMap: Record<string, string> = {
    red: "red",
    rose: "magenta",
    purple: "blue",
    green: "green",
    white: "white",
    gold: "yellow",
  };

  const terminalColor = colorMap[liturgical.color] || "green";

  // Determine if we have enough width for large text
  // "tiny" font is approximately 2 chars wide per character
  // Date string is typically 15-20 chars, so we need at least 30 chars wide
  const useLargeText = layout.width >= 60;

  return (
    <Box flexDirection="column">
      {useLargeText ? (
        <BigText text={dateStr} font="tiny" colors={[terminalColor]} />
      ) : (
        <Text bold color={terminalColor}>{dateStr}</Text>
      )}
      <Box><Text bold>Season:</Text><Text> {liturgical.season}</Text></Box>
      <Box><Text bold>Feast:</Text><Text> {liturgical.name}</Text></Box>
      <Box><Text bold>Rank:</Text><Text> {liturgical.rank}</Text></Box>
      <Box><Text bold>Color:</Text><Text color={terminalColor}> ■ {liturgical.color}</Text></Box>
    </Box>
  );
};

export default LiturgicalCalendar;
