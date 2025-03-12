import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";

import { config } from "../config/config";
import { checkIfAdmin, checkIfUser } from "../service/user.service";
import { tryExtractTokenFromHeaders } from "../shared/utils/token";

export const authorizeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // eslint-disable-next-line no-param-reassign
    res.locals.user = tryExtractTokenFromHeaders(req);
    const isAdmin = await checkIfAdmin(res.locals.user.userId);
    if (!isAdmin) {
      res.status(httpStatus.UNAUTHORIZED).send({
        success: false,
        error: {
          code: httpStatus.UNAUTHORIZED,
          message: "This action requires administrator role.",
        },
      });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const verifyTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header("token");
  if (!token) {
    res.status(httpStatus.FORBIDDEN).send({
      success: false,
      error: {
        code: httpStatus.FORBIDDEN,
        message: "Token not provided",
      },
    });
    return;
  }

  try {
    jwt.verify(token, config.jwt.secret);
    const isValidUSer = await checkIfUser(token);
    if (!isValidUSer) {
      res.status(httpStatus.UNAUTHORIZED).send({
        success: false,
        error: {
          code: httpStatus.UNAUTHORIZED,
          message: "Token not valid for user",
        },
      });
      return;
    }
    next();
  } catch (ex: any) {
    if (ex.name === "TokenExpiredError") {
      res.status(httpStatus.UNAUTHORIZED).send({
        success: false,
        error: {
          code: httpStatus.UNAUTHORIZED,
          message: "Token expired",
          tokenExpired: true,
        },
      });
      return;
    }
    res
      .status(httpStatus.UNAUTHORIZED)
      .clearCookie("refreshToken")
      .send({
        success: false,
        error: {
          code: httpStatus.UNAUTHORIZED,
          message: "Token not valid",
        },
      });
  }
};
