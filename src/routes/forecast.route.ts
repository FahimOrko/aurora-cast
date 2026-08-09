import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { getForecast } from "../controllers/forecast.controller.js";
import { forecastRequestSchema } from "../schemas/forecast.schema.js";

const forecastRouter = Router();

// POST /api/v1/aurora/forecast
forecastRouter.post(
  "/forecast",
  validate(forecastRequestSchema, "body"),
  getForecast,
);

export default forecastRouter;
