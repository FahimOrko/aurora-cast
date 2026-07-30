import http from "http";
import app from "./app.js";
import { config } from "./config/index.js";

const server = http.createServer(app);

server.listen(config.port, () => {
  if (config.env !== "prod") {
    console.log(`Server is running on: http://localhost:${config.port}`);
  } else {
    console.log(`Server started on port ${config.port}`);
  }
});
