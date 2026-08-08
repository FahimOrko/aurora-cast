import { AppError } from "../utils/AppError.js";
import { weatherClient } from "../clients/weather.client.js";
import type { WeatherForecastResponse } from "../schemas/weather.schema.js";

export type HourlyForecast = {
  time: string;
  cloudCover: number;
  visibility: number;
  precipitation: number;
};

function getDayForecast(
  weather: WeatherForecastResponse,
  date: string,
): HourlyForecast[] {
  return weather.hourly.time
    .map((time, index) => ({
      time,
      cloudCover: weather.hourly.cloud_cover[index],
      visibility: weather.hourly.visibility[index],
      precipitation: weather.hourly.precipitation[index],
    }))
    .filter((hour) => hour.time.startsWith(date));
}

function getNightForecast(
  weather: WeatherForecastResponse,
  dayForecast: HourlyForecast[],
  date: string,
): HourlyForecast[] {
  const dayIndex = weather.daily.time.findIndex((day) => day === date);

  if (dayIndex === -1) {
    return [];
  }

  const sunrise = weather.daily.sunrise[dayIndex];
  const sunset = weather.daily.sunset[dayIndex];

  return dayForecast.filter(
    (hour) => hour.time < sunrise || hour.time > sunset,
  );
}

async function getNightHoursForDates(
  dates: string[],
  latitude: number,
  longitude: number,
): Promise<Map<string, HourlyForecast[]>> {
  const weather = await weatherClient.getWeatherForecast(latitude, longitude);

  const result = new Map<string, HourlyForecast[]>();

  for (const date of dates) {
    const dayForecast = getDayForecast(weather, date);
    const nightForecast = getNightForecast(weather, dayForecast, date);

    if (nightForecast.length > 0) {
      result.set(date, nightForecast);
    }
  }

  if (result.size === 0) {
    throw new AppError("No nighttime weather data available.", 404);
  }

  return result;
}

export const weatherService = {
  getNightHoursForDates,
};
