import { z } from "zod";

export const forecastRequestSchema = z.object({
  date: z.iso.date({
    error: "Date is required and must be in YYYY-MM-DD format",
  }),

  latitude: z.coerce
    .number({
      error: "Latitude is required",
    })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),

  longitude: z.coerce
    .number({
      error: "Longitude is required",
    })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

export type ForecastRequest = z.infer<typeof forecastRequestSchema>;
