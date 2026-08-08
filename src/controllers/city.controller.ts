import { Request, Response, NextFunction } from "express";
import { formatResponseSuccess } from "../utils/responseFormatter.js";
import { cityService } from "../services/city.service.js";

export function getClosestCity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const city = req.body.city;

    const result = cityService.findClosestCity(city);

    res
      .status(200)
      .json(formatResponseSuccess("City found successfully", 200, result));
  } catch (err) {
    next(err);
  }
}
