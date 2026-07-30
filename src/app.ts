import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import { config } from "./config/index.js";
import {
  formatResponseError,
  formatResponseSuccess,
} from "./utils/responseFormatter.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middlewares
app.use(helmet());
app.use(hpp());
app.use(express.json({ limit: "10kb" }));
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// health check
app.get("/", (_req, res) => {
  const health = {
    root: { status: "UP", message: "Root External API Running Successfully" },
  };
  res
    .status(200)
    .json(formatResponseSuccess("Health check passed", 200, health));
});

// Catch-all 404 route
app.use((_req, res) => {
  res.status(404).json(formatResponseError("Route not found", 404));
});

// Error middleware
app.use(errorHandler);

export default app;
