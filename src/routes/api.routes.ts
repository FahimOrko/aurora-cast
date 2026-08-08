import express from "express";
import forecastRouter from "./forecast.route.js";
import cityRouter from "./city.route.js";

const apiRoutes = express.Router();

// GET /api/v1/aurora/forecast
apiRoutes.use("/aurora", forecastRouter);
// POST /api/v1/cities/closest
apiRoutes.use("/cities", cityRouter);

export default apiRoutes;
