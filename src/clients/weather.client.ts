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
import { logger } from "../utils/logger.js";

// ---------------------------------------------------------
// GET weather forecast for a given latitude and longitude
// ---------------------------------------------------------
async function getForecast(
  latitude: number,
  longitude: number,
): Promise<WeatherForecastResponse> {
  try {
    const forecastUrl = `${config.weatherApiBaseUrl}/forecast`;
    const params = {
      latitude,
      longitude,
      hourly: WEATHER.hourly,
      models: WEATHER.model,
      forecast_days: WEATHER.forecastDays,
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
      throw new AppError("Invalid weather API response", 502);
    }

    throw err;
  }
}
// ---------------------------------------------------------

export const weatherClient = {
  getForecast,
};
