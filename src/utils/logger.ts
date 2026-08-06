import pino from "pino";
import { config } from "../config/index.js";

export const logger = pino({
  level: config.env === "prod" ? "info" : "debug",

  transport:
    config.env === "prod"
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
});
