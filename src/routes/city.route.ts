import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { getClosestCity } from "../controllers/city.controller.js";
import { closestCityRequestSchema } from "../schemas/city.schema.js";

const cityRouter = Router();

// POST /api/v1/cities/closest
cityRouter.post(
  "/closest",
  validate(closestCityRequestSchema, "body"),
  getClosestCity,
);

export default cityRouter;
