import { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import { AppError } from "../utils/AppError.js";

export function validate(
  schema: z.ZodType,
  source: "body" | "query" | "params",
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req[source]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues.map((issue) => issue.message).join(", ");

        return next(new AppError(message, 400));
      }

      next(err);
    }
  };
}
