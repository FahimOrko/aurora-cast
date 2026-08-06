import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { getForecast } from "../controllers/forecast.controller.js";
import { forecastRequestSchema } from "../schemas/forecast.schema.js";

const forecastRouter = Router();

// GET /api/v1/aurora/forecast
forecastRouter.get(
  "/forecast",
  validate(forecastRequestSchema, "query"),
  getForecast,
);

export default forecastRouter;
