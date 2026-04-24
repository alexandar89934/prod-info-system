import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import multer from "multer";

import { config } from "../config/config";
import { logger } from "../config/logger";
import { createLogQuery } from "../models/log.model";
import { ApiError } from "../shared/error/ApiError";

type AnyError = Error & { statusCode?: number };

export const errorConverter = (err: AnyError, _req: Request, _res: Response, next: NextFunction) => {
  let error: AnyError = err;
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "File size exceeds the 10 MB limit"
        : `File upload error: ${error.message}`;
    error = new ApiError(message, httpStatus.BAD_REQUEST, true, err.stack);
  } else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode
      ? httpStatus.BAD_REQUEST
      : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || (httpStatus[statusCode] as string);
    error = new ApiError(message, statusCode, true, err.stack);
  }
  next(error);
};

/*  eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
export const errorHandler = (err: ApiError, _req: Request, res: Response, next: NextFunction) => {
  let { statusCode, message } = err;
  if (config.env !== "development" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  Object.assign(res.locals, { errorMessage: err.message });

  const response = {
    success: false,
    error: {
      code: statusCode || "500",
      message: message || "An unexpected error occurred",
    },
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (config.env === "development") {
    logger.error(err);
  }

  createLogQuery(message, err.stack);

  res.status(statusCode).send(response);
};
