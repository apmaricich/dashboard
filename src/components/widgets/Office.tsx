import React, { useCallback } from "react";
import { Box, Text } from "ink";
import BigText from "ink-big-text";
import { getCurrentOffice, OfficeData } from "../../lib/divine-office.js";
import useRefresh from "../../hooks/useRefresh.js";
import { useWidgetContext } from "../FoundationWidget.js";

/**
 * Office of the Hours widget that displays the current divine office.
 *
 * Uses the breviarium library to determine:
 * - Current office name based on time of day
 * - Today's celebration and liturgical color
 * - Psalm and reading references for the current office
 *
 * Refreshes every 60 seconds.
 */
const Office = () => {
  const { theme } = useWidgetContext();

  // Stable data function via useCallback to prevent infinite re-renders
  const dataFn = useCallback(async () => getCurrentOffice(), []);

  // Refresh every 60 seconds
  const { data: office, isLoading, error } = useRefresh(60, dataFn);

  if (isLoading) {
    return (
      <Box>
        <Text color="cyan">Loading office...</Text>
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

  if (!office) {
    return (
      <Box>
        <Text>No office information available</Text>
      </Box>
    );
  }

  // Render office name in large text
  const officeText = office.office;

  return (
    <Box flexDirection="column">
      {/* Office name in large text */}
      <Box>
        <BigText text={officeText} font="tiny" colors={[theme.colors.accent]} />
      </Box>

      {/* Office time range */}
      <Box>
        <Text bold color={theme.colors.primary}>When:</Text>
        <Text color={theme.colors.text}> {office.timeRange}</Text>
      </Box>

      {/* Today's celebration */}
      <Box>
        <Text bold color={theme.colors.primary}>Feast:</Text>
        <Text color={theme.colors.text}> {office.celebration}</Text>
      </Box>

      {/* Psalm references */}
      {office.psalmRefs.length > 0 && (
        <Box>
          <Text bold color={theme.colors.primary}>Psalms:</Text>
          <Text color={theme.colors.text}> {office.psalmRefs.join(", ")}</Text>
        </Box>
      )}

      {/* Reading reference */}
      {office.readingRef && (
        <Box>
          <Text bold color={theme.colors.primary}>Reading:</Text>
          <Text color={theme.colors.text}> {office.readingRef}</Text>
        </Box>
      )}

      {/* Gospel reference */}
      {office.gospelRef && (
        <Box>
          <Text bold color={theme.colors.primary}>Gospel:</Text>
          <Text color={theme.colors.text}> {office.gospelRef.split(":")[0]}</Text>
        </Box>
      )}
    </Box>
  );
};

export default Office;