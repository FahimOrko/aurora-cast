import { httpClient } from "./http.client.js";
import { config } from "../config/index.js";
import { AxiosError } from "axios";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import {
  weatherForecastSchema,
  type WeatherForecastResponse,
} from "../schemas/weather.schema.js";
import { WEATHER } from "../constants/weather.js";

// ---------------------------------------------------------
// GET weather forecast for a given latitude and longitude
// ---------------------------------------------------------
async function getWeatherForecast(
  latitude: number,
  longitude: number,
): Promise<WeatherForecastResponse> {
  try {
    const forecastUrl = `${config.weatherApiBaseUrl}/forecast`;
    const params = {
      latitude,
      longitude,
      ...WEATHER
    };

    const res = await httpClient.get<WeatherForecastResponse>(forecastUrl, {
      params,
    });

    const data = weatherForecastSchema.parse(res.data);
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      throw new AppError("Failed to fetch weather data", 503);
    }

    if (err instanceof ZodError) {
      const message = err.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");

      throw new AppError(`Invalid weather API response: ${message}`, 502);
    }
    throw err;
  }
}
// ---------------------------------------------------------

export const weatherClient = {
  getWeatherForecast,
};
