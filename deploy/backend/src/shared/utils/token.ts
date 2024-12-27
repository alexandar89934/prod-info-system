import { Request } from "express";
import jwt from "jsonwebtoken";

import { ApiError } from "../error/ApiError";
import { AuthError } from "../error/AuthError";

import { config } from "./../../config/config";

export const encodeJWT = <T extends object>(
  objectToEncode: T,
  validity: string,
): string =>
  jwt.sign(objectToEncode, config.jwt.secret, { expiresIn: validity });

export const decodeJWT = <T extends object>(encodedToken: string): T => {
  let decodedToken: T;
  try {
    decodedToken = jwt.verify(encodedToken, config.jwt.secret) as T;
  } catch (e) {
    throw new ApiError(e);
  }

  return decodedToken;
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
