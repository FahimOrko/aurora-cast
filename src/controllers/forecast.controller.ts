import { Request, Response, NextFunction } from "express";
import { forecastRequestSchema } from "../schemas/forecast.schema.js";
import { formatResponseSuccess } from "../utils/responseFormatter.js";
import { forecastService } from "../services/forecast.service.js";

export async function getForecast(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { date, latitude, longitude } = forecastRequestSchema.parse(
      req.query,
    );

    const forecast = await forecastService.getForecast(
      date,
      latitude,
      longitude,
    );

    res
      .status(200)
      .json(
        formatResponseSuccess("Forecast retrieved successfully", 200, forecast),
      );
  } catch (err) {
    next(err);
  }
}
