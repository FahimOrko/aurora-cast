import express from "express";
import forecastRouter from "./forecast.route.js";

const apiRoutes = express.Router();

// GET /api/v1/aurora/forecast
apiRoutes.use("/aurora", forecastRouter);

export default apiRoutes;
