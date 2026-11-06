import React, { useCallback } from "react";
import { Box, Text } from "ink";
import { liturgicalYear } from "../../lib/liturgical.js";
import useRefresh from "../../hooks/useRefresh.js";
import { useWidgetContext } from "../FoundationWidget.js";

/**
 * Liturgical Year Progress widget showing a horizontal timeline of all
 * liturgical seasons with proportionate widths and a current position marker.
 */
const LiturgicalYearProgress = () => {
  const { theme, layout } = useWidgetContext();

  const dataFn = useCallback(async () => liturgicalYear(), []);
  const { data: yearData, isLoading, error } = useRefresh(3600, dataFn);

  if (isLoading) {
    return (
      <Box>
        <Text color="cyan">Loading liturgical year...</Text>
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

  if (!yearData || yearData.totalDays === 0) {
    return (
      <Box>
        <Text>No liturgical year data available</Text>
      </Box>
    );
  }

  // Bar width: fit within widget area (width minus 2 for borders)
  const barWidth = layout.width - 2;

  // Traditional liturgical colors in hex
  const seasonColors: Record<string, string> = {
    "Advent": "#663399",
    "Christmas": "#FFFFFF",
    "Ordinary Time": "#228B22",
    "Lent": "#663399",
    "Holy Week": "#CC0000",
    "Eastertide": "#FFD700",
  };

  // Emoji symbols for each liturgical season (using romcal season values)
  const seasonSymbols: Record<string, string> = {
    "Advent": "🕯️",
    "Christmas": "🎄",
    "Ordinary Time": "⚔️",
    "Lent": "🌾",
    "Holy Week": "☠️",
    "Eastertide": "🌿",
  };

  // Build the progress bar character by character
  const bar: Array<{ char: string; color: string }> = [];
  let dayIndex = 0;
  let currentSeasonIndex = -1;

  // Use the currentSeasonIndex provided by the liturgical year data
  currentSeasonIndex = yearData.currentSeasonIndex;

  let seasonIdx = 0;
  for (const season of yearData.seasons) {
    const seasonColor = seasonColors[season.name] || "green";

    for (let i = 0; i < season.totalDays; i++) {
      const normalizedDay = dayIndex + i;
      const barIndex = Math.floor((normalizedDay / yearData.totalDays) * barWidth);

      if (barIndex < barWidth) {
        // Determine if this day should be filled
        let filled = false;
        if (seasonIdx < currentSeasonIndex) {
          // Previous seasons are fully filled
          filled = true;
        } else if (seasonIdx === currentSeasonIndex) {
          // Current season: fill up to current day
          filled = i < yearData.currentSeasonDay;
        }

        if (filled) {
          bar[barIndex] = { char: "█", color: seasonColor };
        } else {
          bar[barIndex] = { char: "░", color: seasonColor };
        }

        // Then overlay season boundary at transitions
        if (i > 0 && barIndex > 0) {
          bar[barIndex] = { char: "┊", color: "gray" };
        }
      }
    }
    dayIndex += season.totalDays;
    seasonIdx++;
  }

  // Ensure bar is full width
  while (bar.length < barWidth) {
    bar.push({ char: "░", color: "gray" });
  }





  // Progress bar split by season with | separators and colors
  const ProgressBar = () => {
    let chars: Array<{ char: string; color?: string }> = [];
    let dayIndex = 0;

    for (let s = 0; s < yearData.seasons.length; s++) {
      const season = yearData.seasons[s];
      const seasonColor = seasonColors[season.name] || "#228B22";
      const seasonWidth = Math.round((season.totalDays / yearData.totalDays) * (barWidth - 2));

      for (let i = 0; i < seasonWidth; i++) {
        chars.push({ char: "█", color: seasonColor });
      }

      // Add | separator after each season except the last
      if (s < yearData.seasons.length - 1) {
        chars.push({ char: "|" });
      }
    }

    // Fill remaining space if needed
    while (chars.length < barWidth) {
      chars.push({ char: " " });
    }

    return (
      <Box>
        {chars.map((ch, i) => (
          <Text key={`bar-${i}`} color={ch.color}>
            {ch.char}
          </Text>
        ))}
      </Box>
    );
  };

  // Position indicator with week text - placement varies by half
  const PositionIndicator = ({ indicatorLeft }: { indicatorLeft: boolean }) => {
    const text = `Week ${weekNumber}`;
    if (indicatorLeft) {
      // Marker in right half: text to the left of marker
      const textLen = text.length + 1; // +1 for space
      const leftSpacers = markerIndex - textLen;
      return (
        <Box>
          {Array.from({ length: leftSpacers }).map((_, i) => (
            <Text key={`left-${i}`} color="gray"> </Text>
          ))}
          <Text color="gray">{text} </Text>
          <Text color="yellow">▲</Text>
          {Array.from({ length: barWidth - 2 - leftSpacers - textLen - 1 }).map((_, i) => (
            <Text key={`right-${i}`} color="gray"> </Text>
          ))}
        </Box>
      );
    } else {
      // Marker in left half: text to the right of marker
      return (
        <Box>
          {Array.from({ length: markerIndex }).map((_, i) => (
            <Text key={`spacer-${i}`} color="gray"> </Text>
          ))}
          <Text color="yellow">▲</Text>
          <Text color="gray"> {text}</Text>
        </Box>
      );
    }
  };

  // Calculate current position marker
  const currentDay = Math.floor(yearData.progress * yearData.totalDays);
  const markerIndex = Math.floor((currentDay / yearData.totalDays) * (barWidth - 2));
  const weekNumber = Math.floor(currentDay / 7);

  return (
    <Box flexDirection="column">
      <ProgressBar />
      <PositionIndicator indicatorLeft={markerIndex >= barWidth / 2} />
    </Box>
  );
};

export default LiturgicalYearProgress;
