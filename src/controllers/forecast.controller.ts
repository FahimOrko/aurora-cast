import { Request, Response, NextFunction } from "express";
import { formatResponseSuccess } from "../utils/responseFormatter.js";

export async function getForecast(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { date, latitude, longitude } = req.query;

    const forecast = { date, latitude, longitude };

    res
      .status(200)
      .json(
        formatResponseSuccess("Forecast retrieved successfully", 200, forecast),
      );
  } catch (err) {
    next(err);
  }
}
