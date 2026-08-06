import dotenv from "dotenv";
import { z } from "zod";
import { logger } from "../utils/logger.js";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  ENVIRONMENT: z.enum(["dev", "prod", "test"]).default("dev"),
  CORS_ORIGIN: z.string().transform((val) => val.split(",")),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  process.exit(1);
}

export const config = {
  port: parsed.data.PORT,
  env: parsed.data.ENVIRONMENT,
  corsOrigin: parsed.data.CORS_ORIGIN,
};
