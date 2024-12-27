import httpStatus from "http-status";

import { BaseError } from "./BaseError";

export class ApiError extends BaseError {
  constructor(
    message: string,
    statusCode: number = httpStatus.BAD_REQUEST,
    isOperational: boolean = true,
    stack: string = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
