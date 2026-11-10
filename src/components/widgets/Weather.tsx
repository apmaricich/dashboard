import React, { useCallback } from "react";
import { Box, Text } from "ink";
import useRefresh from "../../hooks/useRefresh.js";
import { useWidgetContext } from "../FoundationWidget.js";
import { getCurrentWeather, formatTemperature } from "../../lib/weather.js";

interface WeatherParams {
  latitude?: number;
  longitude?: number;
  temperatureUnit?: "celsius" | "fahrenheit";
}

const Weather = () => {
  const { config, theme } = useWidgetContext();

  const params = (config.params as WeatherParams) || {};
  const latitude = params.latitude ?? 40.7128; // Default: New York
  const longitude = params.longitude ?? -74.006; // Default: New York
  const temperatureUnit = params.temperatureUnit ?? "fahrenheit";

  const dataFn = useCallback(async () => {
    return getCurrentWeather(latitude, longitude, temperatureUnit, "mph");
  }, [latitude, longitude, temperatureUnit]);

  const { data: weather, isLoading, error } = useRefresh(600, dataFn);

  if (isLoading) {
    return (
      <Box>
        <Text color="cyan">Loading weather...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Failed to load weather</Text>
        <Text color="gray">{error}</Text>
      </Box>
    );
  }

  if (!weather) {
    return (
      <Box>
        <Text>No weather data available</Text>
      </Box>
    );
  }

  const tempDisplay = formatTemperature(weather.temperature, temperatureUnit);

  return (
    <Box flexDirection="column">
      <Box>
        <Text>{weather.weatherEmoji}</Text>
        <Text bold color={theme.colors.accent}> {tempDisplay}</Text>
      </Box>
      <Text color={theme.colors.text}>{weather.weatherDescription}</Text>
      <Box>
        <Text color={theme.colors.text}>💨 {weather.windSpeed} mph</Text>
      </Box>
      {weather.precipitation > 0 && (
        <Box>
          <Text color={theme.colors.text}>💧 {weather.precipitation} mm</Text>
        </Box>
      )}
    </Box>
  );
};

export default Weather;