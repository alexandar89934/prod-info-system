import cors from "cors";
import express from "express";
import helmet from "helmet";

import { config } from "./config/config";
import { successHandler, errorHandler } from "./config/morgan";
import {
  errorConverter,
  errorHandler as apiErrorHandler,
} from "./middlewares/error";
import { healthcheckRouter } from "./routes/healthcheck/healthcheck.route";

export const app = express();

if (config.env !== "test") {
  app.use(successHandler);
  app.use(errorHandler);
}

// Parse request body as json and set a limit of 1MB
app.use(express.json({ limit: "1mb" }));
// Parse urlencoded body and set a limit of 1MB
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
// Allow Node to get real IP address even if behind proxy
app.enable("trust proxy");

// Secure HTTP headers
app.use(helmet());
app.use(
  cors({
    origin: `${config.frontend.url}`.split(","),
    credentials: true,
    exposedHeaders: "token",
  }),
);

app.use("/", healthcheckRouter);

// Convert Error to ApiError if needed
app.use(errorConverter);

// Handle Errors
app.use(apiErrorHandler);
