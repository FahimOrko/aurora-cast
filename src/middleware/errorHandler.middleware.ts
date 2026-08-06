import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { formatResponseError } from "../utils/responseFormatter.js";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    logger.warn(err);
    res.status(err.code).json(formatResponseError(err.message, err.code));
    return;
  }

  logger.error(err);

  const message =
    config.env === "prod" ? "Something went wrong" : (err as Error).message;

  res.status(500).json(formatResponseError(message, 500));
};
