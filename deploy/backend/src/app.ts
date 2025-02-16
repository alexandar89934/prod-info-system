import path from "path";

import cors from "cors";
import express from "express";
import helmet from "helmet";

import { config } from "./config/config";
import { successHandler, errorHandler } from "./config/morgan";
import {
  errorConverter,
  errorHandler as apiErrorHandler,
} from "./middlewares/error";
import { apiRouter } from "./routes/api";
import { healthcheckRouter } from "./routes/healthcheck/healthcheck.route";

export const app = express();

if (config.env !== "test") {
  app.use(successHandler);
  app.use(errorHandler);
}

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.enable("trust proxy");

app.use(helmet());
app.use(
  cors({
    origin: `${config.frontend.url}`.split(","),
    credentials: true,
    exposedHeaders: "token",
  }),
);

app.use("/", healthcheckRouter);
app.use("/api", apiRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(errorConverter);
app.use(apiErrorHandler);
