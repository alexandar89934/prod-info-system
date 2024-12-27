import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import Joi from "joi";

import { ApiError } from "../shared/error/ApiError";

export const validateRequestBody =
  (schema: Joi.ObjectSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const validationResult = schema.validate(req.body);

    if (validationResult.error) {
      throw new ApiError("Invalid Input", httpStatus.BAD_REQUEST);
    }

    next();
  };
