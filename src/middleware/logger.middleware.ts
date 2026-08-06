import { pinoHttp } from "pino-http";
import { logger } from "../utils/logger.js";

export const httpLogger = pinoHttp({
  logger,

  customLogLevel(req, res, err) {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },

  customErrorMessage(req, res) {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },

  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },

    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
