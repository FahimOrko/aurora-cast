import { httpClient } from "./http.client.js";
import { config } from "../config/index.js";
import { AxiosError } from "axios";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import {
  type AuroraForecastResponse,
  auroraForecastSchema,
} from "../schemas/aurora.schema.js";
import { memoryCache } from "../cache/memoryCache.js";
import { CACHE_TTL } from "../constants/cache.js";

// ---------------------------------------------------------
// GET latest aurora forecast
// ---------------------------------------------------------
async function getAuroraForecast(): Promise<AuroraForecastResponse> {
  return memoryCache.wrap(
    "aurora:forecast",
    CACHE_TTL.AURORA_FORECAST_SEC,
    async () => {
      try {
        const forecastUrl = `${config.auroraApiBaseUrl}/kp/forecast`;

        const res = await httpClient.get<AuroraForecastResponse>(forecastUrl);

        const data = auroraForecastSchema.parse(res.data);
        return data;
      } catch (err) {
        if (err instanceof AxiosError) {
          throw new AppError("Failed to fetch aurora data", 503);
        }

        if (err instanceof ZodError) {
          const message = err.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");

          throw new AppError(`Invalid aurora API response: ${message}`, 502);
        }
        throw err;
      }
    },
  );
}
// ---------------------------------------------------------

export const auroraClient = {
  getAuroraForecast,
};
