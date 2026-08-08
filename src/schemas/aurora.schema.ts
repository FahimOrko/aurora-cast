import { z } from "zod";

export const auroraForecastSchema = z.object({
  x: z.array(z.string()),
  y: z.array(z.number()),
});

export type AuroraForecastResponse = z.infer<typeof auroraForecastSchema>;
