import http from "http";
import app from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";

const server = http.createServer(app);

server.listen(config.port, () => {
  if (config.env !== "prod") {
    logger.info(`Server is running on: http://localhost:${config.port}`);
  } else {
    logger.info(`Server started on port ${config.port}`);
  }
});
