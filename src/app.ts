import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import { config } from "./config/index.js";
import {
  formatResponseError,
  formatResponseSuccess,
} from "./utils/responseFormatter.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { httpLogger } from "./middleware/logger.middleware.js";
import apiRoutes from "./routes/api.routes.js";

const app = express();

// --------------------
// Middlewares
// --------------------
// Security Middlewares
// --------------------
app.use(helmet());
app.use(hpp());
// --------------------
// Logger Middleware
// --------------------
app.use(httpLogger);
// --------------------
app.use(express.json({ limit: "10kb" }));
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
// --------------------

//
app.use("/api/v1", apiRoutes);

// health check
app.get("/", (_req, res) => {
  const health = {
    root: { status: "UP", message: "Root API Running Successfully" },
  };
  res
    .status(200)
    .json(formatResponseSuccess("Health check passed", 200, health));
});

// Catch-all 404 route
app.use((_req, res) => {
  res.status(404).json(formatResponseError("Route not found", 404));
});

// Error Middleware
app.use(errorHandler);

export default app;
