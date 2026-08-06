import { z } from "zod";

export const weatherForecastSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  elevation: z.number(),
  hourly_units: z.object({
    time: z.string(),
    visibility: z.string(),
    cloud_cover: z.string(),
    precipitation: z.string(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    cloud_cover: z.array(z.number()),
    visibility: z.array(z.number()),
    precipitation: z.array(z.number()),
  }),
});

export type WeatherForecastResponse = z.infer<typeof weatherForecastSchema>;
