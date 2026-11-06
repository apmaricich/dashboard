import { openWeatherWMOToEmoji } from '@akaguny/open-meteo-wmo-to-emoji';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherEmoji: string;
  weatherDescription: string;
  windSpeed: number;
}

const WMO_CODE_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export async function getCurrentWeather(
  latitude: number,
  longitude: number,
  temperatureUnit: 'celsius' | 'fahrenheit' = 'celsius'
): Promise<WeatherData> {
  const unitParam = temperatureUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=${unitParam}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.status}`);
  }

  const data = await response.json();
  const current = data.current_weather;

  if (!current) {
    throw new Error('No current weather data in response');
  }

  const weatherCode = Number(current.weathercode);
  const emojiData = openWeatherWMOToEmoji(weatherCode);

  return {
    temperature: current.temperature,
    weatherCode: weatherCode,
    weatherEmoji: emojiData.value,
    weatherDescription: emojiData.description,
    windSpeed: Number(current.windspeed),
  };
}

export function formatTemperature(temp: number, unit: 'celsius' | 'fahrenheit'): string {
  const symbol = unit === 'celsius' ? '°C' : '°F';
  return `${Math.round(temp)}${symbol}`;
}