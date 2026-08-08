import { z } from "zod";

export const closestCityRequestSchema = z.object({
  city: z.string().trim().min(1, "City name is required"),
});

export type ClosestCityInput = z.infer<typeof closestCityRequestSchema>;
