import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import Joi from "joi";

import { ApiError } from "../shared/error/ApiError";

export const validateRequestBody =
  (schema: Joi.ObjectSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const validationResult = schema.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      throw new ApiError(
        `Invalid Input, ${validationResult.error}`,
        httpStatus.BAD_REQUEST,
      );
    }

    next();
  };
