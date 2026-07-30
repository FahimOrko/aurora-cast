import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/appError.js";
import { formatResponseError } from "../utils/responseFormatter.js";
import { config } from "../config/index.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    res.status(err.code).json(formatResponseError(err.message, err.code));
    return;
  }

  console.error(err);

  const message =
    config.env === "prod" ? "Something went wrong" : (err as Error).message;

  res.status(500).json(formatResponseError(message, 500));
};
