import { Request } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { sign, SignOptions } from "jsonwebtoken";

import { ApiError } from "../error/ApiError";
import { AuthError } from "../error/AuthError";

import { config } from "./../../config/config";

export const encodeJWT = <T extends object>(objectToEncode: T): string => {
  const { secret, validity } = config.jwt;

  const options: SignOptions = { expiresIn: Number(validity) };

  return sign(objectToEncode, secret, options);
};

export const encodeJWTRefresh = <T extends object>(
  objectToEncode: T,
): string => {
  const { secret, refreshValidity } = config.jwt;
  const options: SignOptions = {
    expiresIn: Number(refreshValidity),
    jwtid: crypto.randomUUID(),
  };

  return sign(objectToEncode, secret, options);
};

export const decodeJWT = <T extends object>(encodedToken: string): T => {
  try {
    return jwt.verify(encodedToken, config.jwt.secret) as T;
  } catch (error: any) {
    throw new ApiError(
      error.message || "Invalid token",
      error.name === "TokenExpiredError"
        ? httpStatus.UNAUTHORIZED
        : httpStatus.BAD_REQUEST,
    );
  }
};

export const tryExtractTokenFromHeaders = <T extends object>(
  request: Request,
): T => {
  const { token } = request.headers;

  if (!token) {
    throw new AuthError("No auth token provided");
  }

  const extractedToken = Array.isArray(token) ? token[0] : token;

  return decodeJWT(extractedToken);
};

export const readPayloadOfToken = <T extends object>(
  encodedToken: string,
): T => {
  return jwt.decode(encodedToken) as T;
};
